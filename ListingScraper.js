const min = 0;
const max = 0;

setTimeout(() => {
  chrome.runtime.sendMessage({
    type: "LISTING_SCRAPED",
    listing: document.querySelector('div[class="sc-2940a84d-0 ifHyQT"]').outerHTML,
  });
}, Math.floor(Math.random() * (max * 1000 - min * 1000 + 1)) + min * 1000);
