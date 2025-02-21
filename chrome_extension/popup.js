document.getElementById('searchButton').addEventListener('click', () => {
  // Send a message to the content script to search for 'filter'
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: findAndClickFilter
    });
  });
});

// Function to search for 'filter' and click on the first occurrence
function findAndClickFilter() {
  const term = "filter";
  const regex = new RegExp(term, "gi");

  // Find all text nodes in the document
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    if (regex.test(node.nodeValue)) {
      // Create a range to highlight and click the term
      const range = document.createRange();
      const startIndex = node.nodeValue.toLowerCase().indexOf(term.toLowerCase());
      range.setStart(node, startIndex);
      range.setEnd(node, startIndex + term.length);

      // Create a wrapper element to make the term clickable
      const span = document.createElement("span");
      span.style.backgroundColor = "yellow";
      span.style.fontWeight = "bold";
      span.style.cursor = "pointer";
      range.surroundContents(span);

      // Click on the term
      span.click();

      console.log(`Found and clicked on "${term}".`);
      return; // Stop after the first occurrence
    }
  }

  console.log(`"${term}" not found on the page.`);
}