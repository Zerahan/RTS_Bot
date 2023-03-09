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
            }
        }
    }
}

module.exports = HarvesterRole;