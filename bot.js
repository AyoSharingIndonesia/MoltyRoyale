const Strategies = require('./strategies');
const BASE_URL = 'https://api.moltyroyale.com/api';

// Arguments passed from launcher.js
const [,, API_KEY, ROLE, ASSIGNED_GAME_ID] = process.argv;
let BOT_NAME = "";
const finishedGames = new Set();

async function api(path, method = 'GET', body = null) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
            body: body ? JSON.stringify(body) : null
        });
        return await res.json();
    } catch (e) { return { success: false }; }
}

async function findMe(gameId) {
    const state = await api(`/games/${gameId}/state`);
    const me = state.data?.agents?.find(a => a.name.toLowerCase() === BOT_NAME.toLowerCase());
    return (me && me.isAlive) ? me.id : null;
}

async function runBot() {
    const acc = await api('/accounts/me');
    if (!acc.success) return console.error("Invalid API Key. Authentication failed.");
    BOT_NAME = acc.data.name;
    
    console.log(`[${BOT_NAME}] Role: ${ROLE} - Initializing for Game: ${ASSIGNED_GAME_ID}`);

    while (true) {
        let agentId = null;

        // 1. Join the specific room assigned by the launcher
        const reg = await api(`/games/${ASSIGNED_GAME_ID}/agents/register`, 'POST', { name: BOT_NAME });
        
        if (reg.success) {
            agentId = reg.data.id;
        } else if (reg.error?.code === "ACCOUNT_ALREADY_IN_GAME") {
            // If already in a game, verify if it's this one
            agentId = await findMe(ASSIGNED_GAME_ID);
        }

        if (!agentId) {
            console.log(`[${BOT_NAME}] Critical: Could not join or find agent in game ${ASSIGNED_GAME_ID}.`);
            process.exit(1); // Stop this bot process
        }

        // 2. Gameplay Loop
        console.log(`[${BOT_NAME}] Successfully deployed. Waiting for match start...`);
        while (true) {
            const stateRes = await api(`/games/${ASSIGNED_GAME_ID}/agents/${agentId}/state`);
            if (!stateRes.success || !stateRes.data.self.isAlive || stateRes.data.gameStatus === 'finished') break;

            const state = stateRes.data;
            if (state.gameStatus === 'waiting') {
                await new Promise(r => setTimeout(r, 15000));
                continue;
            }

            // Group 2: Free Actions (Pickup/Equip)
            const loot = state.visibleItems.find(i => i.regionId === state.self.regionId);
            if (loot && state.self.inventory.length < 10) await api(`/games/${ASSIGNED_GAME_ID}/agents/${agentId}/action`, 'POST', { action: { type: 'pickup', itemId: loot.item.id } });
            
            const wpn = state.self.inventory.filter(i => i.category === 'weapon').sort((a,b) => b.atkBonus - a.atkBonus)[0];
            if (wpn && (!state.self.equippedWeapon || wpn.atkBonus > state.self.equippedWeapon.atkBonus)) {
                await api(`/games/${ASSIGNED_GAME_ID}/agents/${agentId}/action`, 'POST', { action: { type: 'equip', itemId: wpn.id } });
            }

            // Group 1: Strategic Action
            let act = state.currentRegion.isDeathZone ? { type: 'move', regionId: state.currentRegion.connections[0] } : Strategies[ROLE](state);
            await api(`/games/${ASSIGNED_GAME_ID}/agents/${agentId}/action`, 'POST', { action: act, thought: { reasoning: ROLE, plannedAction: act.type } });

            console.log(`[${BOT_NAME}] Action: ${act.type} performed.`);
            await new Promise(r => setTimeout(r, 61500)); // Standard 1-minute turn cooldown
        }
        
        console.log(`[${BOT_NAME}] Game ended or Agent eliminated. Process terminating.`);
        process.exit(0);
    }
}

runBot();
