use crate::types::{Init, InitAck, Protocol, State, Upload};

use moka::future::Cache;
use once_cell::sync::Lazy;
use tokio::fs::OpenOptions;
use tokio::io::AsyncWriteExt;
use tokio::sync::Mutex;

const MAX_PEERS: u64 = 10_000;

static CONNECTION_STATES: Lazy<Mutex<Cache<String, State>>> = Lazy::new(|| {
    let cache = Cache::new(MAX_PEERS);
    Mutex::new(cache)
});

pub async fn handle_init_msg(init: Init) -> Vec<u8> {
    CONNECTION_STATES
        .lock()
        .await
        .insert(init.peer_id.clone(), State::Init(init))
        .await;

    serde_json::to_vec(&Protocol::InitAck(InitAck {
        // TODO: get server id from somewhere
        server_id: "todo".to_string(),
    }))
    .unwrap()
}

pub async fn handle_upload_msg(upload: Upload, storage_path: String) {
    if let Some(State::Init(init)) = CONNECTION_STATES.lock().await.get(&upload.peer_id).await {
        if upload.file_name != init.file_name {
            return;
        }

        let file_path = format!("{}/{}-{}", storage_path, upload.file_name, upload.index);

        let mut file = if std::path::Path::new(&file_path).is_file() {
            OpenOptions::new()
                .append(true)
                .open(&file_path)
                .await
                .expect("cannot open file")
        } else {
            let _ = std::fs::create_dir_all(&storage_path);
            OpenOptions::new()
                .append(true)
                .create_new(true)
                .open(&file_path)
                .await
                .expect("cannot open file")
        };

        let _ = file.write_buf(&mut upload.data.as_slice()).await;
    }
}

#[cfg(test)]
mod test_service {
    use crate::server::service::handle_init_msg;
    use crate::types::{Init, Protocol};
    #[tokio::test]
    async fn test_serde_init_msg() -> eyre::Result<()> {
        let msg = Init {
            peer_id: "any peer".to_string(),
            file_name: "any file".to_string(),
            number_of_files: 5,
            total_length: 512,
        };

        let init_ack_bytes = handle_init_msg(msg).await;
        let init_ack = serde_json::from_slice::<Protocol>(&init_ack_bytes)?;
        println!("{:?}", init_ack);

        Ok(())
    }
}
