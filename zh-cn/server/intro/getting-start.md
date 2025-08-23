## 项目结构

```yaml

.
├── EasyCode #EasyCode Plus代码生成器模板
│   ├── ColumnConfig
│   ├── GlobalConfig
│   │   └── MybatisCodeHelperPro
│   ├── Templates
│   │   └── MybatisCodeHelperMigrateNoServiceInterfaceNoController
│   └── TypeMapperConfig
├── avalon-dependencies # 依赖管理
├── avalon-extensions # 第三方扩展,引入了三方jar包或服务
│   ├── avalon-dufs-spring-boot-starter # DUFS文件存储
│   └── avalon-ip2location-spring-boot-starter # IP地址库
├── avalon-modules # 业务模块
│   ├── avalon-authorization # 授权模块
│   └── avalon-dataset # 数据集模块
│       ├── avalon-dataset-model # 数据集模型
│       └── avalon-dataset-repository # 数据集仓库
├── avalon-parent # 父工程
├── avalon-server # 服务端单体工程all-in-one
├── avalon-support # 支持模块,和三方扩展比起来就是没有添加spring家族以外的功能
│   ├── avalon-json-support # JSON支持
│   ├── avalon-key-generator # 主键生成器
│   ├── avalon-mybatis-support # Mybatis支持
│   ├── avalon-oauth2-support # OAuth2支持
│   │   ├── avalon-oauth2-authorization-server # 授权服务器
│   │   ├── avalon-oauth2-common # 公共模块
│   │   └── avalon-oauth2-resource-server # 资源服务器
│   ├── avalon-poke-api-support # 宝可梦API支持
│   └── avalon-web-support # Web支持
└── scripts # 脚本相关
    ├── ip-data-downloader.sh # IP数据下载脚本
    └── rsa-key-pair.sh # RSA密钥生成脚本



```

