use crate::server::service::{handle_init_msg, handle_upload_msg};
use crate::types::Protocol;

use async_channel::{Receiver, Sender};
use bytes::BytesMut;
use quinn::{RecvStream, SendStream, VarInt};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

const BUF_SIZE: usize = 8192;

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
                            Protocol::Init(init) => {
                                let resp = handle_init_msg(init).await;
                                let _ = tx.send(resp).await;
                                buf.clear();
                            },
                            Protocol::Upload(upload) => {
                                handle_upload_msg(upload, storage_path.clone()).await;
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
                if let Err(e) = send_stream.write_buf(&mut msg.as_slice()).await {
                    println!("cannot write to server stream: {}", e);
                    break;
                }
            },
            _ = tokio::task::yield_now() => {}
        }
    }
}
