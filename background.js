chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.storage.local.set({ [`lastAccessed_${activeInfo.tabId}`]: Date.now() });
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      chrome.storage.local.set({ [`lastAccessed_${tabId}`]: Date.now() });
    }
  });
  
  // Update "last accessed" timestamp when a tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.storage.local.set({ [`lastAccessed_${activeInfo.tabId}`]: Date.now() });
  });
  
  // Update "last accessed" timestamp when the browser window gains focus
  chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) return; // Ignore minimized or unfocused windows
  
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        chrome.storage.local.set({ [`lastAccessed_${tabId}`]: Date.now() });
      }
    });
  });
  
  // Periodically check and update time left for tabs
setInterval(() => {
    chrome.storage.sync.get(['timePeriod'], function (result) {
      const timePeriod = result.timePeriod || 0;
  
      chrome.storage.local.get(null, function (storedData) {
        for (const [key, value] of Object.entries(storedData)) {
          if (key.startsWith('lastAccessed_')) {
            const tabId = key.split('_')[1];
            const lastAccessed = value;
            const timeLeftMs = timePeriod - (Date.now() - lastAccessed);
  
            // Close the tab if it is expired and not protected
            chrome.storage.local.get(`protectedTab_${tabId}`, (protectionStatus) => {
              const isProtected = protectionStatus[`protectedTab_${tabId}`];
              if (timeLeftMs <= 0 && !isProtected) {
                chrome.tabs.remove(parseInt(tabId), () => {
                  if (chrome.runtime.lastError) {
                    console.warn(`Failed to close tab ${tabId}:`, chrome.runtime.lastError.message);
                  } else {
                    console.log(`Tab ${tabId} closed because it expired.`);
                  }
                });
  
                // Clean up the expired tab's data from storage
                chrome.storage.local.remove(`lastAccessed_${tabId}`);
              }
            });
          }
        }
      });
    });
  }, 10000); // Runs every 10 seconds
  