// popup.js

let videos = [];

const videosContainer = document.getElementById('videos');
const statusEl = document.getElementById('status');

function showVideos() {
  videosContainer.innerHTML = '';
  if (videos.length === 0) {
    videosContainer.innerHTML = '<p style="color:#8b949e;">Nessun video rilevato sulla pagina.</p>';
    return;
  }

  videos.forEach((url, index) => {
    const item = document.createElement('div');
    item.className = 'video-item';

    const btn = document.createElement('button');
    btn.textContent = `Scarica video ${index + 1}`;
    btn.onclick = () => {
      statusEl.textContent = 'Tentativo di download in corso...';

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "downloadFromContent",
          url: url,
          filename: `video-${Date.now()}.mp4`
        });
      });
    };

    const urlEl = document.createElement('div');
    urlEl.className = 'video-url';
    urlEl.textContent = url;

    item.appendChild(btn);
    item.appendChild(urlEl);
    videosContainer.appendChild(item);
  });
}

document.getElementById('scan').onclick = () => {
  statusEl.textContent = 'Scansione in corso...';
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "scanNow" });
  });
};

// Riceve la lista video dal content script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "videosFound") {
    videos = msg.videos;
    statusEl.textContent = `Trovati ${videos.length} elementi`;
    showVideos();
  }

  if (msg.action === "downloadStatus") {
    statusEl.textContent = msg.text;
  }
});

// Scansione automatica all'apertura del popup
document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "scanNow" });
  });
});