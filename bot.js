const Strategies = require('./strategies');
const BASE_URL = 'https://mort-royal-production.up.railway.app/api';
const [,, API_KEY, ROLE] = process.argv;

async function api(path, method = 'GET', body = null) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method, 
            headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
            body: body ? JSON.stringify(body) : null
        });
        return await res.json();
    } catch (e) {
        return { success: false };
    }
}

async function runBot() {
    const acc = await api('/accounts/me');
    const BOT_NAME = acc.data.name;
    console.log(`[${BOT_NAME}] Role: ${ROLE} - Initializing...`);

    while (true) {
        // 1. Find and Join a Free Room
        const games = await api('/games?status=waiting');
        const room = (games.data || []).find(g => g.entryType === 'free' && g.agentCount < g.maxAgents);
        
        if (!room) {
            console.log(`[${BOT_NAME}] No available rooms. Retrying in 15s...`);
            await new Promise(r => setTimeout(r, 15000));
            continue;
        }

        const reg = await api(`/games/${room.id}/agents/register`, 'POST', { name: BOT_NAME });
        const agentId = reg.data?.id;

        if (!agentId) {
            await new Promise(r => setTimeout(r, 5000));
            continue;
        }

        // 2. Gameplay Loop
        console.log(`[${BOT_NAME}] Joined Room: ${room.id}`);
        while (true) {
            const stateRes = await api(`/games/${room.id}/agents/${agentId}/state`);
            const state = stateRes.data;

            if (!state || state.gameStatus === 'finished' || !state.self.isAlive) break;
            
            if (state.gameStatus === 'waiting') {
                console.log(`[${BOT_NAME}] Waiting for game to start...`);
                await new Promise(r => setTimeout(r, 15000));
                continue;
            }

            // Execute Strategy based on Role
            const action = Strategies[ROLE](state);
            await api(`/games/${room.id}/agents/${agentId}/action`, 'POST', { 
                action,
                thought: { reasoning: `Playing as ${ROLE}`, plannedAction: action.type }
            });
            
            console.log(`[${BOT_NAME}] Executing: ${action.type}`);
            await new Promise(r => setTimeout(r, 61500)); // Turn cooldown
        }
        console.log(`[${BOT_NAME}] Game over. Searching for new tournament...`);
        await new Promise(r => setTimeout(r, 10000));
    }
}

runBot();