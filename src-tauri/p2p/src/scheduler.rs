use crate::types::{Chunk, Node, ScheduledChunk};

use eyre::Result;
use itertools::Itertools;
use std::io::SeekFrom;
use tokio::fs::OpenOptions;
use tokio::io::AsyncSeekExt;

async fn get_file_offsets(file_path: &str, chunks: u64) -> Result<Vec<Chunk>> {
    let mut file = OpenOptions::new().read(true).open(file_path).await?;

    let mut offsets = vec![];
    let total_size = file.seek(SeekFrom::End(0)).await?;
    let mut size = total_size;
    let chunk_size = size / chunks + 1;
    let mut idx = 0;
    while size >= chunk_size {
        offsets.push(Chunk {
            file_path: file_path.to_string(),
            chunk_size,
            index: idx,
            offset: chunk_size * idx as u64,
            total_size,
        });
        size -= chunk_size;
        idx += 1;
    }

    offsets.push(Chunk {
        file_path: file_path.to_string(),
        chunk_size: size,
        index: idx,
        offset: chunk_size * idx as u64,
        total_size,
    });

    Ok(offsets)
}

pub async fn get_scheduled_chunks(
    file_path: &str,
    nodes: Vec<Node>,
) -> Result<Vec<ScheduledChunk>> {
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
