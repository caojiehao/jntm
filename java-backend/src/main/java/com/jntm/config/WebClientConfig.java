package com.jntm.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * WebClient配置类
 * 配置HTTP客户端用于服务间通信
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Configuration
public class WebClientConfig {

    /**
     * 创建WebClient Bean
     * 配置连接池、超时等参数
     */
    @Bean
    public WebClient.Builder webClientBuilder() {
        // 配置连接池
        ConnectionProvider connectionProvider = ConnectionProvider.builder("jntm-connection-pool")
                .maxConnections(100)                    // 最大连接数
                .maxIdleTime(Duration.ofMinutes(5))     // 最大空闲时间
                .maxLifeTime(Duration.ofMinutes(10))    // 连接最大生命周期
                .pendingAcquireTimeout(Duration.ofSeconds(30))  // 获取连接超时
                .pendingAcquireMaxCount(200)             // 最大等待获取连接数
                .build();

        // 配置HTTP客户端
        HttpClient httpClient = HttpClient.create(connectionProvider)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)  // 连接超时
                .responseTimeout(Duration.ofSeconds(30))              // 响应超时
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(30, TimeUnit.SECONDS))    // 读取超时
                        .addHandlerLast(new WriteTimeoutHandler(30, TimeUnit.SECONDS)));  // 写入超时

        // 配置交换策略
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> {
                    // 配置JSON编解码器
                    configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024);  // 16MB
                })
                .build();

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .exchangeStrategies(strategies)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .defaultHeader("User-Agent", "JNTM-Java-Backend/1.0.0");
    }

}