use crate::consts::{DEFAULT_FILE_READ_SIZE, DEFAULT_PROTOCOL_BUF_SIZE, DEFAULT_STREAM_READ_BUF_SIZE};
use crate::error::Error;
use crate::types::{
    get_init_header_from_stream, DownloadFileRequest, Header, ProtocolDownloadMetadata,
    ProtocolRequestDownloadHeader, ProtocolUploadHeader, UploadFileRequest,
};

use crypto::decrypt_aes_256;
use quinn::{RecvStream, SendStream};
use std::io::SeekFrom;
use std::path::Path;
use std::time::Duration;
use tokio::fs::{File, OpenOptions};
use tokio::io::{AsyncReadExt, AsyncSeekExt, AsyncWriteExt};

pub async fn upload_file(
    mut tx: SendStream,
    mut rx: RecvStream,
    upload_file_request: UploadFileRequest,
) -> Result<(), Error> {
    let file_name = Path::new(&upload_file_request.file_path)
        .file_name()
        .ok_or(Error::InvalidArgument(format!(
            "invalid file path: {:?}",
            upload_file_request.file_path
        )))?
        .to_str()
        .unwrap()
        .to_string();

    let mut file = OpenOptions::new()
        .read(true)
        .open(&upload_file_request.file_path)
        .await?;

    let upload_header = Header::UploadRequestHeader(ProtocolUploadHeader {
        node_id: upload_file_request.node_id,
        file_name,
        index: upload_file_request.index,
        len: upload_file_request.len,
    });

    let upload_header_ser = bincode::serialize(&upload_header).unwrap();
    tx.write(&upload_header_ser).await?;

    let header = get_init_header_from_stream(&mut rx).await?;
    println!("[client] got header: {:?}", header);
    read_file_and_write_to_stream(
        &mut file,
        upload_file_request.password,
        upload_file_request.len as usize,
        upload_file_request.offset,
        tx,
        rx
    )
    .await?;

    Ok(())
}

async fn read_file_and_write_to_stream(
    file: &mut File,
    password: String,
    mut len: usize,
    offset: u64,
    mut tx: SendStream,
    mut rx: RecvStream,
) -> Result<(), Error> {
    file.seek(SeekFrom::Start(offset)).await?;

    let mut buffer = Vec::with_capacity(DEFAULT_FILE_READ_SIZE);
    let mut nonce = 0;
    while let Ok(n) = file.read_buf(&mut buffer).await {
        if n == 0 {
            println!("[client] send to stream done: {:?}", file);
            break;
        }

        let target = n.min(len);
        println!("left to send: {len}");
        let encrypted = crypto::encrypt_aes_256(
            password.as_bytes().to_vec(),
            buffer[..target].to_vec(),
            nonce,
        ).await?;

        // TODO: read only for len
        // TODO: CAUTION - consider length after encryption
        println!("sending {}", encrypted.len());
        tx.write_all(&encrypted).await?;
        buffer.clear();

        if len < n {
            println!("[client] send to stream done: {:?}", file);
            break;
        }
        nonce += 1;
        len -= n;
    }

    buffer.clear();
    Ok(())
}

pub async fn download_file(
    mut tx: SendStream,
    mut rx: RecvStream,
    download_file_request: DownloadFileRequest,
    client_base_path: &Path,
) -> Result<(), Error> {
    let protocol_download_file_header =
        Header::DownloadRequestHeader(ProtocolRequestDownloadHeader {
            node_id: download_file_request.node_id,
            file_name: download_file_request.file_name,
            index: download_file_request.index,
            offset: download_file_request.offset,
        });

    let protocol_download_file_header_ser =
        bincode::serialize(&protocol_download_file_header).unwrap();
    tx.write(&protocol_download_file_header_ser).await?;

    let header = get_init_header_from_stream(&mut rx).await?;
    println!("[client] get header: {:?}", header);

    if let Header::DownloadMetadata(download_metadata) = header {
        read_from_stream_and_write_file(
            &mut rx,
            download_metadata,
            download_file_request.password,
            client_base_path,
        )
        .await?;
    }

    Ok(())
}

async fn read_from_stream_and_write_file(
    rx: &mut RecvStream,
    protocol_download_metadata: ProtocolDownloadMetadata,
    password: String,
    client_base_path: &Path,
) -> Result<(), Error> {
    let _ = tokio::fs::create_dir_all(client_base_path).await;

    let encrypted_path = client_base_path.join(format!(
        "{}-{}-encrypted",
        protocol_download_metadata.file_name, protocol_download_metadata.index,
    ));
    let plain_path = client_base_path.join(protocol_download_metadata.file_name);

    let mut encrypted_file = OpenOptions::new()
        .create(true)
        .read(true)
        .truncate(true)
        .write(true)
        .open(&encrypted_path)
        .await?;

    let mut plain_file = if plain_path.is_file() {
        OpenOptions::new().write(true).open(&plain_path).await?
    } else {
        OpenOptions::new()
            .create(true)
            .truncate(true)
            .write(true)
            .open(&plain_path)
            .await?
    };

    plain_file
        .seek(SeekFrom::Start(protocol_download_metadata.offset))
        .await?;

    let mut buffer = Vec::with_capacity(DEFAULT_STREAM_READ_BUF_SIZE);

    let mut read = 0;
    while let Ok(n) = rx.read_buf(&mut buffer).await {
        read += n;
        println!("[client] read: {read}");
        if n == 0 {
            println!("[client] download done");
            break;
        }
        let _ = encrypted_file.write_all(&buffer[..n]).await?;
        encrypted_file.flush().await?;
        buffer.clear();
    }

    println!("[client] decryption started");
    tokio::time::sleep(Duration::from_millis(100)).await;
    encrypted_file.rewind().await?;
    drop(buffer);
    let mut buffer = Vec::with_capacity(DEFAULT_FILE_READ_SIZE + crypto::AES_256_TAG_SIZE);

    let mut nonce = 0;
    while let Ok(n) = encrypted_file.read_buf(&mut buffer).await {
        if n == 0 {
            println!("[client] decryption done");
            break;
        }
        match decrypt_aes_256(password.as_bytes().to_vec(), buffer[..n].to_vec(), nonce).await {
            Ok(plain) => {
                let _ = plain_file.write_all(&plain).await?;
                plain_file.flush().await?;
                nonce += 1;
                println!("[client] decrypting: {n}");
                buffer.clear();
            }
            Err(e) => {
                println!("[client] decryption failed. reason={e}");
                break;
            }
        }
    }
    // tokio::fs::remove_file(&encrypted_path).await?;

    Ok(())
}
