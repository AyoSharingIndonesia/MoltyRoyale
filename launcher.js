const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BASE_URL = 'https://api.moltyroyale.com/api';
const roles = ['HUNTER', 'FARMER', 'SURVIVOR', 'LOOTER', 'SCOUT'];
const ENV_PATH = path.join(__dirname, '.env');

function generateName() {
    const adj = ['Cyber', 'Neon', 'Shadow', 'Silent', 'Alpha'];
    const noun = ['Hunter', 'Striker', 'Ranger', 'Specter', 'Warrior'];
    return `${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}${Math.floor(Math.random() * 999)}`;
}

async function register(name) {
    try {
        const res = await fetch(`${BASE_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const json = await res.json();
        return json.success ? json.data.apiKey : null;
    } catch (e) { return null; }
}

async function start() {
    console.log("🎥 MOLTY ROYALE GLOBAL TUTORIAL - UNIQUE BOT SETUP");
    let existingEnv = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : "";
    let updatedEnv = "";
    const configs = [];

    for (let i = 0; i < 5; i++) {
        const id = i + 1;
        const keyMatch = existingEnv.match(new RegExp(`API_KEY_${id}=(.*)`));
        const nameMatch = existingEnv.match(new RegExp(`BOT_NAME_${id}=(.*)`));
        
        let apiKey = keyMatch ? keyMatch[1].trim() : null;
        let botName = nameMatch ? nameMatch[1].trim() : null;

        if (!apiKey) {
            botName = generateName();
            console.log(`📝 Registering unique bot: ${botName}...`);
            apiKey = await register(botName);
        }

        if (apiKey) {
            configs.push({ apiKey, name: botName, role: roles[i] });
            updatedEnv += `API_KEY_${id}=${apiKey}\nBOT_NAME_${id}=${botName}\n`;
        }
    }

    fs.writeFileSync(ENV_PATH, updatedEnv, { flag: 'w' });
    console.log(`💾 Configuration saved to: ${ENV_PATH}`);

    configs.forEach(bot => {
        const cmd = `node bot.js "${bot.apiKey}" "${bot.role}"`;
        const platform = os.platform();
        if (platform === 'win32') exec(`start cmd.exe /k "title ${bot.name} [${bot.role}] && ${cmd}"`);
        else if (platform === 'darwin') exec(`osascript -e 'tell application "Terminal" to do script "cd ${process.cwd()} && ${cmd}"'`);
        else exec(`gnome-terminal -- bash -c "${cmd}; exec bash"`);
    });
}

start();
