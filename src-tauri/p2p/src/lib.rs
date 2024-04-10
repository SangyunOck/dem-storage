mod server;
mod client;

use eyre::Result;
use tokio::task::JoinHandle;
use crate::client::handle_request;

pub async fn spin_up_server(port: u16) -> Result<()> {
    let addr = format!("0.0.0.0:{port}");
    let (ep, cert) = server::make_server(&addr)?;
    tokio::spawn(async move {
        while let Ok(connection) = ep.accept().await.unwrap().await {
            println!("accepting new client: {}", connection.remote_address());
            let stream = connection.accept_bi().await;
            let mut stream = match stream {
                Err(e) => {
                    println!("{:?}", e);
                    break;
                },
                Ok(s) => s,
            };

            while let Ok(Some(msg)) = stream.1.read_chunk(3, true).await {
                println!("{:?}", msg);
            }
        }
    });

    Ok(())
}

pub async fn spin_up_client(server_name: String, server_addr: String) -> Result<JoinHandle<()>> {
    let handle = tokio::spawn(async move {
        let connection = client::run_client(server_name, server_addr).await.unwrap();
        while let Ok((tx, rx)) = connection.open_bi().await {
            handle_request(tx).await;
        }
    });

    Ok(handle)
}