const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
require('dotenv').config();

const BASE_URL = 'https://api.moltyroyale.com/api';
const roles = ['HUNTER', 'FARMER', 'SURVIVOR', 'LOOTER', 'SCOUT'];
const ENV_PATH = path.join(__dirname, '.env');

// Helper: Generate Unique Name for New Accounts
function generateUniqueName() {
    const adj = ['Neon', 'Cyber', 'Shadow', 'Silent', 'Alpha', 'Omega'];
    const noun = ['Striker', 'Ghost', 'Ranger', 'Titan', 'Warrior', 'Specter'];
    return `${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}${Math.floor(Math.random() * 999)}`;
}

// Helper: Generic API Call
async function apiCall(path, method = 'GET', body = null) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method, headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : null
        });
        return await res.json();
    } catch (e) { return { success: false }; }
}

async function startSquad() {
    console.log("---------------------------------------------------------");
    console.log("🎥 MOLTY ROYALE GLOBAL SQUAD LAUNCHER");
    console.log("---------------------------------------------------------");

    let existingEnv = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : "";
    let updatedEnv = "";
    const squadConfigs = [];

    // Step 1: Sync accounts (Use existing or Register new)
    for (let i = 0; i < 5; i++) {
        const id = i + 1;
        const keyMatch = existingEnv.match(new RegExp(`API_KEY_${id}=(.*)`));
        const nameMatch = existingEnv.match(new RegExp(`BOT_NAME_${id}=(.*)`));
        
        let apiKey = keyMatch ? keyMatch[1].trim() : null;
        let botName = nameMatch ? nameMatch[1].trim() : null;

        if (!apiKey) {
            botName = generateUniqueName();
            console.log(`📝 [Agent ${id}] Registering new unique account: ${botName}...`);
            const reg = await apiCall('/accounts', 'POST', { name: botName });
            if (reg.success) apiKey = reg.data.apiKey;
        } else {
            console.log(`ℹ️  [Agent ${id}] Using existing account: ${botName}`);
        }

        if (apiKey) {
            squadConfigs.push({ apiKey, name: botName, role: roles[i] });
            updatedEnv += `API_KEY_${id}=${apiKey}\nBOT_NAME_${id}=${botName}\n`;
        }
    }
    fs.writeFileSync(ENV_PATH, updatedEnv, { flag: 'w' });

    // Step 2: Find or Create one Game ID for the whole squad
    console.log("---------------------------------------------------------");
    console.log("🔍 Finding an available Free Room for the squad...");
    const games = await apiCall('/games?status=waiting');
    let targetRoom = (games.data || []).find(g => g.entryType === 'free' && g.agentCount < (g.maxAgents - 5));

    if (!targetRoom) {
        console.log("📭 No rooms with enough slots. Creating a new massive room...");
        const create = await apiCall('/games', 'POST', { hostName: "SquadBase", mapSize: "massive" });
        if (create.success) targetRoom = create.data;
    }

    if (!targetRoom) {
        console.error("❌ Failed to secure a game room. Launcher aborted.");
        return;
    }

    const GAME_ID = targetRoom.id;
    console.log(`🚀 Target Secured: ${GAME_ID} (${targetRoom.agentCount}/${targetRoom.maxAgents})`);
    console.log("---------------------------------------------------------");

    // Step 3: Launch all 5 terminals
    squadConfigs.forEach(bot => {
        const cmd = `node bot.js "${bot.apiKey}" "${bot.role}" "${GAME_ID}"`;
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

startSquad();
