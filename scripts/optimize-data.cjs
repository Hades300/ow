const fs = require('fs');
const path = require('path');

function optimizeHeroData(heroData) {
    return heroData.map(hero => ({
        i: hero.hero_id,
        t: hero.hero_type,
        s: hero.selection_ratio,
        w: hero.win_ratio,
        k: hero.kda,
        d: hero.ds
    }));
}

const dailyDir = path.join('data', 'daily');
const mergedData = {};

fs.readdirSync(dailyDir)
    .filter(file => file.endsWith('.json'))
    .forEach(file => {
        const filePath = path.join(dailyDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const serverDate = data.data.data[0].ds;
        
        mergedData[serverDate] = {
            s: data.season,
            h: optimizeHeroData(data.data.data)
        };
    });

fs.writeFileSync(
    path.join('data', 'merged_data.json'),
    JSON.stringify(mergedData, null, 2)
);

console.log('Data optimization complete!'); 