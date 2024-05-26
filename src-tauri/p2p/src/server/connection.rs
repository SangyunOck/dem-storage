use crate::error::Error;

use parking_lot::RwLock;
use quinn::rustls::pki_types::{CertificateDer, PrivatePkcs8KeyDer};
use quinn::{Connection, Endpoint, RecvStream, SendStream, ServerConfig};
use std::net::SocketAddr;
use std::sync::Arc;

pub struct ServerEndpointBuilder {
    config: ServerConfig,
}

#[derive(Clone)]
pub struct ServerEndpoint {
    endpoint: Endpoint,
    connections: Arc<RwLock<Vec<Connection>>>,
}

impl ServerEndpointBuilder {
    pub fn new() -> Result<Self, Error> {
        let cert = rcgen::generate_simple_self_signed(vec!["localhost".into()])
            .expect("fatal: cannot generate cert");
        let cert_der = CertificateDer::from(cert.cert);
        let priv_key = PrivatePkcs8KeyDer::from(cert.key_pair.serialize_der());
        let config = ServerConfig::with_single_cert(vec![cert_der.clone()], priv_key.into())
            .map_err(|e| Error::Configuration(format!("cannot generate server config: {e}")))?;

        Ok(Self { config })
    }

    pub fn build(
        mut self,
        mut f: impl FnMut(&mut ServerConfig),
        addr: SocketAddr,
    ) -> Result<ServerEndpoint, Error> {
        f(&mut self.config);
        let endpoint = Endpoint::server(self.config, addr)
            .map_err(|e| Error::Configuration(format!("failed to make server endpoint: {e}")))?;

        let connections = Arc::new(RwLock::new(Vec::<Connection>::new()));
        Ok(ServerEndpoint {
            endpoint,
            connections,
        })
    }
}

impl ServerEndpoint {
    pub async fn accept_bi(&self) -> Result<(SendStream, RecvStream), Error> {
        if let Some(incoming) = self.endpoint.accept().await {
            if let Ok(conn) = incoming.await {
                self.connections.write().push(conn.clone());
                println!(
                    "[server] connection accepted: addr={}",
                    conn.remote_address()
                );
                if let Ok((tx, rx)) = conn.accept_bi().await {
                    return Ok((tx, rx));
                }
            }
        }

        Err(Error::Connection("cannot accept bi stream".to_string()))
    }
}
