# 配置登录失败追踪

`LoginFailureTracker` 是 `avalon-oauth2-authorization-server` 内置的登录失败限制能力，用来在密码、短信、邮箱等登录流程中跟踪连续失败次数，并在达到阈值后临时锁定账号。

当前实现支持三种存储介质：

1. `MEMORY`：单机内存实现，默认值
2. `REDIS`：适合多实例部署
3. `JDBC`：适合需要落库或依赖数据库事务的场景

## 基础配置

配置前缀是 `oauth2`：

```yaml
oauth2:
  max-login-failures: 5
  login-lock-duration: 15m
  login-failure-tracker-store-type: MEMORY
  login-failure-tracker-key-prefix: oauth2:login-failure
  login-failure-tracker-jdbc-table-name: oauth2_login_failure
```

默认值：

- `max-login-failures=5`
- `login-lock-duration=15m`
- `login-failure-tracker-store-type=MEMORY`
- `login-failure-tracker-key-prefix=oauth2:login-failure`
- `login-failure-tracker-jdbc-table-name=oauth2_login_failure`

说明：

- 只有当 `max-login-failures > 0` 且 `login-lock-duration > 0` 时，登录失败追踪才会真正启用
- 登录成功后会清理当前用户的失败状态
- 锁定中的用户不会继续累积失败次数，直到锁定时间自然过期

## 选择存储介质

### MEMORY

默认实现，不需要额外基础设施：

```yaml
oauth2:
  login-failure-tracker-store-type: MEMORY
```

适用场景：

- 单机部署
- 本地开发
- 对登录失败状态跨节点一致性没有要求

### REDIS

如果你的授权服务是多实例部署，优先使用 Redis：

```yaml
oauth2:
  login-failure-tracker-store-type: REDIS
  login-failure-tracker-key-prefix: oauth2:login-failure
```

同时提供 Redis 连接配置：

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
```

说明：

- Redis 实现依赖 `StringRedisTemplate`
- 计数更新和锁定状态变更通过 Lua 脚本原子完成
- `login-failure-tracker-key-prefix` 用来隔离不同环境或不同业务系统的 Key 空间

### JDBC

如果希望把失败状态存到数据库，可以使用 JDBC：

```yaml
oauth2:
  login-failure-tracker-store-type: JDBC
  login-failure-tracker-jdbc-table-name: oauth2_login_failure
```

同时准备表结构：

```sql
create table oauth2_login_failure (
    username varchar(255) primary key,
    failure_count integer not null,
    lock_until timestamp null,
    created_at timestamp not null,
    updated_at timestamp not null
);
```

说明：

- JDBC 实现依赖 `JdbcTemplate` 和 `PlatformTransactionManager`
- 在 Spring Boot JDBC 场景下，通常只要正确配置数据源即可自动提供这两个 Bean
- `login-failure-tracker-jdbc-table-name` 只支持字母、数字和下划线

## 推荐选择

可以按部署方式直接选：

- 单机或本地开发：`MEMORY`
- 多实例、已有 Redis：`REDIS`
- 需要数据库审计或统一依赖数据库事务：`JDBC`

## 与认证流程的关系

`LoginFailureTracker` 已经接入授权服务内置的登录流程，包括：

- 密码登录
- 短信验证码登录
- 邮箱验证码登录

因此通常不需要你手动注入或显式调用它；大多数情况下只需要配置属性和基础设施即可。

## 常见问题

### 1. 为什么配置了属性但没有生效？

先检查这两个前提：

1. `max-login-failures` 是否大于 `0`
2. `login-lock-duration` 是否是合法且大于 `0` 的时长

如果任一条件不满足，跟踪器会处于禁用状态。

### 2. 为什么选择 `REDIS` / `JDBC` 后启动失败？

这是预期行为。当前自动配置会在缺少对应基础设施 Bean 时直接失败：

- `REDIS` 需要 `StringRedisTemplate`
- `JDBC` 需要 `JdbcTemplate`
- `JDBC` 还需要 `PlatformTransactionManager`

这样可以避免你误以为已经切换到分布式存储，但实际上仍然退回到本地内存。
