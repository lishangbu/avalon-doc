# 在IDE中打开项目


## 下载源码
通过git clone命令将项目克隆到本地:
```bash
git clone git@github.com:lishangbu/avalon.git
```

## 配置发工具

项目采用的是JDK24开发而成，在低于JDK24的环境下可能会出现一些莫名其妙的问题，建议使用JDK24以上版本。虽然我感觉我没有使用多少新特性。但项目大量使用了多行文本块以及record等新特性，因此，低于17大概是不行的。

JDK有多种方式，包括sdkman、homebrew、vfox、asdf等，笔者采用的是asdf，具体安装方式请参考各自官网。

个人推荐可以使用Intellij IDEA的新
具体可以通过File-> Project Structure->Project->Project SDK-Download JDK一键配置。

为了开发体验，建议使用以下插件:

| 插件                                                                                     | 备注                                          |
|----------------------------------------------------------------------------------------|---------------------------------------------|
| [Lombok](https://plugins.jetbrains.com/plugin/6317-lombok)                             | 高版本IntelliJ IDEA内置此插件                       |
| [EasyCode Plus](https://plugins.jetbrains.com/plugin/13847-easycode-plus)              | 项目使用该插件进行传统三层架构布局生成，具体模板可以在根目录的EasyCode文件夹下找到 |
| [MyBatisCodeHelperPro](https://plugins.jetbrains.com/plugin/9837-mybatiscodehelperpro) | 部分功能可能要付费                                   |
| [Spotless Applier](https://plugins.jetbrains.com/plugin/22455-spotless-applier)        | 使用spotless格式化代码，通过Settings > Tools > Actions on Save > Run spotless 来启用

                            |

之后就可以使用IDE打开对应项目了，

### 生成运行必须的资源

从安全与git仓库占用等角度考虑，部分密钥以及IP数据库等大型文件并没有放入，因此在运行项目之前，需要执行项目根路径下的```scripts```文件夹中的```rsa-key-pair.sh```与```ip-data-downloader.sh```进行JWT RSA密钥生成与IP数据下载。

### 初始化数据库
项目本身采用的是```postgres```数据库,用户只需要完成数据库的创建与配置。如果采用前文的docker-compose文件，那就什么都不需要改直接启动就行。项目的建表与数据初始化会在项目启动时自动通过liquibase完成。
暂时没做其他数据库的支持。如果没有进行数据的初始化，请检查以下内容:

```yaml
spring:
  liquibase:
    enable: true      
```

### 启动

执行avalon-server模块下的AvalonStandaloneServerApplication的main方法，IDE会启动一个可运行的Spring
Boot项目了。
