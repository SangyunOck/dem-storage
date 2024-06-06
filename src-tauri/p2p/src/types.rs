use crate::consts::DEFAULT_INIT_BUF_SIZE;
use crate::error::Error;

use quinn::RecvStream;
use serde::{Deserialize, Serialize};
use tokio::io::AsyncReadExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Header {
    UploadRequestHeader(ProtocolUploadHeader),
    UploadReady(ProtocolUploadReady),
    DownloadRequestHeader(ProtocolRequestDownloadHeader),
    DownloadMetadata(ProtocolDownloadMetadata),
}

pub async fn get_init_header_from_stream(rx: &mut RecvStream) -> Result<Header, Error> {
    let mut init_buffer = Vec::with_capacity(DEFAULT_INIT_BUF_SIZE);
    let n = rx.read_buf(&mut init_buffer).await?;
    if n == 0 {
        return Err(Error::Connection("broken pipe".to_string()));
    }
    let header = bincode::deserialize::<Header>(&init_buffer).expect("invalid protocol");
    drop(init_buffer);
    Ok(header)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtocolUploadHeader {
    pub node_id: String,
    pub file_name: String,
    pub index: u8,
    pub len: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtocolUploadReady;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtocolRequestDownloadHeader {
    pub node_id: String,
    pub file_name: String,
    pub index: u8,
    pub offset: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtocolDownloadMetadata {
    pub valid: bool,
    pub file_name: String,
    pub index: u8,
    pub len: u64,
    pub offset: u64,
}

#[derive(Debug, Clone)]
pub struct UploadFileRequest {
    pub node_id: String,
    pub password: String,
    pub file_path: String,
    pub index: u8,
    pub offset: u64,
    pub len: u64,
}

#[derive(Debug, Clone)]
pub struct DownloadFileRequest {
    pub node_id: String,
    pub password: String,
    pub file_name: String,
    pub index: u8,
    pub offset: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub endpoint: String,
    pub peer_id: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chunk {
    pub file_path: String,
    pub chunk_size: u64,
    pub offset: u64,
    pub index: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduledChunk {
    pub node: Node,
    pub chunk: Chunk,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct AvailableNodes {
    pub peer_id: String,
    pub ip_address: String,
}

impl From<AvailableNodes> for Node {
    fn from(value: AvailableNodes) -> Self {
        Self {
            peer_id: value.peer_id,
            endpoint: value.ip_address,
        }
    }
}
