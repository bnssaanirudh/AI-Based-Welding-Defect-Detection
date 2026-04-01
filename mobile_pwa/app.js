const backendUrlInput = document.getElementById("backendUrl");
const thresholdInput = document.getElementById("threshold");
const thresholdValue = document.getElementById("thresholdValue");
const xaiToggle = document.getElementById("xaiToggle");
const galleryInput = document.getElementById("galleryInput");
const cameraInput = document.getElementById("cameraInput");
const analyzeBtn = document.getElementById("analyzeBtn");

const statusCard = document.getElementById("statusCard");
const inputPreview = document.getElementById("inputPreview");
const overlayPreview = document.getElementById("overlayPreview");
const xaiPreview = document.getElementById("xaiPreview");
const summaryEl = document.getElementById("summary");
const metricsEl = document.getElementById("metrics");

let selectedFile = null;

const storedBase = localStorage.getItem("welding-api-base");
backendUrlInput.value = storedBase || `${window.location.origin}`;

function showStatus(message, isError = false) {
  statusCard.classList.remove("hidden", "ok", "err");
  statusCard.classList.add(isError ? "err" : "ok");
  statusCard.textContent = message;
}

function fileSelected(file) {
  selectedFile = file;
  const objectUrl = URL.createObjectURL(file);
  inputPreview.src = objectUrl;
  inputPreview.classList.remove("hidden");
  showStatus(`Selected: ${file.name}`, false);
}

galleryInput.addEventListener("change", (e) => {
  const [file] = e.target.files || [];
  if (file) fileSelected(file);
});

cameraInput.addEventListener("change", (e) => {
  const [file] = e.target.files || [];
  if (file) fileSelected(file);
});

thresholdInput.addEventListener("input", () => {
  thresholdValue.textContent = Number(thresholdInput.value).toFixed(2);
});

function colorForConfidence(v) {
  if (v >= 0.35) return "var(--danger)";
  if (v >= 0.2) return "var(--warn)";
  return "var(--accent)";
}

function renderSummary(summary) {
  summaryEl.innerHTML = "";
  const conf = `${(summary.top_confidence * 100).toFixed(1)}%`;
  const rows = [
    `Top Defect: ${summary.top_label}`,
    `Confidence: ${conf}`,
    `Severity: ${String(summary.severity || "").toUpperCase()}`,
  ];
  rows.forEach((txt) => {
    const div = document.createElement("div");
    div.textContent = txt;
    summaryEl.appendChild(div);
  });
}

function renderMetrics(metrics) {
  metricsEl.innerHTML = "";
  metrics.forEach((m) => {
    const wrapper = document.createElement("div");
    wrapper.className = "metric";

    const head = document.createElement("div");
    head.className = "metric-head";
    head.innerHTML = `<span>${m.label}</span><span>${(m.confidence * 100).toFixed(1)}%</span>`;

    const bar = document.createElement("div");
    bar.className = "bar";

    const fill = document.createElement("div");
    fill.className = "fill";
    fill.style.width = `${Math.max(2, m.confidence * 100)}%`;
    fill.style.background = colorForConfidence(m.confidence);
    bar.appendChild(fill);

    wrapper.appendChild(head);
    wrapper.appendChild(bar);
    metricsEl.appendChild(wrapper);
  });
}

analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    showStatus("Please choose or capture an image first.", true);
    return;
  }

  const base = backendUrlInput.value.trim().replace(/\/+$/, "");
  localStorage.setItem("welding-api-base", base);

  const threshold = Number(thresholdInput.value).toFixed(2);
  const explain = xaiToggle.checked ? "true" : "false";
  const endpoint = `${base}/v1/analyze/image?threshold=${threshold}&explain=${explain}`;

  analyzeBtn.disabled = true;
  showStatus("Analyzing image...", false);

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || `Request failed (${res.status})`);
    }

    overlayPreview.src = `data:image/jpeg;base64,${data.images.overlay_jpeg_base64}`;
    overlayPreview.classList.remove("hidden");

    const xaiB64 = data.explainability?.fused_map_png_base64 || "";
    if (xaiB64) {
      xaiPreview.src = `data:image/png;base64,${xaiB64}`;
      xaiPreview.classList.remove("hidden");
    } else {
      xaiPreview.classList.add("hidden");
    }

    renderSummary(data.summary);
    renderMetrics(data.class_metrics || []);
    showStatus("Analysis completed.", false);
  } catch (err) {
    showStatus(`Error: ${err.message}`, true);
  } finally {
    analyzeBtn.disabled = false;
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Ignore SW registration failures in dev mode.
    });
  });
}
