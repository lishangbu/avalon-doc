# 搭建本地数据库

推荐使用docker搭建postgres数据库，以下是一个简单的docker-compose文件:
```yaml
services:
  postgres:
    image: postgres:latest
    container_name: postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: avalon # 可选，启用后不需要自己手动建库了
    ports:
      - "5432:5432"
    volumes:
      - ./data:/var/lib/postgresql/data
```

然后通过以下命令进行启动:
```bash
docker compose up -d --build
```
然后通过以下命令查看容器的运行情况:
```bash
docker compose logs -f
```