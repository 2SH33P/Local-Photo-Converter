# 本地图片转 WebP

一个纯本地运行、也可直接托管为静态站点的小网站：

- 用 Node.js 启动本地静态服务
- 图片转换在浏览器内完成，不上传服务端
- 支持拖拽上传、压缩质量调节、预览和下载
- 可直接部署到 GitHub Pages

## 本地启动

```bash
npm start
```

默认打开：

```text
http://127.0.0.1:3010
```

修改端口：

```powershell
$env:PORT=8080
npm start
```

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
