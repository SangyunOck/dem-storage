use thiserror::Error;

#[derive(Clone, Error, Debug)]
pub enum Error {
    #[error("encrypt error: {0}")]
    Encrypt(String),
    #[error("decrypt error: {0}")]
    Decrypt(String),
}
