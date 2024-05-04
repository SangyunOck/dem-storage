pub mod handler;
mod service;

use async_channel::{unbounded, Receiver, Sender};
use eyre::Result;
use quinn::{Endpoint, RecvStream, SendStream, ServerConfig};
use std::future::Future;
use std::sync::Arc;
use tokio::task::JoinHandle;

pub fn make_server(addr: &str) -> Result<(Endpoint, Vec<u8>)> {
    let addr = addr.parse()?;
    let (server_cfg, server_cert) = configure_server()?;
    let endpoint = Endpoint::server(server_cfg, addr)?;
    println!("server ready::{addr}");
    Ok((endpoint, server_cert))
}
fn configure_server() -> Result<(ServerConfig, Vec<u8>)> {
    let cert = rcgen::generate_simple_self_signed(vec!["localhost".into()]).unwrap();
    let cert_der = cert.serialize_der().unwrap();
    let priv_key = cert.serialize_private_key_der();
    let priv_key = rustls::PrivateKey(priv_key);
    let cert_chain = vec![rustls::Certificate(cert_der.clone())];

    let mut server_config = ServerConfig::with_single_cert(cert_chain, priv_key)?;
    let transport_config = Arc::get_mut(&mut server_config.transport).unwrap();
    transport_config.max_concurrent_uni_streams(0_u8.into());

    Ok((server_config, cert_der))
}

pub async fn spin_up_server<TxF, RxF, TxFut, RxFut>(
    port: u16,
    tx_task: TxF,
    rx_task: RxF,
    storage_path: String,
) -> Result<JoinHandle<()>>
where
    TxF: Fn(SendStream, Receiver<Vec<u8>>) -> TxFut + Send + Sync + 'static,
    RxF: Fn(RecvStream, Sender<Vec<u8>>, String) -> RxFut + Send + Sync + 'static,
    TxFut: Future<Output = ()> + Send + Sync + 'static,
    RxFut: Future<Output = ()> + Send + Sync + 'static,
{
    let addr = format!("0.0.0.0:{port}");
    let (ep, _) = make_server(&addr)?;

    let handle = tokio::spawn(async move {
        loop {
            if let Some(connecting) = ep.accept().await {
                match connecting.await {
                    Ok(connection) => {
                        println!("accepted new client: {}", connection.remote_address());
                        let stream = connection.accept_bi().await;
                        match stream {
                            Err(e) => println!("connection error: {e}"),
                            Ok((tx_stream, rx_stream)) => {
                                let (msg_tx, msg_rx) = unbounded();
                                let tx_handle = tokio::spawn(tx_task(tx_stream, msg_rx));
                                let rx_handle =
                                    tokio::spawn(rx_task(rx_stream, msg_tx, storage_path.clone()));
                                let _ = tokio::join!(tx_handle, rx_handle);
                            }
                        };
                    }
                    Err(e) => println!("connection error: {e}"),
                }
            }
        }
    });

    Ok(handle)
}
