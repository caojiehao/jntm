# 使用官方OpenJDK 17作为基础镜像
FROM openjdk:17-jre-slim

# 设置工作目录
WORKDIR /app

# 安装必要的工具
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 创建应用用户
RUN groupadd -r jntm && useradd -r -g jntm jntm

# 复制Maven构建的jar文件
# 假设使用多阶段构建或者外部构建
COPY target/jntm-backend-1.0.0.jar app.jar

# 创建必要的目录
RUN mkdir -p /app/uploads /app/logs && \
    chown -R jntm:jntm /app

# 切换到应用用户
USER jntm

# 暴露端口
EXPOSE 5080

# 设置JVM参数
ENV JAVA_OPTS="-Xmx1g -Xms512m -XX:+UseG1GC -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# 设置应用参数
ENV SPRING_PROFILES_ACTIVE=prod

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5080/api/v1/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]