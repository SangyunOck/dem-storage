mod fs;

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
    let client_addr = "127.0.0.1:0".parse()?;
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
) -> Result<JoinHandle<()>>
where
    TxF: Fn(SendStream) -> TxFut + Send + Sync + 'static,
    RxF: Fn(RecvStream) -> RxFut + Send + Sync + 'static,
    TxFut: Future<Output = ()> + Send + Sync + 'static,
    RxFut: Future<Output = ()> + Send + Sync + 'static,
{
    let handle = tokio::spawn(async move {
        let connection = run_client(server_name, server_addr).await.unwrap();
        while let Ok((tx, rx)) = connection.open_bi().await {
            let tx_handle = tx_task(tx);
            let rx_handle = rx_task(rx);
            let _ = tokio::join!(tx_handle, rx_handle);
        }
    });

    Ok(handle)
}

#[cfg(test)]
mod client_test {
    use crate::client::spin_up_client;
    use crate::server::spin_up_server;

    use crate::client::fs::encrypt_streaming;
    use bytes::BytesMut;
    use std::time::Duration;
    use tokio::io::AsyncReadExt;

    #[tokio::test]
    async fn test_spin_up_client() -> eyre::Result<()> {
        let server_handle = tokio::spawn(spin_up_server(
            8080,
            |mut tx| async move {
                for i in 0..3 {
                    let _ = tx.write(format!("{i}-abc").as_bytes()).await;
                }
            },
            |mut rx| async move {
                let mut buf = BytesMut::with_capacity(4096);
                loop {
                    buf.clear();
                    tokio::select! {
                        Ok(n) = rx.read_buf(&mut buf) => {
                            if n == 0 {
                                break;
                            }
                            println!("{:?}", buf);
                        }
                    }
                }
            },
        ));

        let client_handle = spin_up_client(
            "local".to_string(),
            "127.0.0.1:8080".to_string(),
            |tx| async move {
                encrypt_streaming(tx, [0; 32], [0; 12], "src/client.rs".to_string()).await;
            },
            |mut rx| async move {
                while let Ok(Some(msg)) = rx.read_chunk(5, true).await {
                    println!("client: {:?}", msg);
                }
            },
        )
        .await?;

        tokio::time::sleep(Duration::from_secs(1)).await;

        server_handle.abort();
        client_handle.abort();
        Ok(())
    }
}
