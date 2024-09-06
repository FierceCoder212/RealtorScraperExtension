const min = 0;
const max = 0;

setTimeout(() => {
  try {
    const listingContainer = document.querySelector('div[class="sc-2940a84d-0 ifHyQT"]').outerHTML;
    chrome.runtime.sendMessage({ type: "LISTING_SCRAPED", listing: listingContainer });
  } catch (e) {
    chrome.runtime.sendMessage({ type: "LISTING_ERROR" });
  }
}, Math.floor(Math.random() * (max * 60 * 1000 - min * 60 * 1000 + 1)) + min * 60 * 1000);
