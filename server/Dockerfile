# docker build -t dem-server .
FROM amazoncorretto:21 AS builder
LABEL maintainer="dem-server"

WORKDIR /app
COPY . .
RUN ./gradlew build --no-daemon

# 실행 이미지 생성
FROM amazoncorretto:21
WORKDIR /app

# 빌드 결과 복사
COPY --from=builder /app/build/libs/server-0.0.1-SNAPSHOT.jar ./app.jar

# 애플리케이션 실행 명령어
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]