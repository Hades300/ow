const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

// Mock the current date to test specific months
function mockDate(year, month) {
  const originalDate = Date;
  global.Date = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        return new originalDate(year, month - 1, 1);
      }
      return new originalDate(...args);
    }
    static now() {
      return new originalDate(year, month - 1, 1).getTime();
    }
  };
  
  // Restore the original Date after testing
  return () => {
    global.Date = originalDate;
  };
}

async function testFetchPatchNotes(year, month) {
  try {
    const restore = mockDate(year, month);
    
    // Get current date info (mocked)
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    
    console.log(`Testing fetch patch notes for ${currentYear}/${currentMonth}`);
    
    // Construct URL for the current month's patch notes
    const url = `https://ow.blizzard.cn/news/patch-notes/live/${currentYear}/${currentMonth}/`;
    
    try {
      // Fetch the page
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
          "Referer": "https://ow.blizzard.cn/"
        }
      });
      
      console.log(`Successfully fetched patch notes for ${currentYear}/${currentMonth}`);
      console.log(`Response status: ${response.status}`);
      console.log(`Content length: ${response.data.length}`);
      
      // Save the HTML for inspection
      const testDir = path.join("test_data");
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(testDir, `patch_notes_${currentYear}_${currentMonth}.html`), response.data);
      console.log(`Saved HTML to test_data/patch_notes_${currentYear}_${currentMonth}.html`);
      
      // Parse a few elements to verify the structure
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      const patchElements = document.querySelectorAll(".PatchNotes-patch");
      console.log(`Found ${patchElements.length} patch notes`);
      
      if (patchElements.length > 0) {
        const firstPatch = patchElements[0];
        const titleElement = firstPatch.querySelector(".PatchNotes-patchTitle");
        if (titleElement) {
          console.log(`First patch title: ${titleElement.textContent}`);
        }
      }
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`No patch notes found for ${currentYear}/${currentMonth} (404 error)`);
      } else {
        console.error(`Error fetching patch notes for ${currentYear}/${currentMonth}:`, error.message);
      }
    }
    
    // Restore the original Date
    restore();
    
  } catch (error) {
    console.error("Error in test function:", error.message);
  }
}

// Test for a few months
async function runTests() {
  // Test current month
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  await testFetchPatchNotes(currentYear, currentMonth);
  
  // Test previous month
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  await testFetchPatchNotes(prevYear, prevMonth);
  
  // Test a month that likely doesn't exist (future)
  const futureMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const futureYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  
  await testFetchPatchNotes(futureYear, futureMonth);
}

runTests(); 