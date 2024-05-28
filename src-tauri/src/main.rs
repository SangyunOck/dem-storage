// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use p2p::scheduler::get_scheduled_chunks;
use p2p::types::Node;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::State;
use tokio::sync::mpsc::unbounded_channel;

#[tauri::command]
async fn upload_handler<'a>(node2: State<'a, p2p::node::Node>) -> Result<(), ()> {
    // TODO: request nodes from main server
    let nodes = vec![
        Node {
            endpoint: "127.0.0.1:8080".to_string(),
            peer_id: "node_1".to_string(),
        },
        Node {
            endpoint: "127.0.0.1:8080".to_string(),
            peer_id: "node_1".to_string(),
        },
    ];

    let mut upload_handles = vec![];
    for sc in get_scheduled_chunks("/Users/sangyun/Documents/workspace/quic-p2p-transfer/target.zip", nodes).await.unwrap() {
        let handle = node2
            .upload_file(p2p::types::UploadFileRequest {
                node_id: "node_2".to_string(),
                password: "password".to_string(),
                file_path: sc.chunk.file_path,
                index: sc.chunk.index,
                offset: sc.chunk.offset,
                len: sc.chunk.chunk_size,
            },
             "127.0.0.1:8080".to_string(),
             "node_1".to_string())
            .await.unwrap();
        upload_handles.push(handle);
    }

    for t in upload_handles {
        t.await.unwrap();
    }

    Ok(())
}

#[tokio::main]
async fn main() -> eyre::Result<()> {
    let port = std::env::var("PORT")
        .unwrap_or_default()
        .parse()
        .unwrap_or(8080);

    let node1 = p2p::node::Node::new(
        "node_1".to_string(),
        PathBuf::from("/Users/sangyun/Documents/workspace/dem-storage/demo/server/"),
        PathBuf::from("/Users/sangyun/Documents/workspace/dem-storage/demo/client/"),
    );
    let (err_tx, _) = unbounded_channel();
    let node_1_handle = node1.spin_up(port, err_tx).await.unwrap();

    let node2 = Arc::new(p2p::node::Node::new(
        "node_2".to_string(),
        PathBuf::from("/Users/sangyun/Documents/workspace/dem-storage/demo/server/"),
        PathBuf::from("/Users/sangyun/Documents/workspace/dem-storage/demo/client/"),
    ));
    let (server_err_tx, _server_err_rx) = unbounded_channel();
    // TODO: create channel for client request
    let node_2_handle = node2.spin_up(9090, server_err_tx).await.unwrap();

    tauri::Builder::default()
        .manage(node2.clone())
        .invoke_handler(tauri::generate_handler![upload_handler])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    let nodes = vec![
        Node {
            endpoint: "127.0.0.1:8080".to_string(),
            peer_id: "node_1".to_string(),
        },
        Node {
            endpoint: "127.0.0.1:8080".to_string(),
            peer_id: "node_1".to_string(),
        },
    ];

    let mut download_handles = vec![];
    for sc in get_scheduled_chunks(
        "/Users/sangyun/Documents/workspace/quic-p2p-transfer/target.zip",
        nodes,
    )
    .await
    .unwrap()
    {
        let handle = node2
            .download_file(
                p2p::types::DownloadFileRequest {
                    node_id: node2.get_node_id(),
                    password: "password".to_string(),
                    file_name: "target.zip".to_string(),
                    index: sc.chunk.index,
                    offset: sc.chunk.offset,
                },
                "127.0.0.1:8080".to_string(),
                "node_1".to_string(),
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
