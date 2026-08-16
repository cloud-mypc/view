const $ = (id) => document.getElementById(id);

const state = {
  files: [],
  server: localStorage.getItem("mycloud_server") || ""
};

$("serverUrl").value = state.server;

function setStatus(online, text) {
  $("status").textContent = text;
  $("status").className = "status " + (online ? "online" : "offline");
}

function message(text) {
  $("message").textContent = text;
}

function normalizeServer(url) {
  return url.trim().replace(/\/+$/, "");
}

async function connect() {
  state.server = normalizeServer($("serverUrl").value);
  localStorage.setItem("mycloud_server", state.server);

  if (!state.server) {
    setStatus(false, "Offline");
    message("Enter your server URL.");
    return;
  }

  try {
    const response = await fetch(`${state.server}/api/health`, {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    setStatus(true, "Connected");
    await loadFiles();
  } catch (error) {
    setStatus(false, "Offline");
    message(
      "Connection failed. Your Android server must expose /api/health and allow CORS."
    );
    console.error(error);
  }
}

async function loadFiles() {
  try {
    const response = await fetch(`${state.server}/api/files`, {
      credentials: "include"
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    state.files = await response.json();
    render();
  } catch (error) {
    message("Connected, but /api/files is not available yet.");
    console.error(error);
  }
}

function formatSize(bytes) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = bytes, i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024; i++;
  }
  return `${n.toFixed(i ? 1 : 0)} ${units[i]}`;
}

function render() {
  const query = $("search").value.toLowerCase().trim();
  const files = state.files.filter(f =>
    String(f.name || "").toLowerCase().includes(query)
  );

  $("gallery").innerHTML = "";

  if (!files.length) {
    message(query ? "No matching files." : "No files found.");
    return;
  }

  message("");

  for (const file of files) {
    const card = document.createElement("article");
    card.className = "card";

    const thumb = document.createElement("div");
    thumb.className = "thumb";

    const url = `${state.server}${file.url}`;

    if (file.type?.startsWith("image/")) {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = url;
      img.alt = file.name || "Image";
      thumb.appendChild(img);
    } else if (file.type?.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = url;
      video.controls = true;
      video.preload = "metadata";
      thumb.appendChild(video);
    } else {
      thumb.textContent = "FILE";
    }

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML =
      `<div class="name" title="${escapeHtml(file.name || "")}">${escapeHtml(file.name || "Unnamed")}</div>` +
      `<div class="size">${formatSize(file.size)}</div>`;

    card.append(thumb, meta);
    $("gallery").appendChild(card);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

async function uploadFiles(fileList) {
  if (!state.server) {
    message("Connect your server first.");
    return;
  }

  for (const file of fileList) {
    const form = new FormData();
    form.append("file", file);

    const response = await fetch(`${state.server}/api/upload`, {
      method: "POST",
      body: form,
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
  }

  await loadFiles();
}

$("connectBtn").addEventListener("click", connect);
$("refreshBtn").addEventListener("click", loadFiles);
$("search").addEventListener("input", render);

$("fileInput").addEventListener("change", async (event) => {
  try {
    await uploadFiles(event.target.files);
  } catch (error) {
    message("Upload failed. Check the server API.");
    console.error(error);
  } finally {
    event.target.value = "";
  }
});

setStatus(false, "Offline");
