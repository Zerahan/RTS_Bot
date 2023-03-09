var roleTransporter = {
/*/
    subrole:
        extension-filler
        source handler
            keeps link and turret filled. pulls from harvester inventory, or from container under the harvester.
        generalist:



//*/
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.state && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.state = false;
            creep.say('🔄 pickup');
        }
        if(!creep.memory.state && creep.store[RESOURCE_ENERGY] > 0) {
            creep.memory.state = true;
            creep.say('🚧 dropoff');
        }
        if(creep.memory.helpTarget != undefined){
            creep.say('🚧');
            return;
        }
        /*/ This lets transporters generate roads. Tends to push existing roads towards the shortest-possible path, as opposed to lowest-cost path.
        var tile = creep.room.lookAt(creep);
        tile = _.filter((tiledata)=>(tileData.type == 'structure' && tileData.structure.structureType == STRUCTURE_ROAD));
        if(tile.length == 0){
            creep.room.createConstructionSite(creep.pos,STRUCTURE_ROAD);
        }
        //*/
        if(!creep.memory.state) {
            var closestTarget = Game.getObjectById(creep.findEnergy());
            if(creep.takeEnergy(closestTarget.id) == ERR_NOT_IN_RANGE){
                creep.moveTo(closestTarget);
            }
        }
        else {
            var allTargets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_STORAGE ||
                            structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_TOWER) && 
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            var targets = _.filter(allTargets, (structure) => {return structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN});
            if(targets.length == 0){
                targets = _.filter(allTargets, (structure) => {return structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > (structure.store.getCapacity(RESOURCE_ENERGY) * 0.2)});
            }
            if(targets.length == 0){
                targets = allTargets;
            }
            if(targets.length > 0) {
                var closestTarget = creep.pos.findClosestByPath(targets);
                if(creep.transfer(closestTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }else{
                creep.moveTo(Game.flags["TransportIdle1"]);
            }
        }
	}
};

module.exports = roleTransporter;