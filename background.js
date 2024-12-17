chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.storage.local.set({ [`lastAccessed_${activeInfo.tabId}`]: Date.now() });
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      chrome.storage.local.set({ [`lastAccessed_${tabId}`]: Date.now() });
    }
  });
  