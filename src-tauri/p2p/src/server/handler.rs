use crate::consts::BUFF_SIZE;
use crate::server::service::{handle_download_msg, handle_upload_msg};
use crate::types::Protocol;

use async_channel::{Receiver, Sender};
use bytes::BytesMut;
use quinn::{RecvStream, SendStream, VarInt};
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

pub async fn handle_incoming_stream(
    mut recv_stream: RecvStream,
    tx: Sender<Vec<u8>>,
    storage_path: String,
) {
    let mut buf = BytesMut::with_capacity(BUFF_SIZE);

    loop {
        tokio::select! {
            Ok(n) = recv_stream.read_buf(&mut buf) => {
                if n == 0 {
                    let _ = recv_stream.stop(VarInt::from_u32(1));
                    break;
                } else if let Ok(msg) = serde_json::from_slice::<Protocol>(&buf) {
                    match msg {
                        Protocol::Upload(upload) => {
                            let storage_path = storage_path.clone();
                            drop(tokio::spawn(async move {
                                println!(
                                    "server - handling upload request: peer-id: {}, file_name: {}, index: {}",
                                    upload.peer_id, upload.file_name, upload.index
                                );
                                if let Err(e) = handle_upload_msg(upload, storage_path).await {
                                    println!("upload failed: {e}");
                                }
                            }));
                            buf.clear();
                        },
                        Protocol::Download(download) => {
                            let storage_path = storage_path.clone();
                            let tx = tx.clone();
                            drop(tokio::spawn(async move {
                                println!(
                                    "server - handling download request: peer-id: {}, file_name: {}, index: {}",
                                    download.peer_id, download.file_name, download.index
                                );
                                if let Err(e) = handle_download_msg(download, storage_path, tx).await {
                                    println!("server - download failed: {e}");
                                }
                            }));
                            buf.clear();
                        },
                        Protocol::Abort => {
                            buf.clear();
                            break
                        },
                        _ => println!("invalid message"),
                    }
                }
            },
            _ = tokio::task::yield_now() => {}
        }
    }
}

pub async fn handle_outgoing_stream(mut send_stream: SendStream, rx: Receiver<Vec<u8>>) {
    loop {
        tokio::select! {
            Ok(msg) = rx.recv() => {
                tokio::time::sleep(Duration::from_millis(10)).await;
                if let Err(e) = send_stream.write_buf(&mut msg.as_slice()).await {
                    println!("cannot write to server stream: {}", e);
                    break;
                }
            },
            _ = tokio::task::yield_now() => {}
        }
    }
}
