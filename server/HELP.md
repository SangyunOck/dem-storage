# Getting Started


### 0. 도커 컴포즈 실행(DB INIT)
```bash
$ cd _local
$ docker-compose up -d
```

## 서버 실행하기
### 방법 1. 도커 이미지 만들어 실행하기
```bash
$ docker build -t dem-server .
```

### 방법 2. 로컬 명령어로 실행하기
```bash
$ ./gradlew build
$ java -jar build/libs/dem-server-0.0.1-SNAPSHOT.jar
```