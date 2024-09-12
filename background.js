const scraper = {
  tabId: null,
  baseUrl: "https://www.realtor.com/realestateandhomes-search/Texas",
  pages: [],
  listings: [],
  pagesIndex: 0,
  listingsIndex: 0,
};
const apiUrl = "http://127.0.0.1:8000/ScrapeListing";
const apiData = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};
let errorResumeMinutes = 1;
chrome.runtime.onInstalled.addListener(function () {
  console.log("Extension Loaded");
  resetScraper();
  createTab(scraper.baseUrl);
});
chrome.runtime.onMessage.addListener((object, sender, response) => {
  try {
    const { type, listings, pages } = object;
    if (type === "LISTINGS_SCRAPED") {
      errorResumeMinutes = 1;
      incrementPage();
      closeTab();
      console.log(`Got Listings : ${listings.length}`);
      scraper.listings = listings;
      if (pages.length > 0) {
        console.log(`Got Pages : ${pages.length}`);
        scraper.pages = pages;
      }
      scrapeListing();
    }
  } catch (error) {
    console.error("Error handling UNLOAD message:", error);
  }
});
chrome.runtime.onMessage.addListener((object, sender, response) => {
  try {
    const { type, listing } = object;
    if (type === "LISTING_SCRAPED") {
      errorResumeMinutes = 1;
      console.log("Sending listing to api....");
      fetch(apiUrl, { ...apiData, body: JSON.stringify({ html: listing, link: getCurrentListing() }) })
        .then((response) => {
          if (!response.ok) throw new Error(`Server error: ${response.status}`);
          return response.text();
        })
        .then((data) => console.log("Response successful", data))
        .catch((error) => console.error(`Error when saving listing: ${error}`));
      closeTab();
      incrementListing();
      scrapeListing();
    }
  } catch (error) {
    console.error("Error handling UNLOAD message:", error);
  }
});
chrome.runtime.onMessage.addListener((object, sender, response) => {
  const { type } = object;
  if (type === "LISTINGS_ERROR") {
    console.error(`Listings error resuming after ${errorResumeMinutes}mins`);
    errorResumeMinutes += 1;
    closeTab();
    setTimeout(() => scrapeListing(), errorResumeMinutes * 60 * 1000);
  }
});
chrome.runtime.onMessage.addListener((object, sender, response) => {
  const { type } = object;
  if (type === "LISTING_ERROR") {
    console.error(`Listings page error resuming after ${errorResumeMinutes}mins`);
    errorResumeMinutes += 1;
    closeTab();
    setTimeout(() => scrapeListing(), errorResumeMinutes * 60 * 1000);
  }
});

const closeTab = () => {
  if (scraper.tabId) chrome.tabs.remove(scraper.tabId);
  scraper.tabId = null;
};
const createTab = (url) => chrome.tabs.create({ url: url }, (currentTab) => (scraper.tabId = currentTab.id));
const incrementPage = () => (scraper.pagesIndex += 1);
const incrementListing = () => (scraper.listingsIndex += 1);
const getCurrentListing = () => scraper.listings[scraper.listingsIndex];
const getCurrentPage = () => scraper.pages[scraper.pagesIndex];
const scrapeListing = () => {
  const listing = getCurrentListing();
  const page = getCurrentPage();
  if (listing) {
    console.log(`Index : ${scraper.listingsIndex} out of ${scraper.listings.length}, Creating tab for listing ${listing}`);
    createTab(listing);
  } else if (page) {
    console.log(`Index : ${scraper.pagesIndex} out of ${scraper.pages.length}, Creating tab for page ${page}`);
    createTab(page);
    resetListings();
  } else {
    console.log("Scraping Complete");
  }
};

const resetScraper = () => {
  scraper.pages = [];
  scraper.listings = [];
  scraper.pagesIndex = 0;
  scraper.listingsIndex = 0;
  scraper.tabId = null;
};
const resetListings = () => {
  scraper.listings = [];
  scraper.listingsIndex = 0;
};
