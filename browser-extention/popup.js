const API_URL_KEY = 'jobTrackerApiUrl';
const DEFAULT_API_URL = 'https://job-tracker-backend-o4vh.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
  // Get stored API URL or use default
  const { jobTrackerApiUrl } = await chrome.storage.sync.get(API_URL_KEY);
  const apiUrl = jobTrackerApiUrl || DEFAULT_API_URL;
  
  // Try to auto-fill from current page
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getJobData' }, (response) => {
      if (response && response.success) {
        fillForm(response.data);
        document.getElementById('auto-filled').style.display = 'block';
      }
    });
  });
  
  // Handle form submission
  document.getElementById('jobForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    const jobData = {
      company: document.getElementById('company').value,
      position: document.getElementById('position').value,
      location: document.getElementById('location').value,
      salary_range: document.getElementById('salary_range').value,
      status: document.getElementById('status').value,
      notes: document.getElementById('notes').value,
      date_applied: new Date().toISOString().split('T')[0],
      job_url: ''
    };
    
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      jobData.job_url = tabs[0].url;
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData)
        });
        
        if (response.ok) {
          showMessage('✅ Application saved successfully!', 'success');
          document.getElementById('jobForm').reset();
          setTimeout(() => window.close(), 1500);
        } else {
          showMessage('❌ Failed to save application', 'error');
        }
      } catch (error) {
        showMessage('❌ Error: ' + error.message, 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Application';
      }
    });
  });
  
  // Settings link
  document.getElementById('settingsLink').addEventListener('click', (e) => {
    e.preventDefault();
    const newUrl = prompt('Enter your API URL:', apiUrl);
    if (newUrl) {
      chrome.storage.sync.set({ jobTrackerApiUrl: newUrl }, () => {
        alert('API URL saved!');
      });
    }
  });
});

function fillForm(data) {
  if (data.company) document.getElementById('company').value = data.company;
  if (data.position) document.getElementById('position').value = data.position;
  if (data.location) document.getElementById('location').value = data.location;
  if (data.salary) document.getElementById('salary_range').value = data.salary;
}

function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.className = type;
  messageDiv.textContent = text;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}