use crate::consts::{DEFAULT_FILE_READ_SIZE, DEFAULT_STREAM_READ_BUF_SIZE};
use crate::error::Error;
use crate::types::{Header, ProtocolDownloadMetadata, ProtocolOperationDone, ProtocolUploadHeader, ProtocolUploadReady};

use quinn::{RecvStream, SendStream};
use std::path::Path;
use tokio::fs::{File, OpenOptions};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

pub async fn handshake(
    tx: &mut SendStream,
    header: &Header,
    file: &mut Option<File>,
) -> Result<(), Error> {
    match header {
        Header::UploadRequestHeader(..) => {
            let upload_ready_ser =
                bincode::serialize(&Header::UploadReady(ProtocolUploadReady)).unwrap();
            tx.write(&upload_ready_ser).await?;
        }
        Header::DownloadRequestHeader(download_request_header) => {
            let len = match file {
                Some(f) => f.metadata().await?.len(),
                None => 0,
            };

            let metadata = Header::DownloadMetadata(ProtocolDownloadMetadata {
                valid: file.is_some(),
                file_name: download_request_header.file_name.to_string(),
                index: download_request_header.index,
                len,
                offset: download_request_header.offset,
            });
            let metadata_ser = bincode::serialize(&metadata).unwrap();
            tx.write(&metadata_ser).await?;
        }
        _ => (),
    }

    Ok(())
}

pub async fn handle_upload_file(
    mut rx: RecvStream,
    mut tx: SendStream,
    file: Option<File>,
    _protocol_upload_header: ProtocolUploadHeader,
) -> Result<(), Error> {
    println!("[server] handling upload file");
    let mut read = 0;
    let mut file = file.ok_or(Error::File("invalid file: cannot write".to_string()))?;
    let mut buffer = Vec::with_capacity(DEFAULT_STREAM_READ_BUF_SIZE);

    while let Ok(n) = rx.read_buf(&mut buffer).await {
        read += n;
        println!("[server] read: {}", read);
        if n == 0 {
            break;
        }
        file.write(&buffer[..n]).await?;
        buffer.clear();
    }

    tx.write(&bincode::serialize(&Header::OperationDone(ProtocolOperationDone)).unwrap()).await?;
    println!("[server] upload done");

    Ok(())
}

pub async fn handle_download_file(mut tx: SendStream, file: Option<File>) -> Result<(), Error> {
    println!("[server] handling download file");
    let mut file = file.ok_or(Error::File("invalid file: cannot read".to_string()))?;
    let mut buffer = Vec::with_capacity(DEFAULT_FILE_READ_SIZE + crypto::AES_256_TAG_SIZE);

    while let Ok(n) = file.read_buf(&mut buffer).await {
        if n == 0 {
            return Ok(());
        }
        tx.write(&buffer[..n]).await?;
        println!("[server] write: {}", n);
        buffer.clear();
    }

    Ok(())
}

pub async fn get_file_from_header(header: &Header, base_path: &Path) -> Result<File, Error> {
    match header {
        Header::UploadRequestHeader(upload_header) => {
            let node_id_path = base_path.join(&upload_header.node_id);
            let _ = tokio::fs::create_dir_all(&node_id_path).await;

            let path = base_path.join(&upload_header.node_id).join(format!(
                "{}-{}",
                upload_header.file_name, upload_header.index
            ));

            OpenOptions::new()
                .create(true)
                .truncate(true)
                .write(true)
                .open(&path)
                .await
                .map_err(|e| {
                    Error::File(format!("cannot create new file: {:?}, reason={}", path, e))
                })
        }
        Header::DownloadRequestHeader(download_request_header) => {
            let path = base_path
                .join(&download_request_header.node_id)
                .join(format!(
                    "{}-{}",
                    download_request_header.file_name, download_request_header.index
                ));

            OpenOptions::new()
                .read(true)
                .open(&path)
                .await
                .map_err(|e| Error::File(format!("cannot read file: {:?}, reason={}", path, e)))
        }
        _ => Err(Error::InvalidOperation(format!(
            "not supported for header: {:?}",
            header
        ))),
    }
}
