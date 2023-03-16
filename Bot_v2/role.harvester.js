var HarvesterRole = {
    run: function(creep){
        if(creep.memory.target){
            var target = Game.getObjectById(creep.memory.target);
            if(creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
                if(creep.harvest(target) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target);
                }
            }
            if(creep.memory.container){
                creep.transfer(Game.getObjectById(creep.memory.container), RESOURCE_ENERGY);
            }else{
                var containers = creep.pos.findInRange(FIND_STRUCTURES, 1);
                containers = containers.filter((c)=>(c.structureType == STRUCTURE_CONTAINER));
                
                if(containers.length > 0){
                    creep.memory.container = containers[0].id;
                }
            }
        }
    }
}

module.exports = HarvesterRole;