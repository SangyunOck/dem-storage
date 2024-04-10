use std::net::SocketAddr;
use std::sync::Arc;
use quinn::{ClientConfig, Endpoint, Connection, SendStream};
use eyre::Result;

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

pub async fn handle_request(mut tx: SendStream) {
    for i in 0..10 {
        tx.write(b"abc").await.unwrap();
    }
}