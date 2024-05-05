// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use async_channel::unbounded;
use p2p::client::handler as client_handler;
use p2p::client::spin_up_client;
use p2p::scheduler::get_scheduled_chunks;
use p2p::server::handler as server_handler;
use p2p::server::spin_up_server;
use p2p::types::{Command, DownloadReq, Node, UploadReq};
use std::path::Path;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tokio::main]
async fn main() -> eyre::Result<()> {
    let port = std::env::var("PORT")
        .unwrap_or_default()
        .parse()
        .unwrap_or(8080);
    drop(
        spin_up_server(
            port,
            server_handler::handle_outgoing_stream,
            server_handler::handle_incoming_stream,
            // TODO: change storage path
            "/Users/sangyun/Documents/workspace/dem-storage".to_string(),
        )
        .await?,
    );

    // TODO: call spin up client in proper function
    let (cmd_tx, cmd_rx) = unbounded();
    drop(
        spin_up_client(
            "localhost".to_string(),
            "127.0.0.1:8080".to_string(),
            client_handler::handle_outgoing_stream,
            client_handler::handle_incoming_stream,
            cmd_rx,
        )
        .await?,
    );

    let nodes = vec![
        Node {
            endpoint: "".to_string(),
            peer_id: "1".to_string(),
        },
        Node {
            endpoint: "".to_string(),
            peer_id: "2".to_string(),
        },
        Node {
            endpoint: "".to_string(),
            peer_id: "3".to_string(),
        },
    ];

    let scheduled_chunks = get_scheduled_chunks(
        "/Users/sangyun/Documents/workspace/dem-storage/src-tauri/Cargo.toml",
        nodes,
    )
    .await?;

    for scheduled_chunk in &scheduled_chunks {
        let _ = cmd_tx
            .send(Command::Upload(UploadReq {
                peer_id: "id".to_string(),
                password: "password".to_string(),
                // TODO: change storage path
                file_path: scheduled_chunk.chunk.file_path.clone(),
                offset: scheduled_chunk.chunk.offset,
                limit: scheduled_chunk.chunk.chunk_size,
                index: scheduled_chunk.chunk.index,
            }))
            .await;
    }

    for scheduled_chunk in &scheduled_chunks {
        let file_name = Path::new(&scheduled_chunk.chunk.file_path)
            .file_name()
            .unwrap()
            .to_str()
            .unwrap();

        let _ = cmd_tx
            .send(Command::DownloadReq(DownloadReq {
                peer_id: "id".to_string(),
                file_name: file_name.to_string(),
                index: scheduled_chunk.chunk.index,
                chunk_offset: scheduled_chunk.chunk.offset,
                password: "password".to_string(),
            }))
            .await;
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
