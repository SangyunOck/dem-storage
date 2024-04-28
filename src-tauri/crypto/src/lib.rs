pub mod fs;

use aes_gcm::aead::{Aead, Nonce};
use aes_gcm::{Aes256Gcm, Key, KeyInit};
use eyre::eyre;

fn encrypt_aes256gcm(
    key: [u8; 32],
    nonce: [u8; 12],
    plain_text: impl AsRef<[u8]>,
) -> eyre::Result<Vec<u8>> {
    let cipher = Aes256Gcm::new(&Key::<Aes256Gcm>::from(key));
    let nonce = Nonce::<Aes256Gcm>::from(nonce);
    let cipher_text = cipher
        .encrypt(&nonce, plain_text.as_ref())
        .map_err(|e| eyre!("cannot encrypt plain text: {e}"))?;
    Ok(cipher_text)
}

fn decrypt_aes256gcm(
    key: [u8; 32],
    nonce: [u8; 12],
    cipher_text: impl AsRef<[u8]>,
) -> eyre::Result<Vec<u8>> {
    let cipher = Aes256Gcm::new(&Key::<Aes256Gcm>::from(key));
    let nonce = Nonce::<Aes256Gcm>::from(nonce);
    let plain_text = cipher
        .decrypt(&nonce, cipher_text.as_ref())
        .map_err(|e| eyre!("cannot decrypt cipher text: {e}"))?;
    Ok(plain_text)
}

#[cfg(test)]
mod test_crypto {
    use crate::encrypt_aes256gcm;

    #[test]
    fn test_encrypt() {
        let encrypted = encrypt_aes256gcm([0; 32], [0; 12], b"abc").unwrap();
        assert_eq!(
            encrypted,
            [175, 197, 35, 84, 16, 158, 246, 90, 47, 92, 203, 179, 240, 82, 9, 120, 20, 223, 60]
        );
    }
}