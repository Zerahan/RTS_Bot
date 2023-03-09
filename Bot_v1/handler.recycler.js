var RecyclerHandler = {
    run: function(creep){
        return;
        if(!creep)return;
        //console.log("recyling...");
        for(var k in creep.store){
            creep.drop(k);
        }
        var spawners = creep.room.find(FIND_MY_SPAWNS);
        var closestTarget = creep.pos.findClosestByPath(spawners);
        var err = closestTarget.recycleCreep(creep);
        if(err == ERR_NOT_IN_RANGE){
            creep.moveTo(closestTarget);
        }else{
            if(err == OK){
                delete Memory.creeps[creep.name];
            }
        }
    }
};

module.exports = RecyclerHandler;