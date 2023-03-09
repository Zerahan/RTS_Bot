var ColonizerRole = {
    run: function(creep){
        var targetRoom = "W3N3";
        if(creep.room.name != targetRoom){
            if(creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
                var closestTarget = Game.getObjectById(creep.findEnergy());
                if(creep.takeEnergy(closestTarget.id)==ERR_NOT_IN_RANGE){
                    creep.moveTo(closestTarget);
                }
            }else{
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetRoom)));
            }
        }else{
            if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE){
                creep.moveTo(creep.room.controller);
            }
        }
    },
};

module.exports = ColonizerRole;