var TransporterRole = {
    run: function(creep){
        if(creep.memory.state == undefined){
            creep.memory.state = false;
        }
        if(creep.memory.state == true){
            if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
                creep.memory.state = false;
            }
        }else{
            if(creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
                creep.memory.target = undefined;
                creep.memory.state = true;
            }
        }
        if(creep.memory.target == undefined || Game.getObjectById(creep.memory.target) == undefined){
            var targets = creep.room.find(FIND_DROPPED_RESOURCES, {filter: (c)=>(c.resourceType == RESOURCE_ENERGY)});
            if(targets.length == 0) targets = creep.room.find(FIND_TOMBSTONES, {filter: (c)=>(c.store[RESOURCE_ENERGY] > 0)});
            if(targets.length == 0) targets = creep.room.find(FIND_RUINS, {filter: (c)=>(c.store[RESOURCE_ENERGY] > 0)});
            if(targets.length == 0) targets = creep.room.find(FIND_STRUCTURES, {filter: (c)=>(c.structureType == STRUCTURE_CONTAINER && c.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
            if(targets.length == 0) targets = creep.room.find(FIND_MY_CREEPS, {filter: (c)=>(c.memory.role=='basicHarvester')});
            if(targets.length > 0){
                const closestTarget = creep.pos.findClosestByPath(targets);
                if(closestTarget){
                    creep.memory.target = closestTarget.id;
                }
            }else{
                return;
            }
        }else{
            if(creep.memory.target && Game.getObjectById(creep.memory.target) && Game.getObjectById(creep.memory.target).store == undefined){
                creep.memory.target = undefined;
            }
        }
        if(creep.memory.state == true){
            if(creep.memory.container){
                const myTarget = Game.getObjectById(creep.memory.container);
                if(creep.getEnergyFrom(myTarget) == ERR_NOT_IN_RANGE){
                    creep.moveTo(myTarget);
                }
            }
        }else{
            var towers = new Array();
            var targets = _.filter(towers, (s)=> (s.store.getFreeCapacity(RESOURCE_ENERGY) > 100));
            if(targets.length == 0) targets = creep.room.find(FIND_MY_SPAWNS, {filter: (c)=>(c.store.getFreeCapacity(RESOURCE_ENERGY) > 0)});
            if(targets.length == 0){
                var outposts = _.filter(creep.room.memory.outposts,((c)=>(c.role != 'energyMine')));
                if(outposts.length > 0){
                    for(var o in outposts){
                        if(outposts[o].containers.length > 0){
                            for(var c in outposts[o].containers){
                                targets.push(Game.getObjectById(outposts[o].containers[c]));
                            }
                            targets = _.filter(targets, (c)=>(c.store.getFreeCapacity(RESOURCE_ENERGY) > 0));
                            break;
                        }
                    }
                }
            }
            if(targets.length > 0){
                const myTarget = creep.pos.findClosestByRange(targets);
                //console.log("Targets: " + targets.length + " is " + myTarget);
                if(myTarget == undefined){ return; }
                if(creep.transfer(myTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(myTarget);
                }
            }
        }
    }
}

module.exports = TransporterRole;