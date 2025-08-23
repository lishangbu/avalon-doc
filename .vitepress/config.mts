import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: '/avalon-doc',
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
                    {text: '数据库', link: '/zh-cn/server/environment-setup/postgres'},
                    {text: 'Intellij IDEA', link: '/zh-cn/server/environment-setup/idea'},
                ]
            },
            {
                text: '客户端',
                items: [
                    {text: '快速开始', link: '/zh-cn/client/intro/getting-start'},
                ]
            },
        ]
    }
})
