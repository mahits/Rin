let lastURL = '';
let lastResult = null;
let counting = false;

export async function fetchCountAndUpdateUI(isFeed = false) {
  if (counting) return;
  counting = true;
  const currentURL = window.location.href;
  if (currentURL === lastURL && lastResult !== null) {
    setTimeout(() => updateUI(lastResult, isFeed), 50);
    return;
  }
  lastURL = currentURL;

  const response = await fetch('https://api.obdo.cc/count/api', {
    method: 'POST',
    headers: {
      'X-Bsz-Referer': currentURL
    }
  });
  const jsonResponse = await response.json();
  if (jsonResponse.success) {
    lastResult = jsonResponse.data;
    updateUI(lastResult, isFeed);
  }
  counting = false;
}

function updateUI(data, isFeed, startTime = Date.now()) {
    const { page_pv, page_uv, site_pv, site_uv } = data;
  
    const pagePvElements = document.querySelectorAll('#page_pv');
    const pageUvElements = document.querySelectorAll('#page_uv');
    const sitePvElements = document.querySelectorAll('#site_pv');
    const siteUvElements = document.querySelectorAll('#site_uv');
  
    if (isFeed && pagePvElements.length === 0) {
      setTimeout(() => updateUI(data, isFeed, startTime), 100);
      return;
    }
  
    pagePvElements.forEach(element => element.innerText = page_pv.toString());
    pageUvElements.forEach(element => element.innerText = page_uv.toString());
    sitePvElements.forEach(element => element.innerText = site_pv.toString());
    siteUvElements.forEach(element => element.innerText = site_uv.toString());
    counting = false;
  }