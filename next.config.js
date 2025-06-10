// next.config.js  ← 既存ファイルを全部これに置き換えて OK
const path = require("path");
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,

  // ⭐ ここが今回追加する部分 ── webpack の alias 設定
  webpack(config) {
    // "@/..." や "@@/..." を src/ にマッピング
    config.resolve.alias["@@"] = config.resolve.alias["@"] =
      path.resolve(__dirname, "src");
    return config;
  },
});
