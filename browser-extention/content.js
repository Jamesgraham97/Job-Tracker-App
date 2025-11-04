// This script runs on job posting pages and extracts data

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJobData') {
    const jobData = extractJobData();
    sendResponse({ success: true, data: jobData });
  }
  return true;
});

function extractJobData() {
  const url = window.location.href;
  let data = { company: '', position: '', location: '', salary: '' };
  
  // LinkedIn
  if (url.includes('linkedin.com')) {
    data.company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent.trim() || '';
    data.position = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent.trim() || '';
    data.location = document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent.trim() || '';
    
    // Try to find salary
    const salaryEl = document.querySelector('.job-details-jobs-unified-top-card__job-insight');
    if (salaryEl && salaryEl.textContent.includes('$')) {
      data.salary = salaryEl.textContent.trim();
    }
  }
  
  // Indeed
 // Indeed - Updated selectors for 2024
else if (url.includes('indeed.com')) {
  // Try multiple possible selectors
  data.company = 
    document.querySelector('[data-testid="inlineHeader-companyName"]')?.textContent.trim() ||
    document.querySelector('[data-company-name="true"]')?.textContent.trim() ||
    document.querySelector('.jobsearch-InlineCompanyRating-companyHeader')?.textContent.trim() ||
    document.querySelector('.icl-u-lg-mr--sm')?.textContent.trim() ||
    '';
    
  data.position = 
    document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent.trim() ||
    document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent.trim() ||
    document.querySelector('h1.jobsearch-JobInfoHeader-title')?.textContent.trim() ||
    '';
    
  data.location = 
    document.querySelector('[data-testid="inlineHeader-companyLocation"]')?.textContent.trim() ||
    document.querySelector('[data-testid="job-location"]')?.textContent.trim() ||
    document.querySelector('.jobsearch-JobInfoHeader-subtitle')?.textContent.trim() ||
    '';
  
  // Salary
  const salaryEl = document.querySelector('.salary-snippet') || 
                   document.querySelector('[data-testid="attribute_snippet_testid"]');
  if (salaryEl) {
    data.salary = salaryEl.textContent.trim();
  }
}
  
  // Greenhouse
  else if (url.includes('greenhouse.io')) {
    data.company = document.querySelector('.company-name')?.textContent.trim() || '';
    data.position = document.querySelector('.app-title')?.textContent.trim() || '';
    data.location = document.querySelector('.location')?.textContent.trim() || '';
  }
  
  // Lever
  else if (url.includes('lever.co')) {
    data.position = document.querySelector('.posting-headline h2')?.textContent.trim() || '';
    data.company = document.querySelector('.main-header-text-logo')?.textContent.trim() || '';
    data.location = document.querySelector('.posting-categories .location')?.textContent.trim() || '';
  }
  
  // Generic fallback - try common patterns
  else {
    data.position = document.querySelector('h1')?.textContent.trim() || '';
    data.company = document.title.split('|')[0]?.trim() || '';
  }
  
  return data;
}