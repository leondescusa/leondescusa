// background.js
browser.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = details.url.toLowerCase();

    if (url.endsWith('.m3u8') || url.endsWith('.mpd') || url.includes('.ts') || url.includes('.m4s')) {
      console.log("Flusso rilevato:", details.url, details.type);

      // Puoi salvare l'URL, mandarlo al popup o iniziare a scaricare
      browser.runtime.sendMessage({
        action: "streamDetected",
        url: details.url,
        tabId: details.tabId
      });

      // Opzionale: blocca o modifica (se vuoi testare)
      // return {cancel: true}; // solo per debug
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]   // necessario per intercettare in tempo reale
);