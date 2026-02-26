const Strategies = require('./strategies');
const BASE_URL = 'https://api.moltyroyale.com/api';
const [,, API_KEY, ROLE] = process.argv;

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
    } catch (e) { return { success: false, error: { message: "Network Timeout" } }; }
}

async function findMe() {
    for (const status of ['waiting', 'running']) {
        const gamesRes = await api(`/games?status=${status}`);
        if (gamesRes.success && gamesRes.data) {
            for (const game of gamesRes.data) {
                if (finishedGames.has(game.id)) continue;
                const state = await api(`/games/${game.id}/state`);
                const found = state.data?.agents?.find(a => a.name.toLowerCase() === BOT_NAME.toLowerCase());
                if (found && found.isAlive) return { gameId: game.id, agentId: found.id };
            }
        }
    }
    return null;
}

async function runBot() {
    const acc = await api('/accounts/me');
    if (!acc.success) return console.log("Invalid API Key");
    BOT_NAME = acc.data.name;
    console.log(`[${BOT_NAME}] Role: ${ROLE} - Initialized.`);

    while (true) {
        let gameId, agentId;
        const existing = await findMe();
        if (existing) { gameId = existing.gameId; agentId = existing.agentId; }

        if (!agentId) {
            const games = await api('/games?status=waiting');
            const room = (games.data || []).find(g => g.entryType === 'free' && g.agentCount < g.maxAgents);
            
            if (room) {
                console.log(`[${BOT_NAME}] Attempting to join: ${room.id}`);
                const reg = await api(`/games/${room.id}/agents/register`, 'POST', { name: BOT_NAME });
                if (reg.success) {
                    gameId = room.id; agentId = reg.data.id;
                } else {
                    const verify = await findMe();
                    if (verify) { gameId = verify.gameId; agentId = verify.agentId; }
                }
            }
        }

        if (!agentId) {
            console.log(`[${BOT_NAME}] No free slots. Waiting 15s...`);
            await new Promise(r => setTimeout(r, 15000));
            continue;
        }

        console.log(`[${BOT_NAME}] Active in Game: ${gameId}`);
        while (true) {
            const stateRes = await api(`/games/${gameId}/agents/${agentId}/state`);
            if (!stateRes.success || stateRes.data.gameStatus === 'finished' || !stateRes.data.self.isAlive) {
                finishedGames.add(gameId);
                break;
            }

            const state = stateRes.data;
            if (state.gameStatus === 'waiting') {
                await new Promise(r => setTimeout(r, 15000));
                continue;
            }

            // Execute Actions
            const action = Strategies[ROLE](state);
            await api(`/games/${gameId}/agents/${agentId}/action`, 'POST', { 
                action, thought: { reasoning: `Playing ${ROLE}`, plannedAction: action.type }
            });
            
            console.log(`[${BOT_NAME}] Executed: ${action.type}`);
            await new Promise(r => setTimeout(r, 61500)); 
        }
        await new Promise(r => setTimeout(r, 10000));
    }
}

runBot();
