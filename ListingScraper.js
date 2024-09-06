const listingContainer = document.querySelector('div[class="sc-2940a84d-0 ifHyQT"]');
chrome.runtime.sendMessage({
  type: "LISTING_SCRAPED",
  listing: listingContainer.outerHTML,
});
