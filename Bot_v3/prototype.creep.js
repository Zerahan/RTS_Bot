Creep.prototype.getStructuresOnTile = function(){
    //console.log("Creep.prototype.getStructuresOnTile()");
    if(!this._structuresOnTile){
        this._structuresOnTile = this.pos.lookFor(LOOK_STRUCTURES);
        //this._structuresOnTile = _.filter(structures, (target)=>(target.hits < target.hitsMax));
    }
    return this._structuresOnTile;
}

Creep.prototype.getEnergyFrom = function(target){
    if(target == undefined) return ERR_INVALID_ARGS;
    if(target instanceof Creep) return target.transfer(this, RESOURCE_ENERGY);
    if(target instanceof Structure || target instanceof Tombstone || target instanceof Ruin) return this.withdraw(target, RESOURCE_ENERGY);
    if(target instanceof Resource) return this.pickup(target);
}

Creep.prototype.getRole = function(creep){
    if(creep == undefined) return "";
    return creep.memory.role;
}

Creep.prototype.findEnergy = function(creep){
    var targets = creep.room.find(FIND_DROPPED_RESOURCES, {filter: (c)=>(c.resourceType == RESOURCE_ENERGY)});
    if(targets.length == 0) targets = creep.room.find(FIND_TOMBSTONES, {filter: (c)=>(c.store[RESOURCE_ENERGY] > 0)});
    if(targets.length == 0) targets = creep.room.find(FIND_RUINS, {filter: (c)=>(c.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
    if(targets.length == 0) targets = creep.room.find(FIND_STRUCTURES, {filter: (c)=>(c.structureType == STRUCTURE_CONTAINER && c.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
    if(targets.length == 0) targets = creep.room.find(FIND_MY_CREEPS, {filter: (c)=>(c.memory.role=='basicHarvester' && c.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
    if(targets.length == 0) targets = creep.room.find(FIND_MY_CREEPS, {filter: (c)=>(c.memory.role=='harvester' && c.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
    if(targets.length == 0) targets = creep.room.find(FIND_SOURCES);
    if(targets.length > 0){
        return creep.pos.findClosestByPath(targets);
    }
    return undefined;
}