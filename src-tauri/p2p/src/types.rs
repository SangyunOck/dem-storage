use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Protocol {
    Init(Init),
    InitAck(InitAck),
    Upload(Upload),
    Download(Download),
    Abort,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum State {
    // file_name
    Init(Init),
    Uploading,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Init {
    pub peer_id: String,
    pub file_name: String,
    pub number_of_files: u16,
    pub total_length: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UploadCmd {
    pub peer_id: String,
    pub password: String,
    pub file_path: String,
    pub offset: u64,
    pub index: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitAck {
    pub server_id: String,
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
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadCmd {
    pub peer_id: String,
    pub file_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Command {
    Init(Init),
    Upload(UploadCmd),
    Download(DownloadCmd)
}
