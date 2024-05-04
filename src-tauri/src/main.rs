// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use async_channel::unbounded;
use p2p::client::handler as client_handler;
use p2p::client::spin_up_client;
use p2p::server::handler as server_handler;
use p2p::server::spin_up_server;
use p2p::types::{Command, Init, UploadCmd};

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

    let _ = cmd_tx
        .send(Command::Init(Init {
            peer_id: "id".to_string(),
            file_name: "main.rs".to_string(),
            number_of_files: 1,
            total_length: 220,
        }))
        .await;

    let _ = cmd_tx
        .send(Command::Upload(UploadCmd {
            peer_id: "id".to_string(),
            password: "password".to_string(),
            file_path: "/Users/sangyun/Documents/workspace/dem-storage/src-tauri/src/main.rs".to_string(),
            offset: 0,
            index: 0,
        }))
        .await;

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
