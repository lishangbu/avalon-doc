# 搭建本地仓库私服

项目采用分模块开发，因此为了在子模块也能运行maven的生命周期，例如package等，推荐搭建maven私服，以使用docker搭建maven私服为例。

## 使用docker搭建私服

要想搭建nexus，在docker的帮助下,可以简单地使用以下docker-compose文件:

```yaml
version: '2'
services:
  nexus:
    environment:
      TZ: Asia/Shanghai
    restart: always
    container_name: nexus
    image: sonatype/nexus3   
    volumes:
      - ./data:/nexus-data
    ports:
      - 5000:5000
      - 8081:8081
```

然后通过以下命令进行启动:
```bash
docker compose up -d --build
```
然后通过以下命令查看容器的运行情况:
```bash
docker compose logs -f
```

nexus整体较重，启动较慢。如果没有意外，在一段时间后（取决于电脑配置）可以在控制台看到类似输出:
```
nexus  | -------------------------------------------------
nexus  | 
nexus  | Started Sonatype Nexus OSS 3.72.0-04
nexus  | 
nexus  | -------------------------------------------------
```
这样就代表启动成功了。

启动成功后可以通过以下命令进入交互式终端:
```bash
docker exec -it nexus bash
```
通过以下命令获取初始密码:
```bash
 cat /nexus-data/admin.password
```
之后就可以通过admin/密码登录nexus了，首次登录后我们需要修改密码，假设修改为```admin123```


### 配置maven setting.xml

maven的配置文件默认应该在用户目录的.m2文件夹下的settings.xml中。
在servers块中添加以下内容:

```xml
  <servers>
    <server>
      <id>deploymentRepo</id>
      <username>admin</username>
      <password>admin123</password>
    </server>
  </servers>
```

这样就完成了私服的搭建，在项目中可以直接使用。