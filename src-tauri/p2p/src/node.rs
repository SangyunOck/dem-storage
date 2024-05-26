use crate::client::connection::ClientEndpoint;
use crate::error::Error;
use crate::server::connection::{ServerEndpoint, ServerEndpointBuilder};
use crate::server::handler::run_server_handler;
use crate::types::{DownloadFileRequest, UploadFileRequest};

use parking_lot::Mutex;
use quinn::{Connection, IdleTimeout, VarInt};
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::mpsc::UnboundedSender;
use tokio::task::JoinHandle;

pub const MAX_RETRY: usize = 5;
pub const BACKOFF_IN_SECS: u64 = 5;

pub struct Node {
    node_id: String,
    server_endpoint: Mutex<Option<ServerEndpoint>>,
    client_endpoint: Mutex<Option<ClientEndpoint>>,
    server_base_path: PathBuf,
    client_base_path: PathBuf,
}

impl Node {
    pub fn new(node_id: String, server_base_path: PathBuf, client_base_path: PathBuf) -> Self {
        Self {
            node_id,
            server_endpoint: Mutex::new(None),
            client_endpoint: Mutex::new(None),
            server_base_path,
            client_base_path,
        }
    }

    pub fn get_node_id(&self) -> String {
        self.node_id.to_string()
    }

    pub async fn spin_up(
        &self,
        port: u16,
        server_err_tx: UnboundedSender<String>,
    ) -> Result<JoinHandle<()>, Error> {
        let addr = format!("0.0.0.0:{port}");
        println!("spinning up node: server={}", addr);

        let endpoint = ServerEndpointBuilder::new()?.build(
            |cfg| {
                let transport_config = Arc::get_mut(&mut cfg.transport).unwrap();
                transport_config.keep_alive_interval(Some(Duration::from_secs(10)));
                transport_config
                    .max_idle_timeout(Some(IdleTimeout::from(VarInt::from_u32(30_000))));
            },
            addr.parse().unwrap(),
        )?;
        *self.server_endpoint.lock() = Some(endpoint.clone());

        let server_base_path = self.server_base_path.clone();

        Ok(tokio::spawn(async move {
            loop {
                let server_base_path = server_base_path.clone();
                let server_err_tx = server_err_tx.clone();
                if let Ok((tx, rx)) = endpoint.accept_bi().await {
                    tokio::spawn(async move {
                        if let Err(e) = run_server_handler(tx, rx, &server_base_path).await {
                            let _ = server_err_tx.send(e.to_string());
                            println!("server handler stopped, reason={e}");
                        }
                    });
                }
            }
        }))
    }

    async fn connect_peer(
        &self,
        peer_endpoint: String,
        peer_id: String,
    ) -> Result<Connection, Error> {
        let client_endpoint = ClientEndpoint::new().await?;
        let peer_addr: SocketAddr = peer_endpoint
            .parse()
            .map_err(|e| Error::Connection(format!("invalid endpoint: {e}")))?;
        *self.client_endpoint.lock() = Some(client_endpoint.clone());

        let connection = client_endpoint
            .connect(peer_addr, &peer_id, MAX_RETRY, BACKOFF_IN_SECS)
            .await?;

        Ok(connection)
    }

    pub async fn upload_file(
        &self,
        upload_file_request: UploadFileRequest,
        peer_endpoint: String,
        peer_id: String,
    ) -> Result<JoinHandle<()>, Error> {
        let connection = self.connect_peer(peer_endpoint, peer_id).await?;

        let client_endpoint = self
            .client_endpoint
            .lock()
            .as_ref()
            .ok_or(Error::Connection(
                "client connection has not been established".to_string(),
            ))?
            .clone();

        Ok(tokio::spawn(async move {
            let (tx, rx) = client_endpoint
                .open_bi(connection)
                .await
                .expect("cannot open bi stream");
            // TODO: handle error or status to channel
            crate::client::service::upload_file(tx, rx, upload_file_request)
                .await
                .unwrap()
        }))
    }

    pub async fn download_file(
        &self,
        download_file_request: DownloadFileRequest,
        peer_endpoint: String,
        peer_id: String,
    ) -> Result<JoinHandle<()>, Error> {
        let connection = self.connect_peer(peer_endpoint, peer_id).await?;

        let client_endpoint = self
            .client_endpoint
            .lock()
            .as_ref()
            .ok_or(Error::Connection(
                "client connection has not been established".to_string(),
            ))?
            .clone();

        let client_base_path = self.client_base_path.clone();
        Ok(tokio::spawn(async move {
            let (tx, rx) = client_endpoint
                .open_bi(connection)
                .await
                .expect("cannot open bi stream");
            // TODO: handle error or status to channel
            crate::client::service::download_file(tx, rx, download_file_request, &client_base_path)
                .await
                .unwrap();
        }))
    }
}
