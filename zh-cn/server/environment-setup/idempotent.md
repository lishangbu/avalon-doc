# 配置幂等控制

`avalon-idempotent-spring-boot-starter` 提供的是一层偏基础设施的 Spring Boot 封装：

1. 通过 `@Idempotent` 注解声明幂等方法
2. 支持 Redis 和 JDBC 两种存储实现
3. 支持自动读取 HTTP 请求头 `Idempotency-Key`
4. 支持对执行中的长事务自动续约
5. 在重复请求时返回缓存结果，或者直接拒绝重复调用

当前实现基于 AOP 完成，业务代码只需要按场景选择 Key 来源和存储后端。

## 依赖

Maven：

```xml
<dependency>
  <groupId>io.github.lishangbu</groupId>
  <artifactId>avalon-idempotent-spring-boot-starter</artifactId>
  <version>${avalon.version}</version>
</dependency>
```

Gradle Kotlin DSL：

```kotlin
implementation("io.github.lishangbu:avalon-idempotent-spring-boot-starter:${avalonVersion}")
```

## 基础配置

幂等 Starter 的配置前缀是 `idempotent`：

```yaml
idempotent:
  enabled: true
  store-type: REDIS
  key-prefix: idempotent
  header-name: Idempotency-Key
  ttl: 24h
  processing-ttl: 5m
  renew-interval: 1m
  jdbc-table-name: idempotency_record
```

默认值：

- `enabled=true`
- `store-type=REDIS`
- `key-prefix=idempotent`
- `header-name=Idempotency-Key`
- `ttl=24h`
- `processing-ttl=5m`
- `renew-interval` 默认取 `processing-ttl / 3`
- `jdbc-table-name=idempotency_record`

## 选择存储后端

### Redis

默认后端就是 Redis，只需要提供 Redis 连接配置：

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
```

### JDBC

如果希望改用数据库存储，需要切换 `store-type`：

```yaml
idempotent:
  store-type: JDBC
  jdbc-table-name: idempotency_record
```

同时准备一张业务无关的幂等记录表，例如：

```sql
create table idempotency_record (
    idempotency_key varchar(255) primary key,
    status varchar(32) not null,
    token varchar(128) not null,
    cached_value text null,
    expires_at timestamp not null,
    created_at timestamp not null,
    updated_at timestamp not null
);
```

说明：

- JDBC 实现不会自动帮你建表
- `jdbc-table-name` 只支持字母、数字和下划线

## 如何使用

`@Idempotent` 目前有 3 个参数：

- `key`：可选，使用 SpEL 从方法参数中计算最终幂等 Key
- `prefix`：可选，用于区分业务操作
- `duplicateStrategy`：重复请求处理策略，支持 `REJECT` 和 `RETURN_CACHED`

## Key 的两种来源

### 1. 自动读取 `Idempotency-Key` 请求头

如果方法运行在 Web 请求线程中，并且你没有显式配置 `key`，Starter 会自动从当前请求头里读取 `Idempotency-Key`：

```kotlin
import io.github.lishangbu.avalon.idempotent.annotation.Idempotent
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class OrderApplicationService {
    @Transactional
    @Idempotent(prefix = "order:create")
    fun createOrder(command: CreateOrderCommand): OrderResponse {
        return OrderResponse(orderNo = command.orderNo, status = "CREATED")
    }
}
```

对应的 Controller：

```kotlin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/orders")
class OrderController(
    private val orderApplicationService: OrderApplicationService,
) {
    @PostMapping
    fun createOrder(
        @RequestHeader("Idempotency-Key") idempotencyKey: String,
        @RequestBody command: CreateOrderCommand,
    ): OrderResponse = orderApplicationService.createOrder(command)
}
```

这里 Controller 显式声明请求头，主要是为了接口契约更清晰；真正的幂等 Key 读取由 Starter 自动完成。

### 2. 使用 SpEL 显式指定 Key

如果不是 Web 请求线程，或者你希望幂等 Key 完全由业务参数决定，可以显式写 `key`：

```kotlin
import io.github.lishangbu.avalon.idempotent.annotation.Idempotent
import org.springframework.stereotype.Service

@Service
class CouponApplicationService {
    @Idempotent(key = "#command.couponNo", prefix = "coupon:grant")
    fun grantCoupon(command: GrantCouponCommand): GrantCouponResponse {
        return GrantCouponResponse(command.couponNo, "OK")
    }
}
```

## 返回缓存结果

如果希望已成功的重复请求直接返回第一次的结果，可以配置 `RETURN_CACHED`：

```kotlin
import io.github.lishangbu.avalon.idempotent.annotation.Idempotent
import io.github.lishangbu.avalon.idempotent.support.DuplicateStrategy

@Idempotent(
    prefix = "order:create",
    duplicateStrategy = DuplicateStrategy.RETURN_CACHED,
)
```

注意：

- `RETURN_CACHED` 依赖 Jackson 对返回值做序列化和反序列化
- 当前 Starter 按仓库约定使用 Jackson 3 的 `JsonMapper`
- 方法返回值应该是稳定的、可 JSON 序列化的对象

## 自动续约

Starter 会在方法执行期间按固定周期刷新“处理中”状态，避免长事务执行时间超过 `processing-ttl` 后被误判为过期。

默认规则：

- 如果未配置 `renew-interval`，默认取 `processing-ttl / 3`
- 最小续约周期为 `100ms`

例如：

```yaml
idempotent:
  processing-ttl: 5m
  renew-interval: 1m
```

如果方法处于事务中，成功状态会在事务提交后写入存储；在事务提交前，续约会持续进行。

## 重复请求时的行为

默认策略是 `REJECT`，行为如下：

1. 第一次请求：正常执行业务方法
2. 同一个 Key 的并发重复请求：抛出 `IdempotentConflictException`，状态为 `PROCESSING`
3. 已成功完成后的重复请求：抛出 `IdempotentConflictException`，状态为 `COMPLETED`
4. 方法执行异常：释放当前 Key，允许后续重试

## 建议的异常映射

Starter 只负责抛出领域异常，不会自动替你生成 HTTP 响应。建议在应用层统一转换：

```kotlin
import io.github.lishangbu.avalon.idempotent.exception.IdempotentConflictException
import io.github.lishangbu.avalon.idempotent.exception.IdempotentConflictState
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class IdempotentExceptionHandler {
    @ExceptionHandler(IdempotentConflictException::class)
    fun handle(ex: IdempotentConflictException): ResponseEntity<Map<String, String>> {
        val status =
            when (ex.state) {
                IdempotentConflictState.PROCESSING -> HttpStatus.CONFLICT
                IdempotentConflictState.COMPLETED -> HttpStatus.CONFLICT
            }
        return ResponseEntity
            .status(status)
            .body(mapOf("message" to ex.message.orEmpty(), "state" to ex.state.name))
    }
}
```

## 当前限制

当前版本仍然保留一些边界：

- 自动读取请求头只适用于当前线程持有 Web 请求上下文的场景
- JDBC 存储需要你自己建表和维护清理策略
- 目前还没有 MQ 消费幂等、分布式任务幂等等更高层封装
