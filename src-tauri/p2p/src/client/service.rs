use crate::types::{Download, DownloadReq, DownloadResp, Protocol, Upload, UploadReq};

use async_channel::{unbounded, Receiver, Sender};
use crypto::fs::stream_cipher;
use crypto::{decrypt_aes256gcm, split_password};
use eyre::eyre;
use std::io::SeekFrom;
use std::path::Path;
use tokio::fs::{File, OpenOptions};
use tokio::io::{AsyncSeekExt, AsyncWriteExt};
use tokio::task::JoinHandle;

pub async fn handle_upload_cmd(upload_req: UploadReq, tx: Sender<Vec<u8>>) -> eyre::Result<()> {
    let file_path = Path::new(&upload_req.file_path);
    let (_, cipher_rx) = handle_init_secret(upload_req.clone()).await;
    let file_name = file_path.file_name().unwrap().to_str().unwrap();

    let mut offset = 0;
    while let Ok(data) = cipher_rx.recv().await {
        let data_len = data.len() as u64;
        let upload_msg = Protocol::Upload(Upload {
            peer_id: upload_req.peer_id.clone(),
            file_name: file_name.to_string(),
            data,
            offset,
            index: upload_req.index,
        });
        if let Err(e) = tx.send(serde_json::to_vec(&upload_msg).unwrap()).await {
            println!("cannot send cipher msg: {e}");
            return Err(eyre!("cannot send cipher msg: {e}"));
        }
        offset += data_len;
    }

    Ok(())
}

async fn handle_init_secret(
    init_secret: UploadReq,
) -> (JoinHandle<eyre::Result<()>>, Receiver<Vec<u8>>) {
    let (nonce, key) = split_password(&init_secret.password);
    let (cipher_tx, cipher_rx) = unbounded();
    let handle = tokio::spawn(stream_cipher(
        key,
        nonce,
        init_secret.file_path,
        init_secret.offset,
        init_secret.limit,
        cipher_tx.clone(),
    ));
    (handle, cipher_rx)
}

pub async fn handle_download_cmd(download_cmd: DownloadReq, tx: Sender<Vec<u8>>) {
    let download_msg = Protocol::Download(Download {
        peer_id: download_cmd.peer_id,
        file_name: download_cmd.file_name,
        chunk_offset: download_cmd.chunk_offset,
        index: download_cmd.index,
    });

    if let Err(e) = tx.send(serde_json::to_vec(&download_msg).unwrap()).await {
        println!("cannot send download msg: {e}");
    }
}

pub async fn handle_download_resp(download_resp: DownloadResp, password: &str) -> eyre::Result<()> {
    let base_path = std::env::var("BASE_PATH").unwrap_or(".".to_string());
    let _ = tokio::fs::create_dir_all(&base_path).await;

    let whole_file_path = format!(
        "{}/{}",
        base_path,
        download_resp
            .file_name
            .split('-')
            .next()
            .ok_or(eyre!("wrong file name"))?
    );
    let mut whole_file = create_or_open_file(&whole_file_path).await?;
    whole_file
        .seek(SeekFrom::Start(
            download_resp.offset + download_resp.chunk_offset,
        ))
        .await?;
    let (nonce, key) = split_password(password);
    let plain = decrypt_aes256gcm(key, nonce, &download_resp.data)?;

    whole_file.write_buf(&mut plain.as_slice()).await?;

    Ok(())
}

async fn create_or_open_file(file_path: &str) -> eyre::Result<File> {
    let file = if Path::new(&file_path).is_file() {
        OpenOptions::new()
            .read(true)
            .write(true)
            .open(&file_path)
            .await?
    } else {
        OpenOptions::new()
            .read(true)
            .write(true)
            .create_new(true)
            .open(&file_path)
            .await?
    };

    Ok(file)
}
