var TowerHandler = {
    minimumEnergyForRepairs: 0.5,
    run: function(room){
        /*/
        towers have 3 tasks: attack, repair, and reinforce.
            Attack has no restrictions and overrides all other behavior.
            Repair repairs all non-wall and non-rampart to full. Walls and ramparts are then repaired up to 500k
            reinforce: if tower energy and total stored energy is over 75%, turrets can repair walls and ramparts up to full
            
            ramparts can have a "maintanance mode" where they only need to be repaired 300 hits every 100 ticks.
                repairs cost 10 units. Or 20-80 hits/energy.
                a tower repairs 800 hits if within 5 units. 200 hits if over 20 units. So that's 1 repair every 133 ticks at over 20 units, or 1 repair every 266 ticks at under 5 units.
                could have the two closest towers to a rampart override to do the repair when the decay timer hits 1.
        //*/
        var idleTowers = room.find(FIND_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_TOWER && structure.store[RESOURCE_ENERGY] > 0 });
        for(var i = idleTowers.length-1; i >= 0; i--){
            if(TowerHandler.attack(idleTowers[i])){
                idleTowers.pop();
            }
        }
        if(idleTowers.length == 0) return;
        var repairsToMake = room.find(FIND_STRUCTURES, { filter: (structure) => structure.hits < structure.hitsMax-200 });
        var sources = room.find(FIND_SOURCES, {filter: (source) => (source.energy > 1000)})
        if(sources.length < 2){
            repairsToMake = _.filter(repairsToMake, (structure)=> structure.hits < 1000000);
        }
        repairsToMake.sort((a,b)=> a.hits-b.hits);
        repairsToMake = repairsToMake.slice(0,idleTowers.length);
        //console.log(idleTowers.length + ": " + repairsToMake.length);
        for(var i = 0; i < repairsToMake.length; i++){
            var filteredTowers = idleTowers;
            if(repairsToMake[i].hits > 1000000){
                filteredTowers = _.filter(idleTowers, (tower) => (tower.store[RESOURCE_ENERGY] > tower.store.getCapacity(RESOURCE_ENERGY) * TowerHandler.minimumEnergyForRepairs));
            }
            if(filteredTowers.length == 0) continue;
            var closestTower = repairsToMake[i].pos.findClosestByRange(filteredTowers);
            closestTower.repair(repairsToMake[i]);
            var idx = idleTowers.indexOf(closestTower);
            if(idx > -1){
                idleTowers.splice(idx,1);
            }
        }
        return;
        for(var i = 0; i < idleTowers.length; i++){
            var filtered = repairsToMake;
            if((idleTowers[i].store[RESOURCE_ENERGY] < idleTowers[i].store.getCapacity(RESOURCE_ENERGY) * TowerHandler.minimumEnergyForRepairs)){
                filtered = _.filter((structure) => structure.hits < 1000000);
            }
            if(filtered.length == 0) continue;
            var closest = idleTowers[i].pos.findClosestByRange(filtered);
            //if((idleTowers[i].store[RESOURCE_ENERGY] < idleTowers[i].store.getCapacity(RESOURCE_ENERGY) * TowerHandler.minimumEnergyForRepairs) && closest.hits > 1000000) continue;
            idleTowers[i].repair(closest);
            var idx = repairsToMake.indexOf(closest);
            repairsToMake.splice(idx, 1);
        }
        console.log(count);
        return;
        var targets = _.filter(repairsToMake, (structure) => {return structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART});
        targets = targets.concat(_.filter(repairsToMake, (structure) => {return (structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_WALL) && structure.hits < (structure.hitsMax*0.0001)}));
        var closestTarget;
        if(targets.length < idleTowers.length){
            targets = targets.concat(repairsToMake);
        }
        targets.sort((a,b)=>a.hits>=b.hits);
        //console.log(targets.length);
        if(targets.length > 0){
            for(var i = 0; i < idleTowers.length; i++){
                if(targets.length <= i) break;
                idleTowers[i].repair(targets[i]);
            }
        }
    },
    attack: function(tower){
        //if(tower.store.getUsedCapacity(RESOURCE_ENERGY)<10) return;
        var closestTarget = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestTarget) {
            tower.attack(closestTarget);
            return true;
        }
        return false;
    },
    reinforce: function(tower){
        
    },
    repair: function(tower, target){
        //tower.repair(target);
    },
    findWeakest: function(list){
        if(!list) return;
        if(list.length == 0) return;
        var weakest = list[0];
        var weakestHits = list[0].hits;
        //if(list.length > 1){
            for(var i = 1; i < list.length; i++){
                if(list[i].hits < weakestHits){
                    weakest = list[i];
                    weakestHits = list[i].hits;
                }
            }
        //}
        return weakest;
    }
};
module.exports = TowerHandler;