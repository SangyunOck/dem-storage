mod command_service;
pub mod handler;

use crate::types::Command;

use async_channel::{unbounded, Receiver, Sender};
use eyre::Result;
use quinn::{ClientConfig, Connection, Endpoint, RecvStream, SendStream};
use std::future::Future;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::task::JoinHandle;

struct SkipServerVerification;

impl rustls::client::ServerCertVerifier for SkipServerVerification {
    fn verify_server_cert(
        &self,
        _end_entity: &rustls::Certificate,
        _intermediates: &[rustls::Certificate],
        _server_name: &rustls::ServerName,
        _scts: &mut dyn Iterator<Item = &[u8]>,
        _ocsp_response: &[u8],
        _now: std::time::SystemTime,
    ) -> std::result::Result<rustls::client::ServerCertVerified, rustls::Error> {
        Ok(rustls::client::ServerCertVerified::assertion())
    }
}

fn make_client_endpoint(addr: SocketAddr) -> Result<Endpoint> {
    let client_cfg = configure_client()?;
    let mut endpoint = Endpoint::client(addr)?;
    endpoint.set_default_client_config(client_cfg);
    Ok(endpoint)
}

fn configure_client() -> Result<ClientConfig> {
    let crypto = rustls::ClientConfig::builder()
        .with_safe_defaults()
        .with_custom_certificate_verifier(Arc::new(SkipServerVerification))
        .with_no_client_auth();

    Ok(ClientConfig::new(Arc::new(crypto)))
}

pub async fn run_client(server_name: String, server_addr: String) -> Result<Connection> {
    let client_addr = "0.0.0.0:0".parse()?;
    let server_addr = server_addr.parse()?;
    let client_ep = make_client_endpoint(client_addr)?;
    let connect = client_ep.connect(server_addr, &server_name)?;
    let connection = connect.await?;
    println!("client connected: addr={}", connection.remote_address());

    Ok(connection)
}
pub async fn spin_up_client<TxF, RxF, TxFut, RxFut>(
    server_name: String,
    server_addr: String,
    tx_task: TxF,
    rx_task: RxF,
    cmd_rx: Receiver<Command>,
) -> Result<JoinHandle<()>>
where
    TxF: Fn(SendStream, Receiver<Vec<u8>>) -> TxFut + Send + Sync + 'static,
    RxF: Fn(RecvStream, Sender<Vec<u8>>, Receiver<Command>) -> RxFut + Send + Sync + 'static,
    TxFut: Future<Output = ()> + Send + Sync + 'static,
    RxFut: Future<Output = ()> + Send + Sync + 'static,
{
    let handle = tokio::spawn(async move {
        if let Ok(connection) = run_client(server_name.clone(), server_addr.clone()).await {
            match connection.open_bi().await {
                Ok((tx_stream, rx_stream)) => {
                    let (msg_tx, msg_rx) = unbounded();
                    let tx_handle = tokio::spawn(tx_task(tx_stream, msg_rx));
                    let rx_handle = tokio::spawn(rx_task(rx_stream, msg_tx, cmd_rx));

                    tokio::select! {
                        e = connection.closed() => {
                            tx_handle.abort();
                            rx_handle.abort();
                            println!("connection closed{:?}", e);
                        }
                    }
                }
                Err(e) => {
                    println!("failed to open bi-direct connection: {e}");
                }
            }
        }
    });

    Ok(handle)
}
