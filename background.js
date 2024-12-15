let timeLimit = 15 * 24 * 60 * 60 * 1000; // Default time limit of 15 days in milliseconds

chrome.runtime.onInstalled.addListener(() => {
  // Initialize the time limit if not set by the user
  chrome.storage.sync.get(["timeLimit"], (result) => {
    if (result.timeLimit) {
      timeLimit = result.timeLimit;
    }
  });

  // Run the tab cleanup every 10 minutes
  setInterval(closeOldTabs, 10 * 60 * 1000);
});

function closeOldTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      let lastAccessTime = tab.lastAccessed || Date.now();

      if (Date.now() - lastAccessTime > timeLimit) {
        chrome.tabs.remove(tab.id);
      }
    });
  });
}
