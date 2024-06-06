#! /bin/zsh

docker run --name dem-mysql -p 3306:3306 --mount type=bind,source=$(pwd)/init_sql,target=/docker-entrypoint-initdb.d -e MYSQL_HOST=localhost -e MYSQL_PORT=3306 -e MYSQL_USERNAME=root -e MYSQL_ROOT_PASSWORD=password -e TZ=Asia/Seoul -d mysql:8.0
docker run --name dem-server -p 8080:8080 -p 9090:9090 --link dem-mysql:db -d dem-server:latest