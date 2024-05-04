use crate::types::{Command, InitSecret, Protocol, Upload};
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
        }
        Command::InitSecret(init_secret) => {
            let file_path = Path::new(&init_secret.file_path);
            let (_, cipher_rx) = handle_init_secret(init_secret.clone()).await;
            let file_name = file_path.file_name().unwrap().to_str().unwrap();

            while let Ok(data) = cipher_rx.recv().await {
                let upload_msg = Protocol::Upload(Upload {
                    peer_id: init_secret.peer_id.clone(),
                    file_name: file_name.to_string(),
                    data,
                    index: init_secret.index,
                    next: !cipher_rx.is_closed(),
                });
                if let Err(e) = tx.send(serde_json::to_vec(&upload_msg).unwrap()).await {
                    println!("cannot send cipher msg: {e}");
                    break;
                }
            }
        }
    }
}

async fn handle_init_secret(
    init_secret: InitSecret,
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
