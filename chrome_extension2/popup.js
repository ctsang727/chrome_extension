// ===== EXTENSION TRIGGER =====
document.getElementById('searchButton').addEventListener('click', () => {
  console.log("Starting filter automation...");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: runFilterAutomation // Changed from clickFilter to new state machine
    });
  });
});

// ===== INJECTED SCRIPT (runs on target page) =====
function runFilterAutomation() {
  // ===== STATE CONFIGURATION =====
  const states = {
    IDLE: 0,
    OPENING_FILTERS: 1,
    SELECTING_OPTIONS: 2,
    APPLYING: 3,
    DONE: 4
  };

  // ===== STATE MACHINE CORE =====
  let currentState = states.IDLE;
  const stateNames = {
    0: "Ready to start",
    1: "Opening filter panel",
    2: "Selecting options",
    3: "Applying filters",
    4: "Completed"
  };
  async function runWorkflow() {
    try {
      switch (currentState) {
        case states.IDLE:
          console.log("Starting workflow...");
          await clickElement('filter', 1500);
          currentState = states.OPENING_FILTERS;
          break;

        case states.OPENING_FILTERS:
          //await clickElement('size', 500);
          await selectFilter('Size');
          await selectFilter('Color');
          await selectFilter('Activity');
          // await clickElement('in stock', 500);
          currentState = states.SELECTING_OPTIONS;
          break;

        case states.SELECTING_OPTIONS:
          // await clickElement('apply', 2000);
          await selectFilter('Size');
          await selectFilter('Color');
          await selectFilter('Activity');
          currentState = states.APPLYING;
          //break;
          return;

        default:
          throw new Error(`Unknown state: ${currentState}`);
      }

      setTimeout(runWorkflow, 100);
    } catch (error) {
      console.error(`FAILED at ${stateNames[currentState]}:`, error);
      setTimeout(runWorkflow, 1000);
    }
  }

  async function selectFilter(filterName, delay = 500) {
    console.log(currentState, filterName, 'here');
    const element = findFilterSection(filterName);
    if (element) {
      console.log(element);
      element.click();
      await new Promise(resolve => setTimeout(resolve, delay));
      return true;
    }
    return false;
  }

  // ===== HELPER FUNCTIONS =====
  function clickElement(searchText, delayAfter = 0) {
    return new Promise((resolve, reject) => {
      console.log(currentState);
      if (currentState == 0) {
        const el = findClickableElement(searchText);
        if (el) {
          el.click();
          console.log(`Clicked: "${searchText}"`);
          setTimeout(resolve, delayAfter);
        } else {
          reject(new Error(`Element not found: "${searchText}"`));
        }
      }
      else if (currentState == 1) {
        console.log('here state 1')
        console.log(searchText);
        const el = findSpecificElement(searchText);
        console.log(el);
        if (el) {
          el.click();
          console.log(`Clicked: "${searchText}"`);
          setTimeout(resolve, delayAfter);
        } else {
          reject(new Error(`Element not found: "${searchText}"`));
        }
      }

    });
  }

  function findClickableElement(text) {
    const candidates = document.querySelectorAll('button, a, [role="button"], [onclick]');
    for (const el of candidates) {
      const content = (el.textContent || el.innerText || '').trim().toLowerCase();
      if (content.includes(text.toLowerCase())) {
        return el;
      }
    }
    return null;
  }

  function findSpecificElement(text) {
    const candidates = document.querySelectorAll('section');
    for (const el of candidates) {
      const content = (el.textContent || el.innerText || '').trim().toLowerCase();
      if (content.includes(text.toLowerCase())) {
        return el;
      }
    }
    return null;
  }

  function findFilterSection(filterName) {
  // Try multiple selector strategies (ordered by reliability)
  const strategies = [
    // Strategy 1: Look for exact text match in clickable elements
    () => {
      const elements = document.querySelectorAll('button, a, [role="button"], .filter-item');
      return [...elements].find(el => 
        (el.textContent || '').trim().toLowerCase() === filterName.toLowerCase()
      );
    },
    
    // Strategy 2: Find label with matching text then locate nearby button
    () => {
      const label = [...document.querySelectorAll('h4, span, div')].find(el => 
        (el.textContent || '').trim().toLowerCase().includes(filterName.toLowerCase())
      );
      return label?.closest('button') || 
             label?.nextElementSibling || 
             label?.parentElement;
    },
    
    // Strategy 3: Search by common class patterns
    () => document.querySelector(`[class*="${filterName.toLowerCase()}" i]`)
  ];

  // Execute strategies in order until we find a match
  for (const strategy of strategies) {
    const element = strategy();
    console.log('good?')
    if (element) return element;
  }

  return null; // No match found
}

  // ===== START THE WORKFLOW =====
  runWorkflow();
}