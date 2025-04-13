# 快速开始

在开始之前，您首先应该：

- 熟悉 Java 环境配置及其开发
- 熟悉 关系型 数据库，比如 Postgres
- 熟悉 [Spring Boot](https://spring.io/)
- 熟悉 Java 构建工具，比如 Maven

## 准备

- 一个JDK21环境
- 一款你熟悉的IDE或者编辑器，比如IntelliJ IDEA

### 下载项目

```bash
git clone  https://github.com/lishangbu/avalon
```

之后就可以使用IDE打开对应项目了，

### 生成运行必须的资源

从安全与git仓库占用等角度考虑，部分密钥以及IP数据库等大型文件并没有放入，因此在运行项目之前，需要执行项目根路径下的```scripts```文件夹中的```rsa-key-pair.sh```与```ip-data-downloader.sh```进行JWT RSA密钥生成与IP数据下载。

### 初始化数据库
项目本身采用的是```postgres```数据库,如果要更换其他数据库， 调整avalon-server的application.yml相关文件,并在avalon-server加入对应的数据库依赖，默认情况下，项目运行时会自动建表，如果需要改变这一行为，可以调整此处配置:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update #或者为 create,create-drop都能起到自动建表的效果
```

### 启动

执行avalon-server模块下的AvalonStandaloneServerApplication的main方法，IDE会启动一个可运行的Spring
Boot项目了。

为了开发体验，建议使用以下插件:

- [Lombok](https://plugins.jetbrains.com/plugin/6317-lombok)(高版本IntelliJ IDEA 内置此插件)
- [mapstruct-support](https://plugins.jetbrains.com/plugin/10036-mapstruct-support)