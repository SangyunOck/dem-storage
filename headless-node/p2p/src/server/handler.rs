use crate::error::Error;
use crate::server::service::{
    get_file_from_header, handle_download_file, handle_upload_file, handshake,
};
use crate::types::{get_init_header_from_stream, Header};

use quinn::{RecvStream, SendStream};
use std::path::Path;

pub async fn run_server_handler(
    mut tx: SendStream,
    mut rx: RecvStream,
    server_base_path: &Path,
) -> Result<(), Error> {
    let header = get_init_header_from_stream(&mut rx).await?;
    let mut file = get_file_from_header(&header, server_base_path).await.ok();
    println!("[server] file: {:?}", file);

    handshake(&mut tx, &header, &mut file).await?;

    // initialize done
    match header {
        Header::UploadRequestHeader(upload_header) => {
            handle_upload_file(rx, file, upload_header).await?
        }
        Header::DownloadRequestHeader(..) => handle_download_file(tx, file).await?,
        _ => {}
    }

    Ok(())
}
