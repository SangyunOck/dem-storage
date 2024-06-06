pub mod error;
pub use error::Error;

use byteorder::ByteOrder;
use ring::aead::BoundKey;
use ring::aead::SealingKey;
use ring::aead::{Aad, NonceSequence, OpeningKey, UnboundKey, AES_256_GCM, NONCE_LEN};
use ring::error::Unspecified;
use std::cmp::Ordering;
use std::iter;

const AES_256_KEY_SIZE: usize = 32;
pub const AES_256_TAG_SIZE: usize = 16;

fn adjust_key(mut key: Vec<u8>) -> [u8; AES_256_KEY_SIZE] {
    let key = {
        match key.len().cmp(&AES_256_KEY_SIZE) {
            Ordering::Greater => key[..AES_256_KEY_SIZE].to_vec(),
            _ => {
                key.extend(iter::repeat(0).take(AES_256_KEY_SIZE - key.len()));
                key
            }
        }
    };

    // safety: already checked size
    key.try_into().unwrap()
}
pub async fn encrypt_aes_256(key: Vec<u8>, mut data: Vec<u8>, nonce: u64) -> Result<Vec<u8>, Error> {
    tokio::task::spawn_blocking(move || {
        Ok(data)
        // let key = adjust_key(key);
        // // safety: already checked size
        // let mut key = SealingKey::new(UnboundKey::new(&AES_256_GCM, &key).unwrap(), Nonce(nonce));
        // key.seal_in_place_append_tag(Aad::empty(), &mut data)
        //     .map_err(|e| Error::Encrypt(e.to_string()))?;
        // Ok(data.to_vec())
    }).await.map_err(|_| Error::Encrypt("cannot join thread".to_string()))?
}

pub async fn decrypt_aes_256(key: Vec<u8>, mut data: Vec<u8>, nonce: u64) -> Result<Vec<u8>, Error> {
    tokio::task::spawn_blocking(move || {
        // let key = adjust_key(key);
        // let mut key = OpeningKey::new(UnboundKey::new(&AES_256_GCM, &key).unwrap(), Nonce(nonce));
        // key.open_in_place(Aad::empty(), &mut data)
        //     .map_err(|e| Error::Decrypt(e.to_string()))?;
        // Ok(data[..data.len() - AES_256_TAG_SIZE].to_vec())
        Ok(data)
    }).await.map_err(|_| Error::Decrypt("cannot join thread".to_string()))?
}

struct Nonce(u64);
impl NonceSequence for Nonce {
    fn advance(&mut self) -> Result<ring::aead::Nonce, Unspecified> {
        let mut buf = [0; NONCE_LEN];
        byteorder::LittleEndian::write_u64(&mut buf, self.0);
        self.0 += 1;
        Ok(ring::aead::Nonce::assume_unique_for_key(buf))
    }
}
