use crate::client::service::{handle_download_cmd, handle_download_resp, handle_upload_cmd};
use crate::consts::BUFF_SIZE;
use crate::types::{Command, Protocol};

use async_channel::{Receiver, Sender};
use bytes::BytesMut;
use moka::future::CacheBuilder;
use quinn::{RecvStream, SendStream};
use std::time::Duration;
use tokio::io::AsyncReadExt;

pub async fn handle_incoming_stream(
    mut recv_stream: RecvStream,
    resp_tx: Sender<Vec<u8>>,
    cmd_rx: Receiver<Command>,
) {
    let mut buf = BytesMut::with_capacity(BUFF_SIZE);
    let download_reqs = CacheBuilder::new(10_000)
        .time_to_live(Duration::from_secs(60 * 60 * 12))
        .time_to_idle(Duration::from_secs(60 * 60 * 12))
        .build();

    loop {
        tokio::select! {
            Ok(cmd) = cmd_rx.recv() => {
                match cmd {
                    Command::Upload(upload) => {
                        let resp_tx = resp_tx.clone();
                        drop(tokio::spawn(async move {
                            if let Err(e) = handle_upload_cmd(upload, resp_tx).await {
                                println!("failed to upload: {e}");
                            }
                        }));
                    },
                    Command::DownloadReq(download) => {
                        handle_download_cmd(download.clone(), resp_tx.clone()).await;
                        download_reqs.insert(format!("{}-{}", download.file_name, download.index), download).await;
                    }
                }
            },
            Ok(n) = recv_stream.read_buf(&mut buf) => {
                if n == 0 {
                     println!("broken pipe");
                    break;
                }
                if let Ok(msg) = serde_json::from_slice::<Protocol>(&buf) {
                    match msg {
                        Protocol::DownloadResp(download_resp) => {
                            if let Some(download_req) = download_reqs
                                .get(&format!(
                                    "{}-{}",
                                    download_resp.file_name, download_resp.index
                                ))
                                .await
                            {
                                drop(tokio::spawn(async move {
                                    if let Err(e) = handle_download_resp(download_resp, &download_req.password).await {
                                        println!("client - download failed: {e}");
                                    }
                                }));
                            }
                            buf.clear();
                        },
                        Protocol::Abort => break,
                        _ => println!("invalid message"),
                    }
                }
            }
            _ = tokio::task::yield_now() => {}
        }
    }
}

pub async fn handle_outgoing_stream(mut send_stream: SendStream, resp_rx: Receiver<Vec<u8>>) {
    loop {
        tokio::select! {
            Ok(msg) = resp_rx.recv() => {
                tokio::time::sleep(Duration::from_millis(10)).await;
                if let Err(e) = send_stream.write_all(msg.as_slice()).await {
                    println!("cannot write to client stream: {}", e);
                    break;
                }
            },
            stopped = send_stream.stopped() => {
                println!("stream stopped: {:?}", stopped);
                break;
            },
            _ = tokio::task::yield_now() => {}
        }
    }
}
