const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BASE_URL = 'https://mort-royal-production.up.railway.app/api';
const roles = ['HUNTER', 'FARMER', 'SURVIVOR', 'LOOTER', 'SCOUT'];
const ENV_PATH = path.join(__dirname, '.env');

// Step 1: Unique Name Generator (Cyber-style)
function generateUniqueName() {
    const adjectives = ['Cyber', 'Neon', 'Shadow', 'Silent', 'Alpha', 'Ghost', 'Iron', 'Omega', 'Vortex', 'Hyper', 'Brave', 'Titan'];
    const nouns = ['Hunter', 'Striker', 'Ranger', 'Titan', 'Rogue', 'Knight', 'Slasher', 'Pilot', 'Specter', 'Blade', 'Runner', 'Warrior'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 9999); // 4-digit random number
    
    return `${adj}${noun}${num}`; // Example: CyberHunter1234
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
    } catch (e) {
        console.error(`Error registering ${name}:`, e.message);
        return null;
    }
}

async function startTutorial() {
    console.log("---------------------------------------------------------");
    console.log("🎥 MOLTY ROYALE GLOBAL TUTORIAL - UNIQUE BOT SETUP");
    console.log("---------------------------------------------------------");

    let existingEnv = "";
    if (fs.existsSync(ENV_PATH)) {
        existingEnv = fs.readFileSync(ENV_PATH, 'utf8');
    }

    const botConfigs = [];
    let updatedEnvContent = "";

    for (let i = 0; i < 5; i++) {
        const botId = i + 1;
        
        // Search for existing config in .env
        const keyRegex = new RegExp(`API_KEY_${botId}=(.*)`);
        const nameRegex = new RegExp(`BOT_NAME_${botId}=(.*)`);
        
        const keyMatch = existingEnv.match(keyRegex);
        const nameMatch = existingEnv.match(nameRegex);
        
        let apiKey = keyMatch ? keyMatch[1].trim() : null;
        let botName = nameMatch ? nameMatch[1].trim() : null;

        // 2. If the API key is missing, generate a unique name and register
        if (!apiKey) {
            const uniqueName = generateUniqueName();
            console.log(`📝 Registering unique account: ${uniqueName}...`);
            
            apiKey = await register(uniqueName);
            if (!apiKey) continue;
            
            botName = uniqueName;
            console.log(`✅ Success! [${botName}] is ready.`);
        } else {
            console.log(`ℹ️  Found existing account: ${botName}`);
        }

        const role = roles[i];
        botConfigs.push({ apiKey, name: botName, role });
        updatedEnvContent += `API_KEY_${botId}=${apiKey}\nBOT_NAME_${botId}=${botName}\n`;
    }

    // 3. Save to .env
    fs.writeFileSync(ENV_PATH, updatedEnvContent, { encoding: 'utf8', flag: 'w' });
    console.log(`💾 Configuration saved to: ${ENV_PATH}`);

    // 4. Launch terminal windows
    console.log("🚀 Launching unique bot instances...");
    botConfigs.forEach(bot => {
        const cmd = `node bot.js "${bot.apiKey}" "${bot.role}"`;
        const platform = os.platform();

        if (platform === 'win32') {
            exec(`start cmd.exe /k "title ${bot.name} [${bot.role}] && ${cmd}"`);
        } else if (platform === 'darwin') {
            exec(`osascript -e 'tell application "Terminal" to do script "cd ${process.cwd()} && ${cmd}"'`);
        } else {
            exec(`gnome-terminal -- bash -c "${cmd}; exec bash"`);
        }
    });
}

startTutorial();
