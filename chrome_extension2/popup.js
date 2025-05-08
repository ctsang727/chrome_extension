document.getElementById('searchButton').addEventListener('click', () => {
  console.log("HERE");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: clickFilter
    });
  });
});

function clickFilter() {
  const filterTerm = "filter";
  const allElements = document.querySelectorAll('*');

  for (const el of allElements) {
    if (el.textContent.toLowerCase().includes(filterTerm.toLowerCase())) {
      el.click();
      console.log(`Successfully clicked "${filterTerm}"`);
      return;
    }
  }
  console.log(`Could not find "${filterTerm}" on the page`);
}