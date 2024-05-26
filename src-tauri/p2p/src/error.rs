use thiserror::Error;

#[derive(Error, Debug, Clone)]
pub enum Error {
    #[error("configuration error: {0}")]
    Configuration(String),
    #[error("connection error: {0}")]
    Connection(String),
    #[error("file error: {0}")]
    File(String),
    #[error("io error: {0}")]
    IO(String),
    #[error("invalid argument: {0}")]
    InvalidArgument(String),
    #[error("send stream error")]
    SendStream(#[from] quinn::WriteError),
    #[error("read exact error")]
    ReadExact(#[from] quinn::ReadExactError),
    #[error("invalid operation: {0}")]
    InvalidOperation(String),
    #[error("crypto error")]
    Crypto(#[from] crypto::Error),
    #[error("internal error: {0}")]
    Internal(String),
}

impl From<std::io::Error> for Error {
    fn from(value: std::io::Error) -> Self {
        Self::IO(value.to_string())
    }
}
