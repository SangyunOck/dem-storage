use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::mpsc::unbounded_channel;

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
    let handle = node.spin_up(port, server_err_tx).await?;
    handle.await?;

    Ok(())
}