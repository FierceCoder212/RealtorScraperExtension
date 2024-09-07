const scrollPage = async () => {
  let element = document.querySelector("html");
  let scrollAmount = 0;
  const scrollStepDown = 200; // Pixels per step for scrolling down
  const scrollStepUp = 500; // Pixels per step for scrolling up (faster)
  const scrollDelay = 10; // Delay between each step (ms)
  const maxScroll = element.scrollHeight - element.clientHeight;

  // Function to scroll down
  function asyncScrollDown() {
    return new Promise((resolve) => {
      function stepDown() {
        if (scrollAmount < maxScroll) {
          element.scrollBy(0, scrollStepDown);
          scrollAmount += scrollStepDown;
          setTimeout(stepDown, scrollDelay);
        } else {
          resolve(); // Resolve when scroll down is complete
        }
      }
      stepDown();
    });
  }

  // Function to scroll up
  function asyncScrollUp() {
    return new Promise((resolve) => {
      function stepUp() {
        if (scrollAmount > 0) {
          element.scrollBy(0, -scrollStepUp);
          scrollAmount -= scrollStepUp;
          setTimeout(stepUp, scrollDelay); // Continue scrolling up with delay
        } else {
          resolve(); // Resolve when scroll up is complete
        }
      }
      stepUp();
    });
  }

  // Chain the scroll down and scroll up operations
  await asyncScrollDown();
  await asyncScrollUp();
};
const getPageFromUrl = (url) => {
  const pageMatch = url.match(/pg-(\d+)/);
  return pageMatch ? parseInt(pageMatch[1], 10) : -1;
};
const isPagedUrl = (url) => url.match(/pg-(\d+)/);
const scrapePages = () => {
  const currentUrl = window.location.origin;
  const currentPageUrl = window.location.href;
  console.log(currentUrl);
  const pagesUrl = [];
  if (!isPagedUrl(currentPageUrl)) {
    const totalPages = document.querySelector("div.page-container a.pagination-item:last-child").textContent;
    for (let i = 1; i <= totalPages; i++) pagesUrl.push(`${currentPageUrl}/pg-${i}`);
  }
  const listings = document.querySelectorAll("section[data-testid=property-list] div[id^=placeholder_property] div[data-testid=card-content] a");
  if (listings.length === 0) chrome.runtime.sendMessage({ type: "LISTINGS_ERROR" });
  const listingsUrl = [];
  for (const listing of listings) {
    const relativeHref = listing.getAttribute("href");
    const fullUrl = new URL(relativeHref, currentUrl).href;
    listingsUrl.push(fullUrl);
  }
  chrome.runtime.sendMessage({
    type: "LISTINGS_SCRAPED",
    listings: listingsUrl,
    page: getPageFromUrl(currentUrl),
    pages: pagesUrl,
  });
  console.log(listings.length);
};
const startScraping = async () => {
  await scrollPage();
  scrapePages();
};
startScraping();
