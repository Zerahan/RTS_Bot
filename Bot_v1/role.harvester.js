require('MathLib');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        
        if(!creep.memory.harvestTarget){
            //var sources = creep.room.find(FIND_SOURCES);
            //creep.memory.harvestTarget = sources[Math.randRange(sources.length-1)].id;
        }
        
        //var closestTarget;
	    if(creep.store.getFreeCapacity() > 0) {
            var closestTarget = Game.getObjectById(creep.memory.harvestTarget);
            if(creep.harvest(closestTarget) == ERR_NOT_IN_RANGE) {
                if(creep.memory.isAtTarget){
                    creep.moveTo(closestTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
                }else{
                    if(creep.memory.helper == undefined){
                        var creeps = creep.room.find(FIND_MY_CREEPS, {filter: (t) => (t.memory.role == 'transporter' && !t.spawning && t.memory.helpTarget == undefined)});
                        var closest = creep.pos.findClosestByPath(creeps);
                        creep.memory.helper = closest.id;
                        closest.memory.helpTarget = creep.id;
                    }else{
                        var helperCreep = Game.getObjectById(creep.memory.helper);
                        if(helperCreep){
                            creep.moveTo(helperCreep, {visualizePathStyle: {stroke: '#ffaa00'}});
                            if(helperCreep.pull(creep) == OK){
                                var err = helperCreep.moveTo(Game.getObjectById(creep.memory.harvestTarget));
                                if(Math.distance(Game.getObjectById(creep.memory.harvestTarget).pos, helperCreep.pos) < 2){
                                    console.log("is at target: " + Math.distance(Game.getObjectById(creep.memory.harvestTarget).pos, helperCreep.pos));
                                    creep.memory.isAtTarget = true;
                                    if(creep.memory.helper != undefined){
                                        if(Game.getObjectById(creep.memory.helper).memory.helpTarget){
                                            delete Game.getObjectById(creep.memory.helper).memory.helpTarget
                                        }
                                        delete creep.memory.helper;
                                    }
                                }
                            }else{
                                helperCreep.moveTo(creep);
                            }
                        }
                    }
                }
                /*/
            }else{
                if(creep.memory.helper != undefined){
                    if(Game.getObjectById(creep.memory.helper).memory.helpTarget){
                        delete Game.getObjectById(creep.memory.helper).memory.helpTarget
                    }
                    delete creep.memory.helper;
                }
                //*/
            }
            var nearbyTargets = creep.getNearbyTargets();
            //nearbyTargets = _.filter(nearbyTargets, (target) => ((target.type='creep' && target.creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) || (target.type =='structure' && target.structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)));
            if(nearbyTargets.length > 0){
                for(const k in nearbyTargets){
                    var target = nearbyTargets[k][nearbyTargets[k].type];
                    creep.transfer(target, RESOURCE_ENERGY);
                }
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN && structure.store.getFreeCapacity(RESOURCE_ENERGY) > creep.store.getCapacity(RESOURCE_ENERGY)) || 
                            (structure.structureType == STRUCTURE_LINK);
                }
            });
            //var targets = _.filter(allTargets, (structure) => {return structure.structureType == STRUCTURE_LINK || structure.structureType == STRUCTURE_SPAWN});
            if(targets.length > 0) {
                var closestTarget = creep.pos.findClosestByRange(targets);
                if(creep.transfer(closestTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }else{
                var closestSource = creep.pos.findClosestByRange(FIND_SOURCES);
                if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestSource, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
	}
};

module.exports = roleHarvester;