use async_channel::Sender;
use std::cmp::Ordering;
use std::io::SeekFrom;
use tokio::fs::OpenOptions;
use tokio::io::{AsyncReadExt, AsyncSeekExt};

pub const BUFF_SIZE: u64 = 8192;

pub async fn stream_cipher(
    key: [u8; 32],
    nonce: [u8; 12],
    file_path: String,
    offset: u64,
    limit: u64,
    cipher_tx: Sender<Vec<u8>>,
) -> eyre::Result<()> {
    let mut buf = [0; BUFF_SIZE as usize];

    let mut file = OpenOptions::new().read(true).open(file_path).await?;
    file.seek(SeekFrom::Start(offset)).await?;
    let mut read = 0_u64;

    loop {
        tokio::select! {
            Ok(n) = file.read(&mut buf) => {
                if n == 0 {
                    break;
                }
                if read > limit {
                    break;
                }

                let target_bytes = match (read + n as u64).cmp(&limit) {
                    Ordering::Greater => {
                        limit - read
                    },
                    _ => n as u64
                };

                match super::encrypt_aes256gcm(key, nonce, &buf[..target_bytes as usize]) {
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
                read += n as u64;
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
            100,
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
