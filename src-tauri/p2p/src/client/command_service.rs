use crate::types::{Command, UploadCmd, Protocol, Upload, Download};
use std::path::Path;

use async_channel::{unbounded, Receiver, Sender};
use crypto::fs::stream_cipher;
use tokio::task::JoinHandle;

pub async fn handle_command(cmd: Command, tx: Sender<Vec<u8>>) {
    match cmd {
        Command::Init(init) => {
            let init_msg = Protocol::Init(init);
            let serialized_init_msg = serde_json::to_vec(&init_msg).unwrap();
            if let Err(e) = tx.send(serialized_init_msg).await {
                println!("cannot send init msg: {e}");
            }
        },
        Command::Upload(upload_cmd) => {
            let file_path = Path::new(&upload_cmd.file_path);
            let (_, cipher_rx) = handle_init_secret(upload_cmd.clone()).await;
            let file_name = file_path.file_name().unwrap().to_str().unwrap();

            while let Ok(data) = cipher_rx.recv().await {
                let upload_msg = Protocol::Upload(Upload {
                    peer_id: upload_cmd.peer_id.clone(),
                    file_name: file_name.to_string(),
                    data,
                    index: upload_cmd.index,
                });
                if let Err(e) = tx.send(serde_json::to_vec(&upload_msg).unwrap()).await {
                    println!("cannot send cipher msg: {e}");
                    break;
                }
            }
        }
        Command::Download(download_cmd) => {
            let download_msg = Protocol::Download(Download {
                peer_id: download_cmd.peer_id,
                file_name: download_cmd.file_name,
            });

            if let Err(e) = tx.send(serde_json::to_vec(&download_msg).unwrap()).await {
                println!("cannot send download msg: {e}");
            }
        }
    }
}

async fn handle_init_secret(
    init_secret: UploadCmd,
) -> (JoinHandle<eyre::Result<()>>, Receiver<Vec<u8>>) {
    let password = init_secret.password;
    let password_length = password.len();
    let mut nonce = [0_u8; 12];
    let target_len = password_length.min(nonce.len());
    let nonce_bytes = &password.as_bytes()[..target_len];
    nonce[..target_len].copy_from_slice(nonce_bytes);

    let mut key = [0_u8; 32];
    let target_len = password_length.min(key.len());
    let key_bytes = &password.as_bytes()[..target_len];
    key[..target_len].copy_from_slice(key_bytes);

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
