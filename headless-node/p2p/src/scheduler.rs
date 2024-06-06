use crate::error::Error;
use crate::types::{Chunk, Node, ScheduledChunk};

use itertools::Itertools;
use tokio::fs::OpenOptions;

async fn get_file_offsets(file_path: &str, chunks: u64) -> Result<Vec<Chunk>, Error> {
    let file = OpenOptions::new().read(true).open(file_path).await?;

    let total_size = file.metadata().await?.len();
    let chunk_size = total_size / chunks;
    let mut remainder = total_size % chunks;

    let mut offsets = vec![];
    let mut current_offset = 0;

    for index in 0..chunks {
        let mut current_chunk_size = chunk_size;

        if remainder > 0 {
            current_chunk_size += 1;
            remainder -= 1;
        }

        offsets.push(Chunk {
            file_path: file_path.to_string(),
            chunk_size: current_chunk_size + crypto::AES_256_TAG_SIZE as u64,
            offset: current_offset,
            index: index as u8,
        });

        current_offset += current_chunk_size;
    }

    Ok(offsets)
}

pub async fn get_scheduled_chunks(
    file_path: &str,
    nodes: Vec<Node>,
) -> Result<Vec<ScheduledChunk>, Error> {
    let node_len = nodes.len();
    let node_combinations = nodes
        .into_iter()
        .combinations(2.min(node_len))
        .collect_vec();
    let offsets = get_file_offsets(file_path, node_len as u64).await?;
    let mut offset_combinations = offsets
        .into_iter()
        .combinations(2.min(node_len))
        .collect_vec();
    offset_combinations.reverse();

    let mut scheduled_chunk = vec![];
    for (nodes, chunks) in node_combinations.into_iter().zip(offset_combinations) {
        for (node, chunk) in nodes.into_iter().zip(chunks) {
            scheduled_chunk.push(ScheduledChunk { node, chunk })
        }
    }

    Ok(scheduled_chunk)
}

pub async fn get_node_combinations(nodes: Vec<Node>) -> Vec<Node> {
    let node_len = nodes.len();
    nodes
        .into_iter()
        .combinations(2.min(node_len))
        .flatten()
        .collect_vec()
}

#[cfg(test)]
mod test {
    use crate::scheduler::get_scheduled_chunks;

    #[tokio::test]
    async fn test() {
        let nodes = vec![
            crate::types::Node {
                peer_id: "node_1".to_string(),
                endpoint: "".to_string(),
            },
            crate::types::Node {
                peer_id: "node_2".to_string(),
                endpoint: "".to_string(),
            },
        ];
        let chunks = get_scheduled_chunks(
            "/Users/sangyun/Documents/workspace/quic-p2p-transfer/target/release.zip",
            nodes,
        )
        .await
        .unwrap();
        println!("{:#?}", chunks);
    }
}
