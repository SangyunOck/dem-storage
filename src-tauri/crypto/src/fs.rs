use async_channel::Sender;
use std::io::SeekFrom;
use tokio::fs::OpenOptions;
use tokio::io::{AsyncReadExt, AsyncSeekExt};

const BUF_SIZE: usize = 8192;

pub async fn stream_cipher(
    key: [u8; 32],
    nonce: [u8; 12],
    file_path: String,
    offset: u64,
    cipher_tx: Sender<Vec<u8>>,
) -> eyre::Result<()> {
    let mut buf = [0; BUF_SIZE];

    let mut file = OpenOptions::new().read(true).open(file_path).await?;
    file.seek(SeekFrom::Start(offset)).await?;
    loop {
        tokio::select! {
            Ok(n) = file.read(&mut buf) => {
                if n == 0 {
                    break;
                }
                else {
                    match super::encrypt_aes256gcm(key, nonce, &buf[..n]) {
                        Ok(cipher) => {
                            if let Err(e) = cipher_tx.send(cipher).await {
                                println!("cannot send encypted file: {e}");
                                break;
                            }
                        },
                        Err(e) => {
                            println!("error: {e}");
                            break;
                        }
                    }
                }
            },
            _ = tokio::task::yield_now() => {}
        }
    }

    Ok(())
}

#[cfg(test)]
mod test_crypto_fs {
    use crate::decrypt_aes256gcm;
    use crate::fs::stream_cipher;

    use async_channel::unbounded;

    #[tokio::test]
    async fn test_crypto_fs() -> eyre::Result<()> {
        let (tx, rx) = unbounded();
        let mut cipher_text = Vec::new();
        drop(tokio::spawn(stream_cipher(
            [0; 32],
            [0; 12],
            "src/lib.rs".to_string(),
            0,
            tx,
        )));
        while let Ok(msg) = rx.recv().await {
            cipher_text.extend(msg);
        }

        let plain_text = decrypt_aes256gcm([0; 32], [0; 12], cipher_text)?;

        println!("{}", String::from_utf8_lossy(&plain_text));
        Ok(())
    }
}
