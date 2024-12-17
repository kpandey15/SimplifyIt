// References to elements
const tabLoc = document.getElementById('tabLoc');
const tabCorral = document.getElementById('tabCorral');
const optionsTab = document.getElementById('options');

const tabLocContent = document.getElementById('tabLocContent');
const tabCorralContent = document.getElementById('tabCorralContent');
const optionsContent = document.getElementById('optionsContent');

// Function to switch between tabs
function switchTab(tabId) {
  document.querySelectorAll('.tabs div').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  document.getElementById(tabId + 'Content').classList.add('active');
}

// Add event listeners for tabs
tabLoc.addEventListener('click', () => switchTab('tabLoc'));
tabCorral.addEventListener('click', () => switchTab('tabCorral'));
optionsTab.addEventListener('click', () => switchTab('options'));

// Convert time to milliseconds
function convertToMilliseconds(time, unit) {
  const units = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000,
    years: 365 * 24 * 60 * 60 * 1000,
  };
  return time * (units[unit] || units.minutes);
}

// Set the time period
document.getElementById('setTime').addEventListener('click', () => {
  const time = parseInt(document.getElementById('timePeriod').value);
  const unit = document.getElementById('timeUnit').value;

  if (isNaN(time) || time <= 0) {
    alert('Please enter a valid time period!');
    return;
  }

  const timeInMs = convertToMilliseconds(time, unit);
  chrome.storage.sync.set({ timePeriod: timeInMs }, () => {
    alert('Time period set successfully!');
  });
});

// Display tabs and their states
function displayTabs() {
  chrome.tabs.query({}, function (tabs) {
    const tabList = document.getElementById('tabList');
    tabList.innerHTML = '';

    tabs.forEach(tab => {
      const tabItem = document.createElement('li');
      tabItem.classList.add('tab-item');
      tabItem.id = `tab-${tab.id}`;

      const tabTitle = document.createElement('span');
      tabTitle.textContent = tab.title;

      const protectToggle = document.createElement('input');
      protectToggle.type = 'checkbox';
      protectToggle.classList.add('protect-toggle');

      const timeLeft = document.createElement('span');
      timeLeft.classList.add('time-left');
      timeLeft.textContent = 'Time Left: --';

      tabItem.appendChild(tabTitle);
      tabItem.appendChild(protectToggle);
      tabItem.appendChild(timeLeft);
      tabList.appendChild(tabItem);

      chrome.storage.local.get([`protectedTab_${tab.id}`], function (result) {
        protectToggle.checked = result[`protectedTab_${tab.id}`] || false;
      });

      protectToggle.addEventListener('change', () => {
        const isProtected = protectToggle.checked;
        chrome.storage.local.set({ [`protectedTab_${tab.id}`]: isProtected });
      });
    });
  });
}

// Update time left for each tab
// function updateTimeLeft() {
//   chrome.storage.sync.get(['timePeriod'], function (result) {
//     const timePeriod = result.timePeriod || 0;

//     chrome.storage.local.get(null, function (storedData) {
//       for (const [key, value] of Object.entries(storedData)) {
//         if (key.startsWith('lastAccessed_')) {
//           const tabId = key.split('_')[1];
//           const lastAccessed = value;
//           const timeLeftMs = timePeriod - (Date.now() - lastAccessed);

//           const timeLeftElement = document.querySelector(`#tab-${tabId} .time-left`);
//           if (timeLeftElement) {
//             timeLeftElement.textContent =
//               timeLeftMs > 0 ? `Time Left: ${Math.ceil(timeLeftMs / 1000)}s` : 'Expired';
//           }
//         }
//       }
//     });
//   });
// }

// Update time left for each tab and close expired tabs
// function updateTimeLeft() {
//     chrome.storage.sync.get(['timePeriod'], function (result) {
//       const timePeriod = result.timePeriod || 0;
  
//       chrome.storage.local.get(null, function (storedData) {
//         for (const [key, value] of Object.entries(storedData)) {
//           if (key.startsWith('lastAccessed_')) {
//             const tabId = key.split('_')[1];
//             const lastAccessed = value;
//             const timeLeftMs = timePeriod - (Date.now() - lastAccessed);
  
//             const timeLeftElement = document.querySelector(`#tab-${tabId} .time-left`);
//             if (timeLeftElement) {
//               timeLeftElement.textContent =
//                 timeLeftMs > 0 ? `Time Left: ${Math.ceil(timeLeftMs / 1000)}s` : 'Expired';
//             }
  
//             // Close the tab if it has expired
//             if (timeLeftMs <= 0) {
//               chrome.tabs.remove(parseInt(tabId), () => {
//                 if (chrome.runtime.lastError) {
//                   console.warn(`Failed to close tab ${tabId}:`, chrome.runtime.lastError.message);
//                 } else {
//                   console.log(`Tab ${tabId} closed because it expired.`);
//                 }
//               });
  
//               // Clean up the expired tab's data from storage
//               chrome.storage.local.remove(`lastAccessed_${tabId}`);
//             }
//           }
//         }
//       });
//     });
//   }

function updateTimeLeft() {
    chrome.storage.sync.get(['timePeriod'], function (result) {
      const timePeriod = result.timePeriod || 0;
  
      chrome.storage.local.get(null, function (storedData) {
        for (const [key, value] of Object.entries(storedData)) {
          if (key.startsWith('lastAccessed_')) {
            const tabId = key.split('_')[1];
            const lastAccessed = value;
            const timeLeftMs = timePeriod - (Date.now() - lastAccessed);
  
            const timeLeftElement = document.querySelector(`#tab-${tabId} .time-left`);
            if (timeLeftElement) {
              timeLeftElement.textContent =
                timeLeftMs > 0 ? `Time Left: ${Math.ceil(timeLeftMs / 1000)}s` : 'Expired';
            }
  
            // Check protection status
            const isProtected = storedData[`protectedTab_${tabId}`] || false;
  
            // Close the tab if it has expired and is not protected
            if (timeLeftMs <= 0 && !isProtected) {
              chrome.tabs.remove(parseInt(tabId), () => {
                if (chrome.runtime.lastError) {
                  console.warn(`Failed to close tab ${tabId}:`, chrome.runtime.lastError.message);
                } else {
                  console.log(`Tab ${tabId} closed because it expired and was not protected.`);
                }
              });
  
              // Clean up the expired tab's data from storage
              chrome.storage.local.remove(`lastAccessed_${tabId}`);
            }
          }
        }
      });
    });
  }
  
  

// Close unprotected tabs
document.getElementById('closeUnprotected').addEventListener('click', () => {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(tab => {
      chrome.storage.local.get([`protectedTab_${tab.id}`], function (result) {
        if (!result[`protectedTab_${tab.id}`]) {
          chrome.tabs.remove(tab.id);
        }
      });
    });
  });
});

// Initialize popup and update time periodically
document.addEventListener('DOMContentLoaded', () => {
  displayTabs();
  setInterval(updateTimeLeft, 1000);
});
