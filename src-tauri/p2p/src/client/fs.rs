use async_channel::unbounded;
use crypto::fs::stream_cipher;
use quinn::SendStream;
use tokio::io::AsyncWriteExt;

pub async fn encrypt_streaming(
    mut quic_tx_stream: SendStream,
    key: [u8; 32],
    nonce: [u8; 12],
    file_path: String,
) {
    let (cipher_tx, cipher_rx) = unbounded();
    drop(tokio::spawn(stream_cipher(
        key, nonce, file_path, cipher_tx,
    )));
    while let Ok(msg) = cipher_rx.recv().await {
        let _ = quic_tx_stream.write_buf(&mut msg.as_slice()).await;
    }
}
