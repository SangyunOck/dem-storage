use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Protocol {
    Upload(Upload),
    Download(Download),
    DownloadResp(DownloadResp),
    Abort,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UploadReq {
    pub peer_id: String,
    pub password: String,
    pub file_path: String,
    pub offset: u64,
    pub limit: u64,
    pub index: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Upload {
    pub peer_id: String,
    pub file_name: String,
    pub data: Vec<u8>,
    pub index: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Download {
    pub peer_id: String,
    pub file_name: String,
    pub index: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadReq {
    pub peer_id: String,
    pub file_name: String,
    pub index: u8,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadResp {
    pub file_name: String,
    pub data: Vec<u8>,
    pub index: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Command {
    Upload(UploadReq),
    DownloadReq(DownloadReq),
}

#[derive(Debug, Clone)]
pub struct Node {
    pub endpoint: String,
    pub peer_id: String,
}
#[derive(Debug, Clone)]
pub struct Chunk {
    pub chunk_size: u64,
    pub offset: u64,
    pub index: u64,
}

#[derive(Debug, Clone)]
pub struct ScheduledChunk {
    pub node: Node,
    pub chunk: Chunk,
}
