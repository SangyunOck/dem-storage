// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod prepare;
mod types;

use crate::types::UploadEventPayload;

use once_cell::sync::Lazy;
use p2p::scheduler::{get_node_combinations, get_scheduled_chunks};
use p2p::types::Node;
use proto::main_server_operations::main_server_operations_client::MainServerOperationsClient;
use proto::main_server_operations::RegisterNodeRequest;
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::{State, Window};
use tokio::sync::mpsc::unbounded_channel;

// filename: (index, offset)
static UPLOADS: Lazy<Mutex<BTreeMap<String, (u8, u64)>>> =
    Lazy::new(|| Mutex::new(BTreeMap::new()));

fn get_file_name(path: &str) -> String {
    let path = Path::new(path);
    path.file_name().unwrap().to_str().unwrap().to_string()
}

#[tauri::command]
async fn upload_handler<'a>(
    node: State<'a, Arc<p2p::node::Node>>,
    window: Window,
    upload_file_path: String,
) -> Result<(), String> {
    // let router_server_url = std::env::var("ROUTER_SERVER").unwrap();
    // let peers = get_available_nodes(router_server_url).await.unwrap();

    let peers = vec![Node {
        endpoint: "192.168.238.241:8080".to_string(),
        peer_id: "node_1".to_string(),
    }];

    let mut upload_handles = vec![];
    for sc in get_scheduled_chunks(&upload_file_path, peers)
        .await
        .unwrap()
    {
        let file_name = get_file_name(&sc.chunk.file_path);
        UPLOADS
            .lock()
            .unwrap()
            .insert(file_name, (sc.chunk.index, sc.chunk.offset));

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

    let _ = window
        .emit(
            "upload-result",
            UploadEventPayload {
                file_name: get_file_name(&upload_file_path),
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn download_handler<'a>(
    node: State<'a, Arc<p2p::node::Node>>,
    download_file_name: String,
) -> Result<(), String> {
    // let router_server_url = std::env::var("ROUTER_SERVER").unwrap();
    // let peers = get_available_nodes(router_server_url).await.unwrap();

    let peers = vec![Node {
        endpoint: "192.168.238.241:8080".to_string(),
        peer_id: "node_1".to_string(),
    }];

    let mut download_handles = vec![];
    for sc in get_node_combinations(peers).await {
        let (index, offset) = UPLOADS
            .lock()
            .unwrap()
            .get(&download_file_name)
            .cloned()
            .unwrap_or((0, 0));
        let handle = node
            .download_file(
                p2p::types::DownloadFileRequest {
                    node_id: node.get_node_id(),
                    password: "password".to_string(),
                    file_name: download_file_name.clone(),
                    index,
                    offset,
                },
                sc.endpoint.clone(),
                sc.peer_id.clone(),
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

#[tauri::command]
async fn get_uploaded_files<'a>() -> Result<Vec<String>, String> {
    Ok(UPLOADS
        .lock()
        .unwrap()
        .iter()
        .map(|i| i.0)
        .cloned()
        .collect::<Vec<_>>())
}

#[tauri::command]
async fn register_node<'a>(
    mut routing_client: MainServerOperationsClient<tonic::transport::Channel>,
) -> Result<(), String> {
    routing_client
        .register_node(RegisterNodeRequest {
            node_ip: "".to_string(),
            peer_id: "".to_string(),
        })
        .await
        .map_err(|e| e.to_string())?;

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

    // let routing_server_url = std::env::var("ROUTING_SERVER").expect("router server env not found");
    // let router_client = MainServerOperationsClient::connect(routing_server_url)
    //     .await?;

    let node = Arc::new(p2p::node::Node::new(
        "node".to_string(),
        PathBuf::from(server_base_path),
        PathBuf::from(client_base_path),
    ));
    let (server_err_tx, _server_err_rx) = unbounded_channel();
    // drop(node.spin_up(port, server_err_tx));
    drop(node.spin_up(port, server_err_tx).await?);

    tauri::Builder::default()
        .manage(node.clone())
        // .manage(router_client)
        .invoke_handler(tauri::generate_handler![upload_handler, download_handler])
        .plugin(tauri_plugin_store::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
