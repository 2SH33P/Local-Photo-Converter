> 本项目由 OpenAI Codex 生成，旨在实现极限的图片压缩以方便图床上传于带宽节省。
> 您可以直接访问 https://2sh33p.github.io/Local-Webp-Converter/ 以查看部署效果。

# 本地图片转 WebP

一个纯本地运行、也可直接托管为静态站点的小网站：

- 图片转换在浏览器内完成，不上传服务端
- 支持拖拽上传、压缩质量调节、预览和下载

## GitHub Pages

静态发布文件已经放在 `docs/` 目录。

在 GitHub 仓库里开启 Pages 时，选择：

- Branch: `main`
- Folder: `/docs`

部署后访问 GitHub Pages 地址即可，不需要 Node.js。

## 说明

- 支持浏览器可解码的常见图片格式
- WebP 导出依赖浏览器 `canvas.toBlob("image/webp", quality)` 能力
- `quality` 越低，文件通常越小，但画质会下降
