import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建目标目录
const iconDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// 下载图片函数
async function downloadImage(url, filepath) {
  console.log(`Attempting to download: ${url}`);
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => reject(err));
      });
    }).on('error', reject);
  });
}

// 从调试页面提取英雄信息
function extractHeroesFromDebugPage() {
  const htmlPath = path.join(__dirname, '../debug-page.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // 使用正则表达式提取所有英雄卡片信息
  const cardItemRegex = /<div class="card-item">.*?<img src="(.*?)".*?<div class="name-text">(.*?)<\/div>.*?<a href="https:\/\/ow\.blizzard\.cn\/heroes\/(.*?)\/".*?<\/div>/gs;
  
  const heroes = [];
  let match;
  
  while ((match = cardItemRegex.exec(html)) !== null) {
    const [_, imageUrl, heroName, heroId] = match;
    heroes.push({
      heroId,
      name: heroName,
      imageUrl
    });
  }
  
  return heroes;
}

// 主函数
async function main() {
  try {
    console.log('Extracting heroes from debug page...');
    const heroes = extractHeroesFromDebugPage();
    
    console.log(`Found ${heroes.length} heroes`);
    
    if (heroes.length === 0) {
      throw new Error('No heroes found in the debug page');
    }
    
    // 下载所有英雄图标
    for (const hero of heroes) {
      const iconPath = path.join(iconDir, `${hero.heroId}.png`);
      
      try {
        await downloadImage(hero.imageUrl, iconPath);
        console.log(`Downloaded ${hero.name} (${hero.heroId})`);
      } catch (error) {
        console.error(`Error downloading ${hero.name}:`, error.message);
      }
    }

    // 更新 hero_meta.json
    const heroMetaPath = path.join(__dirname, '../data/hero_meta.json');
    const heroMeta = JSON.parse(fs.readFileSync(heroMetaPath, 'utf8'));
    
    // 创建英雄ID到名称的映射
    const heroNameMap = {};
    heroes.forEach(hero => {
      heroNameMap[hero.heroId] = hero.name;
    });
    
    // 更新图标路径
    heroMeta.heroes = heroMeta.heroes.map(hero => ({
      ...hero,
      hero_icon: `/icons/${hero.hero_id}.png`,
      // 如果英雄名称在映射中存在，则更新
      hero_name: heroNameMap[hero.hero_id] || hero.hero_name
    }));

    // 保存更新后的元数据
    fs.writeFileSync(heroMetaPath, JSON.stringify(heroMeta, null, 2));
    console.log('Updated hero_meta.json');

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error); 