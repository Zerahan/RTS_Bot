var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
            if(creep.room.controller.level < 8 || (creep.room.controller.level == 8 && creep.room.controller.ticksToDowngrade < 5900)){
            }
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => ((structure.structureType == STRUCTURE_LINK || structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE))
            });
            targets = _.filter(targets, (structure) => structure.store[RESOURCE_ENERGY] > 0)
            if(targets.length > 0){
                let closestTarget = creep.pos.findClosestByRange(targets);
                if(closestTarget){
                    creep.withdraw(closestTarget, RESOURCE_ENERGY);
                }
            }
            //}
        }
        else {
            var TargetType = 0;
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER) && 
                                structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            if(targets.length == 0){
                TargetType = 1;
                targets = creep.room.find(FIND_SOURCES);
            }
            var closestTarget = creep.room.controller.pos.findClosestByRange(targets);
            var ErrorCode = 0;
            switch(TargetType){
                case 0:
                    ErrorCode = creep.withdraw(closestTarget, RESOURCE_ENERGY);
                    break;
                case 1:
                    ErrorCode = creep.harvest(closestTarget);
                    break;
                default:
            }
            if(ErrorCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
	}
};

module.exports = roleUpgrader;