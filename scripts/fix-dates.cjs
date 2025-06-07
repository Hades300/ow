const fs = require('fs');
const path = require('path');

const dailyDir = path.join('data', 'daily');

fs.readdirSync(dailyDir)
    .filter(file => file.endsWith('.json'))
    .forEach(file => {
        const filePath = path.join(dailyDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const serverDate = data.data.data[0].ds;
        
        if (file !== `${serverDate}.json`) {
            const newPath = path.join(dailyDir, `${serverDate}.json`);
            fs.renameSync(filePath, newPath);
            console.log(`Renamed ${file} to ${serverDate}.json`);
        }
    });

console.log('Date fixing complete!'); 