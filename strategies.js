// strategies.js - Simple AI logic for 5 different roles
const Strategies = {
    // 1. THE HUNTER: Looks for other players to attack
    HUNTER: (state) => {
        const target = state.visibleAgents.find(a => a.isAlive);
        if (target && state.self.ep >= 2) return { type: 'attack', targetId: target.id, targetType: 'agent' };
        return { type: 'explore' };
    },
    // 2. THE FARMER: Focuses on hunting monsters for rewards
    FARMER: (state) => {
        const monster = state.visibleMonsters[0];
        if (monster && state.self.ep >= 2) return { type: 'attack', targetId: monster.id, targetType: 'monster' };
        return { type: 'explore' };
    },
    // 3. THE SURVIVOR: Plays safe and rests when HP is low
    SURVIVOR: (state) => {
        if (state.self.hp < 70) return { type: 'rest' };
        return { type: 'explore' };
    },
    // 4. THE LOOTER: Specifically looks for Supply Caches
    LOOTER: (state) => {
        const cache = state.currentRegion.interactables.find(f => f.type === 'supply_cache' && !f.isUsed);
        if (cache) return { type: 'interact', interactableId: cache.id };
        return { type: 'explore' };
    },
    // 5. THE SCOUT: Focuses on moving to new regions
    SCOUT: (state) => {
        const nextRegion = state.currentRegion.connections[0];
        return { type: 'move', regionId: nextRegion };
    }
};

module.exports = Strategies;