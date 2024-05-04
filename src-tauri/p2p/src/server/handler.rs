use crate::consts::BUF_SIZE;
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
    let mut buf = BytesMut::with_capacity(BUF_SIZE);

    loop {
        tokio::select! {
            Ok(n) = recv_stream.read_buf(&mut buf) => {
                if n == 0 {
                    let _ = recv_stream.stop(VarInt::from_u32(1));
                    break;
                } else if let Ok(msg) = serde_json::from_slice::<Protocol>(&buf) {
                    match msg {
                        Protocol::Upload(upload) => {
                            drop(tokio::spawn(handle_upload_msg(upload, storage_path.clone())));
                            buf.clear();
                        },
                        Protocol::Download(download) => {
                            drop(tokio::spawn(handle_download_msg(download, storage_path.clone(), tx.clone())));
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
