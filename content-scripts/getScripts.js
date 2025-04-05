console.log('Content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  if (request.action === 'getScripts') {
    console.log('Getting scripts...');
    const scripts = Array.from(document.getElementsByTagName('script'));
    console.log('Found scripts:', scripts);
    
    const scriptInfo = scripts.map(script => ({
      src: script.src || 'inline script',
      type: script.type,
      async: script.async,
      defer: script.defer,
    }));
    
    console.log('Sending response:', scriptInfo);
    sendResponse(scriptInfo);
  }
  return true;
}); 