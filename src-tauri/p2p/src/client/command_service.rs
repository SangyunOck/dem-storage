use crate::types::{Download, DownloadReq, DownloadResp, Protocol, Upload, UploadReq};

use async_channel::{unbounded, Receiver, Sender};
use crypto::fs::stream_cipher;
use std::path::Path;
use tokio::fs::OpenOptions;
use tokio::io::AsyncWriteExt;
use tokio::task::JoinHandle;
use crypto::{decrypt_aes256gcm, split_password};

pub async fn handle_upload_cmd(upload_req: UploadReq, tx: Sender<Vec<u8>>) {
    let file_path = Path::new(&upload_req.file_path);
    let (_, cipher_rx) = handle_init_secret(upload_req.clone()).await;
    let file_name = file_path.file_name().unwrap().to_str().unwrap();

    while let Ok(data) = cipher_rx.recv().await {
        let upload_msg = Protocol::Upload(Upload {
            peer_id: upload_req.peer_id.clone(),
            file_name: file_name.to_string(),
            data,
            index: upload_req.index,
        });
        if let Err(e) = tx.send(serde_json::to_vec(&upload_msg).unwrap()).await {
            println!("cannot send cipher msg: {e}");
            break;
        }
    }
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
        cipher_tx.clone(),
    ));
    (handle, cipher_rx)
}

pub async fn handle_download_cmd(download_cmd: DownloadReq, tx: Sender<Vec<u8>>) {
    let download_msg = Protocol::Download(Download {
        peer_id: download_cmd.peer_id,
        file_name: download_cmd.file_name,
        index: download_cmd.index,
    });

    if let Err(e) = tx.send(serde_json::to_vec(&download_msg).unwrap()).await {
        println!("cannot send download msg: {e}");
    }
}

pub async fn handle_download_resp(download_resp: DownloadResp, password: &str) -> eyre::Result<()> {
    let base_path = std::env::var("BASE_PATH").unwrap_or(".".to_string());
    let file_path = format!("{}/{}-{}", base_path, download_resp.file_name, download_resp.index);

    let mut file = if Path::new(&file_path).is_file() {
        OpenOptions::new().append(true).open(&file_path).await?
    } else {
        OpenOptions::new()
            .append(true)
            .create_new(true)
            .open(&file_path)
            .await?
    };

    let (nonce, key) = split_password(password);
    let plain = decrypt_aes256gcm(key, nonce, &download_resp.data)?;
    file.write_buf(&mut plain.as_slice()).await?;

    Ok(())
}
