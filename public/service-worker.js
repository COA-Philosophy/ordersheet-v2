self.addEventListener("install", function (event) {
  self.skipWaiting();
});
self.addEventListener("activate", function (event) {
  self.clients.claim();
});
self.addEventListener("fetch", function (event) {
  // シンプルなキャッシュ動作（詳細なオフライン対応は必要なら後日追加）
});
