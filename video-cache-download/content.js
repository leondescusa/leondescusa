// content.js

const foundResources = new Set();

function scanPage() {
  // Trova src e currentSrc da tutti i <video> e <source>
  document.querySelectorAll('video, source').forEach(el => {
    if (el.src) foundResources.add(el.src);
  });

  document.querySelectorAll('video').forEach(video => {
    if (video.currentSrc) foundResources.add(video.currentSrc);
  });

  // Opzionale: cerca anche pattern m3u8/ts nel testo della pagina
  const regex = /(https?:\/\/\S+\.(m3u8|mpd|ts|m4s|fmp4)(?:\?[^"'\s<]*)?)/gi;
  let match;
  const pageText = document.body.innerHTML + (document.head?.innerHTML || '');
  while ((match = regex.exec(pageText)) !== null) {
    foundResources.add(match[1]);
  }

  const uniqueList = [...new Set(Array.from(foundResources).filter(Boolean))];

  chrome.runtime.sendMessage({
    action: "videosFound",
    videos: uniqueList
  });
}

// Esegui subito + monitora cambiamenti
scanPage();
setInterval(scanPage, 4000);           // riprova ogni 4 secondi
setTimeout(() => clearInterval(scanPage), 180000); // ferma dopo 3 min

new MutationObserver(scanPage).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['src', 'currentSrc']
});

// Riceve richiesta di download dal popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "downloadFromContent") {
    const url = message.url;
    const filename = message.filename || `video-${Date.now()}.mp4`;

    // Metodo principale per blob: e http/https
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Pulizia
    setTimeout(() => {
      document.body.removeChild(link);
      // link.remove() non sempre funziona bene su Firefox
    }, 100);

    // Feedback opzionale
    chrome.runtime.sendMessage({
      action: "downloadStatus",
      text: `Tentato download: ${filename}`
    });

    return true; // mantiene il canale aperto per async (buona pratica)
  }
});