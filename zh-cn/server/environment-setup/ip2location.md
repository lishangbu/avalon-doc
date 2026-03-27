# 配置 IP2Location

`avalon-ip2location-spring-boot-starter` 现在直接暴露官方 `com.ip2location.IP2Location` 类型，Starter 本身只负责三件事：

1. 读取 BIN 数据文件
2. 将官方 `IP2Location` 注册为 Spring Bean
3. 管理 Bean 生命周期

也就是说，业务代码不再使用自定义 `Searcher`、`IpResult`、`IpUtils` 包装层，而是直接使用官方 API。

## 默认行为

- 默认数据文件位置：`classpath:IP2LOCATION-LITE-DB11.IPV6.BIN`
- 默认配置前缀：`ip2location`
- 默认注册 Bean：`com.ip2location.IP2Location`

如果需要修改 BIN 文件位置，可以在应用配置中覆盖：

```yaml
ip2location:
  db-file-location: classpath:IP2LOCATION-LITE-DB11.IPV6.BIN
```

## 本地准备数据文件

### 1. 获取下载 Token

登录官方站点后，在下载页获取 `download token`：

- <https://lite.ip2location.com/>
- <https://www.ip2location.com/free/downloader>

### 2. 下载或刷新本地 BIN 文件

推荐通过环境变量提供 Token：

```bash
export IP2LOCATION_DOWNLOAD_TOKEN=your-token
./gradlew downloadIpData -PrefreshIpDb=true
```

Windows PowerShell：

```powershell
$env:IP2LOCATION_DOWNLOAD_TOKEN="your-token"
.\gradlew.bat downloadIpData -PrefreshIpDb=true
```

也可以直接使用 Gradle 属性：

```bash
./gradlew downloadIpData -PipDbDownloadToken=your-token -PrefreshIpDb=true
```

说明：

- 如果仓库中已经存在 `IP2LOCATION-LITE-DB11.IPV6.BIN`，任务默认会直接复用本地文件
- 只有缺文件，或者显式指定 `-PrefreshIpDb=true` 时，才会访问官方下载接口

## 业务中如何使用

Starter 自动配置完成后，直接注入官方 `IP2Location` 即可：

```kotlin
import com.ip2location.IP2Location
import com.ip2location.IPResult
import org.springframework.stereotype.Service

@Service
class GeoIpService(
    private val ip2Location: IP2Location,
) {
    fun lookup(ip: String): IPResult = ip2Location.ipQuery(ip)
}
```

返回结果和状态码都来自官方库，例如：

- `OK`
- `EMPTY_IP_ADDRESS`
- `INVALID_IP_ADDRESS`
- `MISSING_FILE`
- `IPV6_NOT_SUPPORTED`

因此业务层应按官方返回结构处理查询结果。

## CI 如何配置

GitHub Actions 需要配置仓库级 Secret：

- 名称：`IP2LOCATION_DOWNLOAD_TOKEN`

配置路径：

- `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

当前 CI 工作流会：

1. 先尝试恢复 `IP2LOCATION-LITE-DB11.IPV6.BIN` 缓存
2. 缓存没有命中且 Secret 存在时，自动调用 `downloadIpData` 下载
3. 下载成功后由 `actions/cache` 写回缓存
4. 如果既没有缓存又没有 Secret，构建会直接失败

这样可以避免每次 CI 都重新下载官方数据文件。
