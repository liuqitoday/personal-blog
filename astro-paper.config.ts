import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://personal-blog.pages.dev/",
    title: "堆栈茶社",
    description:
      "分享软件开发、实用工具、网络配置与 AI 应用的实战经验教程。",
    author: "Freddy",
    profile: "https://github.com/liuqitoday",
    ogImage: "default-og.jpg",
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 10,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/liuqitoday/personal-blog/edit/theme/astro-paper/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/liuqitoday/personal-blog" },
    { name: "mail", url: "mailto:liuqitoday@163.com" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
