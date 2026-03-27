# Docker Compose 一键启动

项目本身不再在服务端仓库里维护 `compose.yaml`。

如果你需要本地一键启动，可以直接把下面文档中的示例保存为你自己的 `compose.yaml`。

## 启动前提

- 已安装 Docker Desktop 或 Docker Engine
- 已安装 Docker Compose Plugin
- 本机可以正常拉取配置里引用的镜像

## 启动方式

先新建一个 `compose.yaml`，内容如下：

```yaml
services:
  postgres:
    image: postgres:18-alpine
    container_name: postgres
    environment:
      POSTGRES_DB: avalon
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d avalon"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 10s
    restart: unless-stopped

  valkey:
    image: valkey/valkey:8-alpine
    container_name: valkey
    command: ["valkey-server", "--appendonly", "yes"]
    ports:
      - "6379:6379"
    volumes:
      - valkey-data:/data
    healthcheck:
      test: ["CMD", "valkey-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 5s
    restart: unless-stopped

  admin-server:
    image: slf4j/avalon-admin-server:latest
    container_name: admin-server
    depends_on:
      postgres:
        condition: service_healthy
      valkey:
        condition: service_healthy
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/avalon?currentSchema=public&sslmode=disable
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
      SPRING_DATA_REDIS_HOST: valkey
      SPRING_DATA_REDIS_PORT: "6379"
      OAUTH2_ISSUER_URL: http://localhost:8080
    ports:
      - "8080:8080"
    restart: unless-stopped

  standalone-server:
    image: slf4j/avalon-standalone-server:latest
    container_name: standalone-server
    depends_on:
      postgres:
        condition: service_healthy
      valkey:
        condition: service_healthy
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/avalon?currentSchema=public&sslmode=disable
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
      SPRING_DATA_REDIS_HOST: valkey
      SPRING_DATA_REDIS_PORT: "6379"
      OAUTH2_ISSUER_URL: http://localhost:8081
    ports:
      - "8081:8080"
    restart: unless-stopped

  admin-ui:
    image: slf4j/avalon-admin-ui:latest
    container_name: admin-ui
    depends_on:
      admin-server:
        condition: service_started
    environment:
      NGINX_API_PROXY_PASS: http://admin-server:8080/
    ports:
      - "3000:80"
    restart: unless-stopped

volumes:
  postgres-data:
  valkey-data:
```

然后在该文件所在目录执行：

```bash
docker compose up -d
```

说明：

- 示例中 PostgreSQL 和 Valkey 使用了容器健康检查
- Spring 应用容器未配置 healthcheck，按 `service_started` 依赖启动

默认会启动以下服务：

- `postgres`
- `valkey`
- `admin-server`
- `standalone-server`
- `admin-ui`

默认访问地址：

- 管理前端：`http://localhost:3000`
- 管理后端：`http://localhost:8080`
- Standalone 后端：`http://localhost:8081`
- PostgreSQL：`localhost:5432`
- Valkey：`localhost:6379`

查看日志：

```bash
docker compose logs -f
```

停止并删除容器：

```bash
docker compose down
```

如果希望连带删除数据库和 Valkey 的持久化数据卷：

```bash
docker compose down -v
```

## 这份 compose 做了什么

这份示例 `compose.yaml` 的职责如下：

1. 使用 PostgreSQL 作为主数据库
2. 使用 Valkey 支撑验证码、登录失败追踪等能力
3. 直接复用后端已发布镜像
4. 直接复用已发布的前端镜像
5. 在前端容器内部通过 `NGINX_API_PROXY_PASS` 开启 `/api` 到 `admin-server:8080` 的反向代理
6. 让前端等待 `admin-server` 启动后再启动

这样浏览器只访问 `http://localhost:3000`，前端请求 `/api/**` 时会由 Nginx 转发到后端容器，不需要在浏览器里直接写容器名。

## 前端镜像如何同时兼容发布和 compose

前端仓库没有再单独维护一份 compose 专用 Dockerfile。

现在统一使用原始 `Dockerfile` 和 `docker/nginx.conf` 构建并发布线上镜像，再通过运行时环境变量区分场景。

compose 场景直接拉线上镜像，并传入：

```dotenv
NGINX_API_PROXY_PASS=http://admin-server:8080/
```

当前发布镜像已经内置 `VITE_BASE_API_URL=/api`，因此前端请求会先打到 `/api/**`，再由容器内 Nginx 转发到后端容器。

如果是普通静态发布场景，不传 `NGINX_API_PROXY_PASS` 即可，此时镜像仍然只负责静态资源分发。

## 为什么 `SPRING_DATASOURCE_USERNAME` 这类环境变量能生效

这些名字不是项目单独发明出来的，而是 Spring Boot 外部配置绑定规则自动支持的环境变量写法。

例如下面这些配置项：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/avalon
    username: postgres
    password: postgres
  data:
    redis:
      host: localhost
      port: 6379
  profiles:
    active: dev

oauth2:
  issuer-url: http://localhost:8080
```

可以对应写成这些环境变量：

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_DATA_REDIS_HOST`
- `SPRING_DATA_REDIS_PORT`
- `SPRING_PROFILES_ACTIVE`
- `OAUTH2_ISSUER_URL`

Spring Boot 的常见转换规则是：

1. 全部转成大写
2. `.` 改成 `_`
3. `-` 改成 `_`

也就是说：

- `spring.datasource.username` -> `SPRING_DATASOURCE_USERNAME`
- `spring.datasource.password` -> `SPRING_DATASOURCE_PASSWORD`
- `spring.datasource.url` -> `SPRING_DATASOURCE_URL`
- `spring.data.redis.host` -> `SPRING_DATA_REDIS_HOST`
- `spring.profiles.active` -> `SPRING_PROFILES_ACTIVE`
- `oauth2.issuer-url` -> `OAUTH2_ISSUER_URL`

## 为什么 compose 里还要显式覆盖这些值

服务端仓库里的开发配置默认是本机直连：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/avalon?currentSchema=public&sslmode=disable
```

但在容器网络里，后端容器不能再用 `localhost` 访问数据库容器，因为：

- `localhost` 指向的是当前容器自己
- PostgreSQL 容器在 compose 网络里的服务名是 `postgres`
- Valkey 容器在 compose 网络里的服务名是 `valkey`

因此 compose 里会通过环境变量把连接地址覆盖为：

```yaml
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/avalon?currentSchema=public&sslmode=disable
SPRING_DATA_REDIS_HOST=valkey
```

环境变量优先级高于 `application-dev.yml` 里的默认值，所以容器启动时会自动使用 compose 传入的地址。

## 如何切换镜像来源

示例里直接写死了默认镜像地址，目的是保持配置简单直接。

如果后续需要切换到企业私有仓库或镜像代理，直接修改你本地 `compose.yaml` 中对应服务的 `image` 字段即可。

`docker.io` 作为默认 registry 可以省略不写，因此示例里统一使用了更短的镜像名。
