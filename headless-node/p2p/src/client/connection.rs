use crate::client::dummy_cert::SkipServerVerification;
use crate::error::Error;

use quinn::crypto::rustls::QuicClientConfig;
use quinn::{rustls, ClientConfig, Connection, Endpoint, RecvStream, SendStream, TransportConfig, VarInt};
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;

#[derive(Clone)]
pub struct ClientEndpoint {
    endpoint: Endpoint,
}

impl ClientEndpoint {
    pub async fn new() -> Result<Self, Error> {
        let provider = Arc::new(rustls::crypto::ring::default_provider());
        let mut endpoint = Endpoint::client("0.0.0.0:0".parse().unwrap())
            .map_err(|e| Error::Configuration(format!("client configuration error: {e}")))?;

        let mut client_config = ClientConfig::new(Arc::new(
            QuicClientConfig::try_from(
                rustls::ClientConfig::builder()
                    .dangerous()
                    .with_custom_certificate_verifier(SkipServerVerification::new(provider))
                    .with_no_client_auth(),
            )
                .unwrap(),
        ));

        let mut transport_config = Arc::new(TransportConfig::default());
        Arc::get_mut(&mut transport_config).map(|transport_config|
            transport_config
                .receive_window(VarInt::MAX)
                .stream_receive_window(VarInt::MAX)
                .send_window(u64::MAX)
        );
        client_config.transport_config(transport_config);
        println!("{:?}", client_config);
        tokio::time::sleep(Duration::from_secs(5)).await;
        endpoint.set_default_client_config(client_config);

        Ok(ClientEndpoint { endpoint })
    }

    pub async fn connect(
        &self,
        server_addr: SocketAddr,
        server_name: &str,
        max_retry: usize,
        backoff_in_sec: u64,
    ) -> Result<Connection, Error> {
        for _ in 0..max_retry {
            if let Ok(connecting) = self.endpoint.connect(server_addr, server_name) {
                if let Ok(connection) = connecting.await {
                    println!(
                        "[client] connected to server: addr={}",
                        connection.remote_address()
                    );
                    return Ok(connection);
                }
            }
            tokio::time::sleep(Duration::from_secs(backoff_in_sec)).await;
        }

        Err(Error::Connection("cannot connect to server".to_string()))
    }

    pub async fn open_bi(&self, connection: Connection) -> Result<(SendStream, RecvStream), Error> {
        connection
            .open_bi()
            .await
            .map_err(|e| Error::Connection(format!("cannot open bi stream: {}", e)))
    }
}
