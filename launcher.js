const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');

const BASE_URL = 'https://mort-royal-production.up.railway.app/api';
const roles = ['HUNTER', 'FARMER', 'SURVIVOR', 'LOOTER', 'SCOUT'];

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
        return null;
    }
}

async function startTutorial() {
    console.log("---------------------------------------------------------");
    console.log("🎥 MOLTY ROYALE MULTI-AGENT TUTORIAL");
    console.log("---------------------------------------------------------");
    console.log("Step 1: Registering 5 Automated Agents...");
    
    for (let i = 0; i < 5; i++) {
        const botName = `GlobalBot-${i + 1}`;
        const apiKey = await register(botName);
        const role = roles[i];

        if (apiKey) {
            console.log(`✅ [${botName}] Registered! Assigned Role: ${role}`);
            
            const cmd = `node bot.js "${apiKey}" "${role}"`;
            const platform = os.platform();

            // Open a new terminal window based on OS
            if (platform === 'win32') {
                exec(`start cmd.exe /k "title ${botName} - ${role} && ${cmd}"`);
            } else if (platform === 'darwin') {
                exec(`osascript -e 'tell application "Terminal" to do script "cd ${process.cwd()} && ${cmd}"'`);
            } else {
                exec(`gnome-terminal -- bash -c "${cmd}; exec bash"`);
            }
        }
        // Small delay to prevent API spamming
        await new Promise(r => setTimeout(r, 2000));
    }
    console.log("---------------------------------------------------------");
    console.log("🚀 All 5 terminals launched! Check the new windows.");
    console.log("---------------------------------------------------------");
}

startTutorial();