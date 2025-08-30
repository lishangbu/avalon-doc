import{_ as a,c as i,o as n,ag as l}from"./chunks/framework.Byl_seNW.js";const F=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"zh-cn/server/intro/getting-start.md","filePath":"zh-cn/server/intro/getting-start.md","lastUpdated":1756523796000}'),p={name:"zh-cn/server/intro/getting-start.md"};function t(e,s,h,k,r,o){return n(),i("div",null,[...s[0]||(s[0]=[l(`<h2 id="项目结构" tabindex="-1">项目结构 <a class="header-anchor" href="#项目结构" aria-label="Permalink to &quot;项目结构&quot;">​</a></h2><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">.</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">├── EasyCode</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> #EasyCode Plus代码生成器模板</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   ├── ColumnConfig</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   ├── GlobalConfig</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   │   └── MybatisCodeHelperPro</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   ├── Templates</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   │   └── MybatisCodeHelperMigrateNoServiceInterfaceNoController</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   └── TypeMapperConfig</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">├── avalon-dependencies</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 依赖管理</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">├── avalon-extensions</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 第三方扩展,引入了三方jar包或服务</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   ├── avalon-dufs-spring-boot-starter</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # DUFS文件存储</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   └── avalon-ip2location-spring-boot-starter</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # IP地址库</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">├── avalon-modules</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 业务模块</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   ├── avalon-authorization</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 授权模块</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   └── avalon-dataset</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 数据集模块</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│       ├── avalon-dataset-model</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 数据集模型</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│       └── avalon-dataset-repository</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 数据集仓库</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">├── avalon-parent</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 父工程</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">├── avalon-server</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 服务端单体工程all-in-one</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">├── avalon-support</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 支持模块,和三方扩展比起来就是没有添加spring家族以外的功能</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   ├── avalon-json-support</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # JSON支持</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   ├── avalon-key-generator</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 主键生成器</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   ├── avalon-mybatis-support</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # Mybatis支持</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   ├── avalon-oauth2-support</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # OAuth2支持</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   │   ├── avalon-oauth2-authorization-server</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 授权服务器</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   │   ├── avalon-oauth2-common</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 公共模块</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   │   └── avalon-oauth2-resource-server</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 资源服务器</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   ├── avalon-poke-api-support</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 宝可梦API支持</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">│   └── avalon-web-support</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # Web支持</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">└── scripts</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 脚本相关</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    ├── ip-data-downloader.sh</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # IP数据下载脚本</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    └── rsa-key-pair.sh</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # RSA密钥生成脚本</span></span></code></pre></div>`,2)])])}const g=a(p,[["render",t]]);export{F as __pageData,g as default};
