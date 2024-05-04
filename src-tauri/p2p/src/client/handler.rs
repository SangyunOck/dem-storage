use crate::client::command_service::handle_command;
use crate::types::{Command, Protocol};
use std::time::Duration;

use async_channel::{Receiver, Sender};
use bytes::BytesMut;
use quinn::{RecvStream, SendStream};
use tokio::io::AsyncReadExt;

const BUF_SIZE: usize = 8192;

pub async fn handle_incoming_stream(
    mut recv_stream: RecvStream,
    resp_tx: Sender<Vec<u8>>,
    cmd_rx: Receiver<Command>,
) {
    let mut buf = BytesMut::with_capacity(BUF_SIZE);

    // init client
    // run only once
    if let Ok(cmd) = cmd_rx.recv().await {
        handle_command(cmd, resp_tx.clone()).await;
    }

    loop {
        tokio::select! {
            Ok(n) = recv_stream.read_buf(&mut buf) => {
                if n == 0 {
                     println!("broken pipe");
                    break;
                }
                if let Ok(msg) = serde_json::from_slice::<Protocol>(&buf) {
                    match msg {
                        Protocol::InitAck(init_ack) => {
                            println!("{:?}", init_ack);
                            if let Ok(cmd) = cmd_rx.recv().await {
                                handle_command(cmd, resp_tx.clone()).await;
                            }
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
