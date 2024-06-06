use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UploadEventPayload {
    pub file_name: String,
}
