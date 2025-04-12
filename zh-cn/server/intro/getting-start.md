# 快速开始

在开始之前，您首先应该：

- 熟悉 Java 环境配置及其开发
- 熟悉 关系型 数据库，比如 Postgres
- 熟悉 [Spring Boot](https://spring.io/)
- 熟悉 Java 构建工具，比如 Maven

**⚠️注意**

项目大量使用了Java
APT技术，包括[lombok](https://www.projectlombok.org/)、[MapStruct](https://mapstruct.org/)
因此在项目未编译前爆错是很正常的,只需要执行一次编译即可。

以下方式随意选择一个就行

- 可以使用以下命令编译项目:

```bash
mvn compile
```

此命令会编译 src/main/java 目录中的源代码。

- 编译并跳过测试:

```bash
mvn compile -DskipTests
```

如果你希望在编译时跳过测试阶段，可以使用此命令。

- 清理并编译:

```bash
mvn clean compile
```

此命令会先执行 clean 阶段（清除之前的构建文件），然后执行 compile 阶段（编译代码）。

只需要为了开发体验，建议使用以下插件:

- [Lombok](https://plugins.jetbrains.com/plugin/6317-lombok)(高版本IntelliJ IDEA 内置此插件)
- [mapstruct-support](https://plugins.jetbrains.com/plugin/10036-mapstruct-support)