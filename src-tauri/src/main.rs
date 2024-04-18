// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use p2p::client::spin_up_client;
use p2p::server::spin_up_server;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tokio::main]
async fn main() {
    let _ = spin_up_server(
        8080,
        |_tx| async move {
            // TODO: do some tx business logic here
            ()
        },
        |_rx| async move {
            // TODO: do some rx business logic here
            ()
        },
    )
    .await
    .unwrap();

    spin_up_client(
        "localhost".to_string(),
        "127.0.0.1:8080".to_string(),
        |_tx| async move {
            // TODO: do some tx business logic here
            ()
        },
        |_rx| async move {
            // TODO: do some rx business logic here
            ()
        },
    )
    .await
    .unwrap();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
