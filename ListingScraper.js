setTimeout(() => {
  chrome.runtime.sendMessage({
    type: "LISTING_SCRAPED",
    listing: document.querySelector('div[class="sc-2940a84d-0 ifHyQT"]').outerHTML,
  });
}, Math.floor(Math.random() * 3) + 3);
