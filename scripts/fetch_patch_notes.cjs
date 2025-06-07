const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { log } = require("console");

// Add debug function
function saveDebugInfo(html, year, month) {
  const debugDir = path.join("debug");
  if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const debugFile = path.join(debugDir, `patch_notes_${year}_${month}_${timestamp}.html`);
  fs.writeFileSync(debugFile, html);
  console.log(`Debug info saved to ${debugFile}`);
}

// Helper function to aggregate patches
function aggregatePatches(patches) {
  const patchMap = new Map();
  
  patches.forEach(patch => {
    const key = `${patch.date}-${patch.hero[0]}`;
    if (!patchMap.has(key)) {
      patchMap.set(key, {
        date: patch.date,
        hero: patch.hero,
        contents: [],
        patchTypes: new Set()
      });
    }
    
    const entry = patchMap.get(key);
    entry.contents.push(patch.content);
    entry.patchTypes.add(patch.patchType);
  });
  
  return Array.from(patchMap.values()).map(entry => ({
    date: entry.date,
    hero: entry.hero,
    content: entry.contents.join("\n"),
    patchType: determineDominantPatchType(Array.from(entry.patchTypes))
  }));
}

// Helper function to determine the dominant patch type
function determineDominantPatchType(patchTypes) {
  const typeCounts = {
    buff: 0,
    nerf: 0,
    update: 0
  };
  
  patchTypes.forEach(type => {
    typeCounts[type]++;
  });
  
  // If there are both buffs and nerfs, or if there are only updates, mark as update
  if ((typeCounts.buff > 0 && typeCounts.nerf > 0) || 
      (typeCounts.buff === 0 && typeCounts.nerf === 0)) {
    return "update";
  }
  
  // Return the type with changes
  return typeCounts.buff > 0 ? "buff" : "nerf";
}

async function fetchPatchNotes() {
  try {
    // Get current date info
    const today = new Date();
    const currentYear = today.getFullYear();
    // const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentMonth = "05"
    
    console.log(`Fetching patch notes for ${currentYear}/${currentMonth}`);
    
    // Construct URL for the current month's patch notes
    const url = `https://ow.blizzard.cn/news/patch-notes/live/${currentYear}/${currentMonth}/`;
    
    // Fetch the page
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://ow.blizzard.cn/"
      }
    });
    
    // Save debug info
    saveDebugInfo(response.data, currentYear, currentMonth);
    
    // If we get here, the page exists
    console.log(`Successfully fetched patch notes for ${currentYear}/${currentMonth}`);
    
    // Parse the HTML
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    // Initialize patches array
    const patches = [];
    
    // 根据调试信息，修正选择器以匹配页面结构
    console.log('Searching for patch elements...');
    const patchElements = document.querySelectorAll(".PatchNotes-patch");
    console.log(`Found ${patchElements.length} patch elements`);
    
    if (patchElements.length === 0) {
      console.log('No patch elements found with .PatchNotes-patch, trying alternative selectors...');
      return patches;
    }
    
    // Process each patch
    patchElements.forEach(patchElement => {
      // 获取补丁标题（包含日期）
      const patchTitleElement = patchElement.querySelector(".PatchNotes-patchTitle");
      if (!patchTitleElement) {
        console.log('No patch title element found');
        return;
      }
      
      const titleText = patchTitleElement.textContent;
      console.log('Title text:', titleText);
      
      // 从标题中提取日期（格式：《守望先锋》补丁说明——2025年5月30日）
      const dateMatch = titleText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
      if (!dateMatch) {
        console.log('No date match found in title');
        return;
      }
      
      const year = dateMatch[1];
      const month = String(dateMatch[2]).padStart(2, '0');
      const day = String(dateMatch[3]).padStart(2, '0');
      const patchDate = `${year}-${month}-${day}`;
      console.log('Extracted date:', patchDate);
      
      // 获取英雄更新部分
      const heroUpdateSections = patchElement.querySelectorAll(".PatchNotesHeroUpdate");
      console.log(`Found ${heroUpdateSections.length} hero update sections`);
      
      heroUpdateSections.forEach(heroSection => {
        const heroNameElement = heroSection.querySelector(".PatchNotesHeroUpdate-name");
        if (!heroNameElement) {
          console.log('No hero name element found');
          return;
        }
        
        const heroName = heroNameElement.textContent.trim();
        console.log('Hero name:', heroName);
        
        // 跳过非英雄的更新（如"物品"、"综合物品"等）
        if (heroName === "物品" || heroName === "综合物品") {
          console.log('Skipping non-hero update:', heroName);
          return;
        }
        
        // 获取英雄ID
        const heroId = getHeroId(heroName);
        if (!heroId) {
          console.log('Could not map hero name to ID:', heroName);
          return;
        }
        
        // 获取更新内容
        const updateElements = heroSection.querySelectorAll(".PatchNotesHeroUpdate-generalUpdates > ul > li");
        console.log(`Found ${updateElements.length} update elements for ${heroName}`);
        
        updateElements.forEach(updateElement => {
          const content = updateElement.textContent.trim();
          console.log('Update content:', content);
          
          // 确定是增强、削弱还是普通更新
          const patchType = determinePatchType(content);
          
          patches.push({
            date: patchDate,
            hero: [heroId],
            content: content,
            patchType: patchType
          });
        });
      });
    });
    
    console.log(`Total patches extracted: ${patches.length}`);
    
    // Aggregate patches before returning
    const aggregatedPatches = aggregatePatches(patches);
    console.log(`Total aggregated patches: ${aggregatedPatches.length}`);
    
    return aggregatedPatches;
    
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No patch notes found for the current month (404 error)");
      return [];
    } else {
      console.error("Error fetching patch notes:", error.message);
      throw error;
    }
  }
}

