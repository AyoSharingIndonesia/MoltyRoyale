// strategies.js - 5 Distinct Strategic Roles
const Strategies = {
    // 1. THE HUNTER: Aggressively seeks out other players with low HP
    HUNTER: (state) => {
        const { self, visibleAgents } = state;
        const target = visibleAgents.filter(a => a.isAlive).sort((a, b) => a.hp - b.hp)[0];
        if (target && self.ep >= 2) return { type: 'attack', targetId: target.id, targetType: 'agent' };
        return { type: 'explore' };
    },
    // 2. THE FARMER: Focuses on hunting monsters to collect $Moltz rewards
    FARMER: (state) => {
        const { self, visibleMonsters, currentRegion } = state;
        const monster = visibleMonsters.find(m => m.regionId === self.regionId);
        if (monster && self.ep >= 2) return { type: 'attack', targetId: monster.id, targetType: 'monster' };
        const cache = currentRegion.interactables.find(f => f.type === 'supply_cache' && !f.isUsed);
        if (cache) return { type: 'interact', interactableId: cache.id };
        return { type: 'explore' };
    },
    // 3. THE SURVIVOR: Plays extremely safe, heals, and runs from players
    SURVIVOR: (state) => {
        const { self, visibleAgents, currentRegion } = state;
        if (self.hp < 80) {
            const med = self.inventory.find(i => i.category === 'recovery');
            if (med) return { type: 'use_item', itemId: med.id };
            return { type: 'rest' };
        }
        if (visibleAgents.length > 0) return { type: 'move', regionId: currentRegion.connections[0] };
        return { type: 'rest' };
    },
    // 4. THE LOOTER: Specifically searches for items in Ruins or Supply Caches
    LOOTER: (state) => {
        const { currentRegion } = state;
        const cache = currentRegion.interactables.find(f => f.type === 'supply_cache' && !f.isUsed);
        if (cache) return { type: 'interact', interactableId: cache.id };
        return { type: 'explore' };
    },
    // 5. THE SCOUT: Moves constantly to discover the map and find Watchtowers
    SCOUT: (state) => {
        const { currentRegion } = state;
        const tower = currentRegion.interactables.find(f => f.type === 'watchtower' && !f.isUsed);
        if (tower) return { type: 'interact', interactableId: tower.id };
        const nextRegion = currentRegion.connections[0];
        return { type: 'move', regionId: nextRegion };
    }
};

module.exports = Strategies;
