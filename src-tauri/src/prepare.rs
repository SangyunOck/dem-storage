use std::sync::Arc;
use tokio::sync::Mutex;
use tonic::transport::Channel;
use p2p::types::Node;
use proto::main_server_operations::ListAvailableNodesRequest;
use proto::main_server_operations::main_server_operations_client::MainServerOperationsClient;

pub async fn get_node_lists(client: Arc<Mutex<MainServerOperationsClient<Channel>>>) -> eyre::Result<Vec<Node>>{
    Ok(client.lock().await.list_available_nodes(ListAvailableNodesRequest{}).await?
        .into_inner()
        .nodes
        .into_iter()
        .map(|n| n.into())
        .collect())
}