const elements = {
  dropzone: document.getElementById("dropzone"),
  fileInput: document.getElementById("fileInput"),
  qualityRange: document.getElementById("qualityRange"),
  qualityValue: document.getElementById("qualityValue"),
  convertBtn: document.getElementById("convertBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  statusText: document.getElementById("statusText"),
  sourcePreview: document.getElementById("sourcePreview"),
  resultPreview: document.getElementById("resultPreview"),
  sourcePlaceholder: document.getElementById("sourcePlaceholder"),
  resultPlaceholder: document.getElementById("resultPlaceholder"),
  sourceMeta: document.getElementById("sourceMeta"),
  resultMeta: document.getElementById("resultMeta"),
};

const state = {
  sourceFile: null,
  sourceUrl: "",
  resultBlob: null,
  resultUrl: "",
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** power;
  return `${value.toFixed(value >= 10 || power === 0 ? 0 : 1)} ${units[power]}`;
}

function setStatus(message) {
  elements.statusText.textContent = message;
}

function revokeUrl(key) {
  if (state[key]) {
    URL.revokeObjectURL(state[key]);
    state[key] = "";
  }
}

function resetResult() {
  revokeUrl("resultUrl");
  state.resultBlob = null;
  elements.resultPreview.hidden = true;
  elements.resultPreview.removeAttribute("src");
  elements.resultPlaceholder.hidden = false;
  elements.resultMeta.textContent = "尚未生成";
  elements.downloadBtn.classList.add("disabled");
  elements.downloadBtn.removeAttribute("href");
  elements.downloadBtn.removeAttribute("download");
}

function updateQualityLabel() {
  elements.qualityValue.textContent = `${elements.qualityRange.value}%`;
}

function clearSource() {
  revokeUrl("sourceUrl");
  state.sourceFile = null;
  elements.fileInput.value = "";
  elements.sourcePreview.hidden = true;
  elements.sourcePreview.removeAttribute("src");
  elements.sourcePlaceholder.hidden = false;
  elements.sourceMeta.textContent = "未选择文件";
  elements.convertBtn.disabled = true;
  resetResult();
  setStatus("选择一张图片后开始转换。");
}

function setSourceFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    setStatus("请选择浏览器可读取的图片文件。");
    return;
  }

  revokeUrl("sourceUrl");
  resetResult();

  state.sourceFile = file;
  state.sourceUrl = URL.createObjectURL(file);

  elements.sourcePreview.src = state.sourceUrl;
  elements.sourcePreview.hidden = false;
  elements.sourcePlaceholder.hidden = true;
  elements.sourceMeta.textContent = `${file.name} | ${formatBytes(file.size)}`;
  elements.convertBtn.disabled = false;
  setStatus("图片已载入，点击“转换为 WebP”开始处理。");
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片加载失败，可能是当前浏览器不支持该格式。"));
    image.src = url;
  });
}

function canvasToWebPBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("当前浏览器不支持导出 WebP。"));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      quality
    );
  });
}

async function convertToWebP() {
  if (!state.sourceFile || !state.sourceUrl) {
    setStatus("请先选择图片。");
    return;
  }

  elements.convertBtn.disabled = true;
  elements.convertBtn.textContent = "转换中...";
  setStatus("正在浏览器本地转换，不会上传文件。");

  try {
    const image = await loadImage(state.sourceUrl);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("无法初始化 Canvas。");
    }

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.drawImage(image, 0, 0);

    const quality = Number(elements.qualityRange.value) / 100;
    const blob = await canvasToWebPBlob(canvas, quality);

    revokeUrl("resultUrl");
    state.resultBlob = blob;
    state.resultUrl = URL.createObjectURL(blob);

    const baseName = state.sourceFile.name.replace(/\.[^.]+$/, "") || "converted";
    const saved = Math.max(state.sourceFile.size - blob.size, 0);
    const ratio = state.sourceFile.size > 0 ? Math.round((saved / state.sourceFile.size) * 100) : 0;

    elements.resultPreview.src = state.resultUrl;
    elements.resultPreview.hidden = false;
    elements.resultPlaceholder.hidden = true;
    elements.resultMeta.textContent = `${formatBytes(blob.size)} | 节省 ${ratio}%`;
    elements.downloadBtn.href = state.resultUrl;
    elements.downloadBtn.download = `${baseName}.webp`;
    elements.downloadBtn.classList.remove("disabled");
    setStatus(
      `转换完成：${state.sourceFile.name} -> ${baseName}.webp，原始 ${formatBytes(
        state.sourceFile.size
      )}，结果 ${formatBytes(blob.size)}。`
    );
  } catch (error) {
    resetResult();
    setStatus(error instanceof Error ? error.message : "转换失败，请换一张图片再试。");
  } finally {
    elements.convertBtn.disabled = !state.sourceFile;
    elements.convertBtn.textContent = "转换为 WebP";
  }
}

function onDrop(event) {
  event.preventDefault();
  elements.dropzone.classList.remove("is-active");
  const [file] = event.dataTransfer.files;
  setSourceFile(file);
}

elements.qualityRange.addEventListener("input", updateQualityLabel);
elements.convertBtn.addEventListener("click", convertToWebP);

elements.dropzone.addEventListener("click", () => {
  elements.fileInput.click();
});

elements.dropzone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    elements.fileInput.click();
  }
});

elements.dropzone.addEventListener("dragenter", (event) => {
  event.preventDefault();
  elements.dropzone.classList.add("is-active");
});

elements.dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  elements.dropzone.classList.add("is-active");
});

elements.dropzone.addEventListener("dragleave", () => {
  elements.dropzone.classList.remove("is-active");
});

elements.dropzone.addEventListener("drop", onDrop);

elements.fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  setSourceFile(file);
});

window.addEventListener("beforeunload", () => {
  revokeUrl("sourceUrl");
  revokeUrl("resultUrl");
});

updateQualityLabel();
clearSource();
