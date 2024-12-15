document.getElementById('saveBtn').addEventListener('click', () => {
    const timeLimit = document.getElementById('timeLimit').value;
    
    if (timeLimit && timeLimit > 0) {
      const timeLimitInMs = timeLimit * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      chrome.storage.sync.set({ timeLimit: timeLimitInMs }, () => {
        alert('Time limit saved!');
      });
    } else {
      alert('Please enter a valid number');
    }
  });
  
  // Load the saved time limit when the popup opens
  chrome.storage.sync.get(['timeLimit'], (result) => {
    if (result.timeLimit) {
      document.getElementById('timeLimit').value = result.timeLimit / (24 * 60 * 60 * 1000); // Convert ms to days
    }
  });
  