// Helper function to determine if a patch is a buff, nerf, or update
function determinePatchType(content) {
  // 增强关键词
  const buffKeywords = ["提高", "增加", "加快", "延长", "扩大", "提升"];
  // 削弱关键词
  const nerfKeywords = ["降低", "减少", "延长", "缩短", "减缓", "削弱"];
  
  // 检查是否包含增强关键词
  for (const keyword of buffKeywords) {
    if (content.includes(keyword)) {
      // 特殊情况：如果是伤害相关的降低/减少，则是削弱
      if (content.includes("伤害") && 
          (content.includes("降低") || content.includes("减少"))) {
        return "nerf";
      }
      
      // 特殊情况：如果是冷却时间延长，则是削弱
      if (content.includes("冷却") && content.includes("延长")) {
        return "nerf";
      }
      
      return "buff";
    }
  }
  
  // 检查是否包含削弱关键词
  for (const keyword of nerfKeywords) {
    if (content.includes(keyword)) {
      // 特殊情况：如果是冷却时间缩短/减少，则是增强
      if (content.includes("冷却") && 
          (content.includes("缩短") || content.includes("减少"))) {
        return "buff";
      }
      
      return "nerf";
    }
  }
  
  // 默认为普通更新
  return "update";
}

// Map hero names to hero IDs
function getHeroId(heroName) {
  const heroMap = {
    "安娜": "ana",
    "艾什": "ashe",
    "卡西迪": "cassidy",
    "D.Va": "dva",
    "末日铁拳": "doomfist",
    "回声": "echo",
    "源氏": "genji",
    "半藏": "hanzo",
    "伊拉锐": "illari",
    "朱诺": "junker-queen",
    "狂鼠": "junkrat",
    "卢西奥": "lucio",
    "美": "mei",
    "天使": "mercy",
    "莫伊拉": "moira",
    "奥丽莎": "orisa",
    "法老之鹰": "pharah",
    "死神": "reaper",
    "莱因哈特": "reinhardt",
    "路霸": "roadhog",
    "西格玛": "sigma",
    "士兵：76": "soldier-76",
    "黑影": "sombra",
    "生命之梭": "symmetra",
    "托比昂": "torbjorn",
    "猎空": "tracer",
    "黑百合": "widowmaker",
    "温斯顿": "winston",
    "破坏球": "wrecking-ball",
    "查莉娅": "zarya",
    "禅雅塔": "zenyatta",
    "弗蕾娅": "freja",
    "渣客女王": "junker-queen",
    "雾子": "kiriko",
    "骇灾": "mauga"
  };
  
  return heroMap[heroName] || null;
}

// Update the patch_notes.json file with new patches
async function updatePatchNotesFile(newPatches) {
  if (!newPatches || newPatches.length === 0) {
    console.log("No new patches to add");
    return;
  }
  
  const patchNotesPath = path.join( "data", "patch_notes.json");
  
  try {
    // Read the existing file
    const patchNotesData = JSON.parse(fs.readFileSync(patchNotesPath, "utf8"));
    
    // Add new patches
    const existingPatches = patchNotesData.patches || [];
    let addedCount = 0;
    
    // Check for duplicates and add only new patches
    for (const newPatch of newPatches) {
      const isDuplicate = existingPatches.some(patch => 
        patch.date === newPatch.date && 
        patch.hero.join(',') === newPatch.hero.join(',') && 
        patch.content === newPatch.content
      );
      
      if (!isDuplicate) {
        existingPatches.push(newPatch);
        addedCount++;
      }
    }
    
    // Sort patches by date (newest first)
    existingPatches.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update the file
    patchNotesData.patches = existingPatches;
    fs.writeFileSync(patchNotesPath, JSON.stringify(patchNotesData, null, 2));
    
    console.log(`Added ${addedCount} new patches to ${patchNotesPath}`);
  } catch (error) {
    console.error("Error updating patch notes file:", error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join("public", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Initialize patch_notes.json if it doesn't exist
    const patchNotesPath = path.join(dataDir, "patch_notes.json");
    if (!fs.existsSync(patchNotesPath)) {
      fs.writeFileSync(patchNotesPath, JSON.stringify({ patches: [] }, null, 2));
    }
    
    // Fetch patch notes
    const patches = await fetchPatchNotes();
    
    // Update the patch_notes.json file
    if (patches && patches.length > 0) {
      await updatePatchNotesFile(patches);
    } else {
      console.log("No patches found to update");
    }
  } catch (error) {
    console.error("Error in main function:", error.message);
    process.exit(1);
  }
}

// Run the main function
main(); 