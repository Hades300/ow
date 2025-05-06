// Cloudflare Worker 入口文件

// 环境变量配置
const GITHUB_TOKEN = ''; // 需要在 Cloudflare 控制台设置
const GITHUB_REPO = 'your-username/ow-hero-dashboard';
const GITHUB_BRANCH = 'main';

// API路由处理
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS 头部设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 预检请求处理
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // 获取英雄元数据
    if (path === '/api/heroes') {
      const response = await fetch(
        `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data/hero_meta.json`
      );
      const data = await response.json();
      return new Response(JSON.stringify(data.heroes), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 获取英雄历史数据
    if (path.startsWith('/api/hero-data/')) {
      const heroId = path.split('/').pop();
      const { start, end } = url.searchParams;
      
      // 从 GitHub 获取历史数据
      const dataFiles = await listDataFiles(start, end);
      const heroData = await fetchHeroData(heroId, dataFiles);
      
      return new Response(JSON.stringify(heroData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 获取补丁记录
    if (path.startsWith('/api/patch-notes/')) {
      const heroId = path.split('/').pop();
      const { start, end } = url.searchParams;

      const response = await fetch(
        `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data/patch_notes.json`
      );
      const data = await response.json();
      
      // 过滤指定英雄和时间范围的补丁记录
      const filteredPatches = data.patches.filter(patch => {
        const patchDate = new Date(patch.date);
        return patchDate >= new Date(start) &&
               patchDate <= new Date(end) &&
               (patch.hero.includes(heroId) || patch.hero.includes('*'));
      });

      return new Response(JSON.stringify(filteredPatches), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 列出指定时间范围内的数据文件
async function listDataFiles(start, end) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/data/daily`,
    {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );
  
  const files = await response.json();
  return files
    .filter(file => {
      const date = file.name.replace('.json', '');
      return date >= start && date <= end;
    })
    .map(file => file.name);
}

// 获取英雄的历史数据
async function fetchHeroData(heroId, files) {
  const data = [];
  
  for (const file of files) {
    const response = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data/daily/${file}`
    );
    const dailyData = await response.json();
    const heroData = dailyData.data.find(h => h.hero_id === heroId);
    
    if (heroData) {
      data.push({
        ...heroData,
        ds: file.replace('.json', '')
      });
    }
  }
  
  return data;
}

// 注册 Worker 处理函数
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});