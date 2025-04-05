chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getScripts') {
    const scripts = Array.from(document.getElementsByTagName('script'));
    const scriptInfo = scripts.map(script => ({
      src: script.src || 'inline script',
      type: script.type,
      async: script.async,
      defer: script.defer,
    }));
    sendResponse(scriptInfo);
  }
  return true;
}); 