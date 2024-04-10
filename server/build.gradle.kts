import com.google.protobuf.gradle.id
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

val protobufPluginVersion = "0.9.4"
val grpcVersion = "1.62.2"
val protobufVersion = "3.25.3"
val grpcSpringBootStarterVersion = "3.0.0.RELEASE"
plugins {
    id("org.springframework.boot") version "3.2.4"
    id("io.spring.dependency-management") version "1.1.4"
    kotlin("jvm") version "1.9.23"
    kotlin("plugin.spring") version "1.9.23"

    // lint
    id("org.jlleitschuh.gradle.ktlint") version "11.0.0"

    // grpc
    id("com.google.protobuf") version "0.9.4"
    idea
}

group = "com"
version = "0.0.1-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_21
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    testImplementation("org.springframework.boot:spring-boot-starter-test")

    /**
     * [Logger 설정]
     *
     * Important note: kotlin-logging depends on slf4j-api (in the JVM artifact).
     * In runtime, it is also required to depend on a logging implementation.
     */
    // TBD

    /**
     * [gRPC 설정]
     *
     * io.grpc:protoc-gen-grpc-kotlin 은 코루틴 기반의 grpc 서비스 구현을 지원함.
     * 그래서 그냥 kotlin stub 안쓰기로함.
     *
     *  https://github.com/grpc/grpc-kotlin/tree/master/compiler 참고
     *
     *  Deprecated;
     *  val grpcKotlinVersion = "1.4.1"
     * 	implementation("io.grpc:grpc-kotlin-stub:$grpcKotlinVersion") // for generate kotlin stub
     * 	implementation("com.google.protobuf:protobuf-kotlin:$protobufVersion")
     *
     */
    implementation("javax.annotation:javax.annotation-api:1.3.2") // java stub에서 @javax.annotation.Generated 어노테이션 사용하고있어서 필요.
    implementation("io.grpc:grpc-protobuf:$grpcVersion")

    /**
     * https://github.com/grpc-ecosystem/grpc-spring 참고
     */
    implementation("net.devh:grpc-server-spring-boot-starter:$grpcSpringBootStarterVersion")
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs += "-Xjsr305=strict"
        jvmTarget = "21"
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

protobuf {
    protoc { // protobuf 컴파일러 설정
        artifact = "com.google.protobuf:protoc:$protobufVersion"
    }

    plugins {
        id("grpc") {
            artifact = "io.grpc:protoc-gen-grpc-java:$grpcVersion"
        }
    }

    generateProtoTasks {
        ofSourceSet("main").forEach {
            it.plugins {
                id("grpc")
                // 만약 kotlib-stub을 만들거라면 내부에서 java 클래스를 사용하므로, java class를 생성해야함.
            }
        }
    }
}

sourceSets {
    main {
        proto { // protobuf source 위치 설정
            srcDir("$projectDir/src/main/kotlin/proto")
        }
    }
}
