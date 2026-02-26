// strategies.js - Simple AI Logic for 5 Roles
const Strategies = {
    // 1. THE HUNTER: Aggressively hunts other players
    HUNTER: (state) => {
        const { self, visibleAgents } = state;
        const target = visibleAgents.find(a => a.isAlive);
        if (target && self.ep >= 2) return { type: 'attack', targetId: target.id, targetType: 'agent' };
        return { type: 'explore' };
    },
    // 2. THE FARMER: Focuses on monsters to collect $Moltz
    FARMER: (state) => {
        const { self, visibleMonsters } = state;
        const monster = visibleMonsters[0];
        if (monster && self.ep >= 2) return { type: 'attack', targetId: monster.id, targetType: 'monster' };
        return { type: 'explore' };
    },
    // 3. THE SURVIVOR: Plays safe and rests to recover HP/EP
    SURVIVOR: (state) => {
        const { self } = state;
        if (self.hp < 70) return { type: 'rest' };
        if (self.ep < 5) return { type: 'rest' };
        return { type: 'explore' };
    },
    // 4. THE LOOTER: Prioritizes interacting with Supply Caches
    LOOTER: (state) => {
        const { currentRegion } = state;
        const cache = currentRegion.interactables.find(f => f.type === 'supply_cache' && !f.isUsed);
        if (cache) return { type: 'interact', interactableId: cache.id };
        return { type: 'explore' };
    },
    // 5. THE SCOUT: Focuses on moving to discover the map
    SCOUT: (state) => {
        const { currentRegion } = state;
        const nextRegion = currentRegion.connections[0];
        return { type: 'move', regionId: nextRegion };
    }
};

module.exports = Strategies;
