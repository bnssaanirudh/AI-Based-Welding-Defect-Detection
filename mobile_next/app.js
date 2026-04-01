const threshold = document.getElementById("threshold");
const thresholdOut = document.getElementById("thresholdOut");
const xai = document.getElementById("xai");
const gallery = document.getElementById("gallery");
const camera = document.getElementById("camera");
const analyze = document.getElementById("analyze");
const toast = document.getElementById("toast");
const inputImg = document.getElementById("inputImg");
const overlayImg = document.getElementById("overlayImg");
const xaiImg = document.getElementById("xaiImg");
const summary = document.getElementById("summary");
const bars = document.getElementById("bars");
const historyEl = document.getElementById("history");

let selectedFile = null;
let history = [];

function showToast(msg, error = false) {
  toast.classList.remove("hidden", "ok", "err");
  toast.classList.add(error ? "err" : "ok");
  toast.textContent = msg;
}

function setFile(file) {
  selectedFile = file;
  inputImg.src = URL.createObjectURL(file);
  inputImg.classList.remove("hidden");
  showToast(`Selected: ${file.name}`);
}

gallery.addEventListener("change", (e) => {
  const [f] = e.target.files || [];
  if (f) setFile(f);
});

camera.addEventListener("change", (e) => {
  const [f] = e.target.files || [];
  if (f) setFile(f);
});

threshold.addEventListener("input", () => {
  thresholdOut.textContent = Number(threshold.value).toFixed(2);
});

function colorFor(v) {
  if (v >= 0.35) return "var(--danger)";
  if (v >= 0.2) return "var(--warn)";
  return "var(--accent)";
}

function renderBars(metrics) {
  bars.innerHTML = "";
  for (const m of metrics) {
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="bar-head"><span>${m.label}</span><span>${(m.confidence * 100).toFixed(1)}%</span></div>
      <div class="bar-bg"><div class="bar-fill"></div></div>
    `;
    const fill = row.querySelector(".bar-fill");
    fill.style.background = colorFor(m.confidence);
    setTimeout(() => {
      fill.style.width = `${Math.max(2, m.confidence * 100)}%`;
    }, 30);
    bars.appendChild(row);
  }
}

function renderSummary(data) {
  const s = data.summary;
  summary.innerHTML = `
    <div>Top Defect: ${s.top_label}</div>
    <div>Confidence: ${(s.top_confidence * 100).toFixed(1)}%</div>
    <div>Severity: ${String(s.severity || "").toUpperCase()}</div>
  `;
}

function renderHistory() {
  historyEl.innerHTML = history.length
    ? history.map((h) => `<div class="history-item"><span>${h.label}</span><span>${h.conf}</span></div>`).join("")
    : "<div class='history-item'><span>No runs yet</span><span>-</span></div>";
}

analyze.addEventListener("click", async () => {
  if (!selectedFile) {
    showToast("Pick an image first.", true);
    return;
  }

  analyze.disabled = true;
  showToast("Analyzing...");
  try {
    const formData = new FormData();
    formData.append("file", selectedFile);
    const url = `/v1/analyze/image?threshold=${Number(threshold.value).toFixed(2)}&explain=${xai.checked}`;
    const res = await fetch(url, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || `Failed (${res.status})`);

    overlayImg.src = `data:image/jpeg;base64,${data.images.overlay_jpeg_base64}`;
    overlayImg.classList.remove("hidden");

    const fused = data.explainability?.fused_map_png_base64 || "";
    if (fused) {
      xaiImg.src = `data:image/png;base64,${fused}`;
      xaiImg.classList.remove("hidden");
    } else {
      xaiImg.classList.add("hidden");
    }

    renderSummary(data);
    renderBars(data.class_metrics || []);
    history = [
      {
        label: data.summary.top_label,
        conf: `${(data.summary.top_confidence * 100).toFixed(1)}%`,
      },
      ...history,
    ].slice(0, 8);
    renderHistory();
    showToast("Analysis complete.");
    if (navigator.vibrate) navigator.vibrate(30);
  } catch (err) {
    showToast(`Error: ${err.message}`, true);
  } finally {
    analyze.disabled = false;
  }
});

renderHistory();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
