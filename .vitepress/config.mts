import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: '/avalon-site/docs',
    lang: 'zh-CN',
    title: "Avalon",
    description: "A Document Site for Avalon",
    lastUpdated: true,
    themeConfig: {
        search: {
            provider: 'local'
        },
        footer: {
            message: 'Released under the AGPL v3 License.',
            copyright: 'Copyright © 2024-present Shangbu Li'
        },
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {
                text: '获取源码', items: [
                    {text: '前端源码', link: 'https://github.com/lishangbu/avalon-ui'},
                    {text: '服务端源码', link: 'https://github.com/lishangbu/avalon'},
                    {text: '文档源码', link: 'https://github.com/lishangbu/avalon-doc'}
                ]
            },
        ],

        sidebar: [
            {
                text: '服务端',
                items: [
                    {text: '快速开始', link: '/zh-cn/server/intro/getting-start'}
                ]
            },
            {
                text: '环境搭建',
                items: [
                    {text: 'Docker Compose 一键启动', link: '/zh-cn/server/environment-setup/docker-compose'},
                    {text: '数据库', link: '/zh-cn/server/environment-setup/postgres'},
                    {text: 'Intellij IDEA', link: '/zh-cn/server/environment-setup/idea'},
                    {text: 'IP2Location', link: '/zh-cn/server/environment-setup/ip2location'},
                    {text: 'S3 / MinIO', link: '/zh-cn/server/environment-setup/s3'},
                    {text: '幂等控制', link: '/zh-cn/server/environment-setup/idempotent'},
                ]
            },
            {
                text: '认证与安全',
                items: [
                    {text: '登录失败追踪', link: '/zh-cn/server/security/login-failure-tracker'},
                ]
            },
            {
                text: '管理平台',
                items: [
                    {text: '快速开始', link: '/zh-cn/admin-ui/intro/getting-start'},
                    {text: '通用 CRUD 内核使用指南', link: '/zh-cn/admin-ui/development/crud-kernel'},
                    {text: 'CRUD 组件接入示例', link: '/zh-cn/admin-ui/development/crud-component-recipes'},
                ]
            },
        ]
    }
})
