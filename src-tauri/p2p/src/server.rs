use std::sync::Arc;
use quinn::{Endpoint, ServerConfig};
use eyre::Result;

pub fn make_server(addr: &str) -> Result<(Endpoint, Vec<u8>)> {
    let addr = addr.parse()?;
    let (server_cfg, server_cert) = configure_server()?;
    let endpoint = Endpoint::server(server_cfg, addr)?;
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