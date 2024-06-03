// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use p2p::scheduler::get_scheduled_chunks;
use p2p::types::Node;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::State;
use tokio::sync::mpsc::unbounded_channel;

#[tauri::command]
async fn upload_handler<'a>(
    node: State<'a, Arc<p2p::node::Node>>,
    upload_file_path: String,
) -> Result<(), ()> {
    // TODO: request nodes from main server
    let nodes = vec![Node {
        endpoint: "127.0.0.1:8080".to_string(),
        peer_id: "node_1".to_string(),
    }];

    let mut upload_handles = vec![];
    for sc in get_scheduled_chunks(&upload_file_path, nodes)
        .await
        .unwrap()
    {
        let handle = node
            .upload_file(
                p2p::types::UploadFileRequest {
                    node_id: node.get_node_id(),
                    password: "password".to_string(),
                    file_path: sc.chunk.file_path,
                    index: sc.chunk.index,
                    offset: sc.chunk.offset,
                    len: sc.chunk.chunk_size,
                },
                sc.node.endpoint.clone(),
                sc.node.peer_id.clone(),
            )
            .await
            .unwrap();
        upload_handles.push(handle);
    }

    for t in upload_handles {
        t.await.unwrap();
    }

    Ok(())
}

#[tauri::command]
async fn download_handler<'a>(
    node: State<'a, Arc<p2p::node::Node>>,
    download_file_path: String,
    download_file_name: String,
) -> Result<(), ()> {
    let nodes = vec![Node {
        endpoint: "127.0.0.1:8080".to_string(),
        peer_id: "node_1".to_string(),
    }];

    let mut download_handles = vec![];
    for sc in get_scheduled_chunks(&download_file_path, nodes)
        .await
        .unwrap()
    {
        let handle = node
            .download_file(
                p2p::types::DownloadFileRequest {
                    node_id: node.get_node_id(),
                    password: "password".to_string(),
                    file_name: download_file_name.clone(),
                    index: sc.chunk.index,
                    offset: sc.chunk.offset,
                },
                sc.node.endpoint.clone(),
                sc.node.peer_id.clone(),
            )
            .await
            .unwrap();
        download_handles.push(handle);
    }
    for h in download_handles {
        h.await.unwrap();
    }

    Ok(())
}

#[tokio::main]
async fn main() -> eyre::Result<()> {
    let port = std::env::var("PORT")
        .unwrap_or_default()
        .parse()
        .unwrap_or(8080);

    let server_base_path =
        std::env::var("SERVER_BASE_PATH").unwrap_or("./server-storage".to_string());
    let client_base_path =
        std::env::var("CLIENT_BASE_PATH").unwrap_or("./client-storage".to_string());

    let node = Arc::new(p2p::node::Node::new(
        "node".to_string(),
        PathBuf::from(server_base_path),
        PathBuf::from(client_base_path),
    ));
    let (server_err_tx, _server_err_rx) = unbounded_channel();
    let node_handle = node.spin_up(port, server_err_tx).await.unwrap();

    tauri::Builder::default()
        .manage(node.clone())
        .invoke_handler(tauri::generate_handler![upload_handler, download_handler])
        .plugin(tauri_plugin_store::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
