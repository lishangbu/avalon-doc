# 快速开始

## 前提知识

在开始之前，您首先应该：

- 熟悉 Node 环境配置及其开发
- 熟悉 [Quasar](https://quasar.dev/)
- 熟悉 前端构建工具，比如 [Vite](https://https://vitejs.cn/vite3-cn/guide/)

## 准备

- 一个node 20+的环境,推荐[node](https://nodejs.org/zh-cn)下载最新的LTS即可
- 一款你熟悉的IDE或者编辑器，比如Webstorm或者Vs Code皆可

## 下载项目

```bash
git clone  https://github.com/lishangbu/fairyland-ui
```

## 安装依赖

项目可以使用pnpm、npm、yarn进行依赖管理,以npm为例:

通过以下命令安装依赖即可:
```bash
npm i
```

项目采用的protobuf交互需要编译Proto文件为静态TS类，通过protobufjs-cli
```bash
npm install -g protobufjs-cli
```
然后在项目根目录执行以下命令即可:
```bash
npm run proto
```
此时导入项目进IDE应该不会报错了。

然后在项目根目录执行以下命令即可:
```bash
npm run dev
```
就可以启动开发服务器了。