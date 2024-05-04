use crate::consts::BUF_SIZE;
use crate::types::{Download, DownloadResp, Protocol, Upload};

use async_channel::Sender;
use crypto::AES_GCM_TAG_SIZE;
use tokio::fs::OpenOptions;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

pub async fn handle_upload_msg(upload: Upload, storage_path: String) -> eyre::Result<()> {
    let file_path = format!(
        "{}/{}-{}-{}",
        storage_path, upload.peer_id, upload.file_name, upload.index
    );

    let mut file = if std::path::Path::new(&file_path).is_file() {
        OpenOptions::new().append(true).open(&file_path).await?
    } else {
        let _ = std::fs::create_dir_all(&storage_path);
        OpenOptions::new()
            .append(true)
            .create_new(true)
            .open(&file_path)
            .await?
    };

    file.write_buf(&mut upload.data.as_slice()).await?;
    Ok(())
}

pub async fn handle_download_msg(
    download: Download,
    storage_path: String,
    tx: Sender<Vec<u8>>,
) -> eyre::Result<()> {
    let file_path = format!(
        "{}/{}-{}-{}",
        storage_path, download.peer_id, download.file_name, download.index
    );
    let mut file = OpenOptions::new().read(true).open(&file_path).await?;

    let mut buf = [0; BUF_SIZE + AES_GCM_TAG_SIZE];
    while let Ok(n) = file.read(&mut buf).await {
        if n == 0 {
            break;
        }
        let download_resp = Protocol::DownloadResp(DownloadResp {
            file_name: download.file_name.clone(),
            data: buf[..n].to_vec(),
            index: download.index,
        });
        tx.send(serde_json::to_vec(&download_resp).unwrap()).await?;
    }

    Ok(())
}
