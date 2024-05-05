use crate::types::{Download, DownloadResp, Protocol, Upload};

use async_channel::Sender;
use bytes::BytesMut;
use crypto::fs::BUFF_SIZE as CRYPTO_BUFF_SIZE;
use crypto::AES_GCM_TAG_SIZE;
use std::io::SeekFrom;
use tokio::fs::OpenOptions;
use tokio::io::{AsyncReadExt, AsyncSeekExt, AsyncWriteExt};

pub async fn handle_upload_msg(upload: Upload, storage_path: String) -> eyre::Result<()> {
    let file_path = format!(
        "{}/{}-{}-{}",
        storage_path, upload.peer_id, upload.file_name, upload.index
    );

    let mut file = if std::path::Path::new(&file_path).is_file() {
        OpenOptions::new().write(true).open(&file_path).await?
    } else {
        let _ = std::fs::create_dir_all(&storage_path);
        OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&file_path)
            .await?
    };

    file.seek(SeekFrom::Start(upload.offset)).await?;
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
    let mut buf = BytesMut::with_capacity((CRYPTO_BUFF_SIZE + AES_GCM_TAG_SIZE) as usize);

    let mut offset = 0;
    while let Ok(n) = file.read_buf(&mut buf).await {
        if n == 0 {
            break;
        }
        let download_resp = Protocol::DownloadResp(DownloadResp {
            file_name: download.file_name.clone(),
            data: buf.to_vec(),
            chunk_offset: download.chunk_offset,
            offset,
            index: download.index,
        });
        tx.send(serde_json::to_vec(&download_resp).unwrap()).await?;
        buf.clear();

        offset += n as u64 - AES_GCM_TAG_SIZE;
    }
    Ok(())
}
