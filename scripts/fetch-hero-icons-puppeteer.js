import fs from 'fs';
import path from 'path';
import https from 'https';
import puppeteer from 'puppeteer';
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

// 主函数
async function main() {
  let browser;
  let page;

  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();
    
    // 设置视口大小
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('Navigating to heroes page...');
    // 访问英雄页面
    await page.goto('https://ow.blizzard.cn/heroes/', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('Waiting for hero cards to load...');
    // 等待英雄卡片加载
    await page.waitForSelector('.hero-list-container', { timeout: 10000 });

    // 获取所有英雄卡片的信息
    const heroes = await page.evaluate(() => {
      // 尝试不同的选择器
      const cards = document.querySelectorAll('.hero-list-container .card-item');
      console.log(`Found ${cards.length} hero cards`);
      
      return Array.from(cards).map(card => {
        // 尝试不同的图片选择器
        const img = card.querySelector('img') || card.querySelector('.card-img');
        const name = card.querySelector('.card-name')?.textContent?.trim();
        const link = card.querySelector('a')?.getAttribute('href');
        const heroId = link?.split('/').pop();
        
        // 在浏览器控制台打印每个卡片的信息
        console.log({
          heroId,
          name,
          imageUrl: img?.getAttribute('src'),
          imgElement: img?.outerHTML,
          cardHTML: card.outerHTML
        });
        
        return {
          heroId,
          name,
          imageUrl: img?.getAttribute('src')
        };
      }).filter(hero => hero.heroId && hero.imageUrl);
    });

    // 打印找到的英雄信息
    console.log('Found heroes:', heroes);

    if (heroes.length === 0) {
      console.log('No heroes found. Taking screenshot for debugging...');
      await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
      
      // 获取页面HTML以供调试
      const html = await page.content();
      fs.writeFileSync('debug-page.html', html);
      
      throw new Error('No heroes found on the page');
    }

    // 下载所有英雄图标
    for (const hero of heroes) {
      const iconPath = path.join(iconDir, `${hero.heroId}.png`);
      
      try {
        await downloadImage(hero.imageUrl, iconPath);
        console.log(`Downloaded ${hero.name} (${hero.heroId})`);
      } catch (error) {
        console.error(`Error downloading ${hero.name}:`, error.message);
        // 如果下载失败，使用占位图
        if (!fs.existsSync(iconPath)) {
          fs.copyFileSync(path.join(__dirname, '../public/placeholder.png'), iconPath);
        }
      }
    }

    // 更新 hero_meta.json
    const heroMetaPath = path.join(__dirname, '../data/hero_meta.json');
    const heroMeta = JSON.parse(fs.readFileSync(heroMetaPath, 'utf8'));
    
    // 更新图标路径
    heroMeta.heroes = heroMeta.heroes.map(hero => ({
      ...hero,
      hero_icon: `/icons/${hero.hero_id}.png`
    }));

    // 保存更新后的元数据
    fs.writeFileSync(heroMetaPath, JSON.stringify(heroMeta, null, 2));
    console.log('Updated hero_meta.json');

  } catch (error) {
    console.error('Error:', error);
    // 如果出错，保存当前页面截图和HTML以供调试
    if (page) {
      try {
        await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
        const html = await page.content();
        fs.writeFileSync('error-page.html', html);
      } catch (e) {
        console.error('Failed to save debug info:', e);
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main().catch(console.error); 