use p2p::types::Node;

pub async fn get_available_nodes(url: String) -> eyre::Result<Vec<Node>> {
    Ok(reqwest::get(url).await?.json::<Vec<Node>>().await?)
}

