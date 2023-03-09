Creep.prototype.getNearbyTargets = function(){
    var targets = this.room.lookAtArea(this.pos.y - 1, this.pos.x -1, this.pos.y +1, this.pos.x +1, true);
    targets = _.filter(targets, function(target){return ((target.type == 'creep' && target.creep.id != this.id && (target.creep.memory.role != 'harvester')) || (target.type == 'structure' && (target.structure.structureType == STRUCTURE_LINK || target.structure.structureType == STRUCTURE_CONTAINER)))});
    var filteredTargets = new Array();
    for(const k in targets){
        filteredTargets.push({type: targets[k].type, id: targets[k][targets[k].type].id});
    }
    return targets;
};

Creep.prototype.findEnergy = function(){
    var allTargets = new Array();
    var targets = new Array();
    
    if(this.memory.home){
        allTargets = homePos.findInRange(FIND_TOMBSTONES, 20, {filter: (structure)=>(structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
        if(allTargets.length == 0){
            allTargets = homePos.findInRange(FIND_RUINS, 20, {filter: (structure)=>(structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
        }
    }else{
        allTargets = this.room.find(FIND_TOMBSTONES, {filter: (structure)=>(structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
        if(allTargets.length == 0){
            allTargets = this.room.find(FIND_RUINS, {filter: (structure)=>(structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
        }
    }
    if(allTargets.length > 0){
        return this.pos.findClosestByRange(allTargets).id;
    }
    
    if(this.memory.home){
        allTargets = homePos.findInRange(FIND_DROPPED_RESOURCES, 20, {filter: (tombstone)=>(tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
    }else{
        allTargets = this.room.find(FIND_DROPPED_RESOURCES, {filter: (tombstone)=>(tombstone.store && tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
    }
    if(allTargets.length > 0){
        return this.pos.findClosestByRange(allTargets).id;
    }
    
    if(this.memory.home){
        var homePos = Game.getObjectById(this.memory.home).pos;
        allTargets = homePos.findInRange(FIND_STRUCTURES, 20, {filter: (structure)=>(structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
    }else{
        allTargets = this.room.find(FIND_STRUCTURES, {filter: (structure)=>(structure.store && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
    }
    targets = _.filter(allTargets, (structure)=>(structure.structureType == STRUCTURE_LINK && structure.store.getUsedCapacity > 400));
    if(targets.length == 0){
        targets = _.filter(allTargets, (structure)=>(structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity > 100));
        if(targets.length == 0){
            targets = _.filter(allTargets, (structure)=>(structure.structureType == STRUCTURE_STORAGE));
            if(targets.length == 0){
                targets = creep.pos.findInRange(FIND_MY_CREEPS, 20, {filter: (creep) => (creep.memory.role == 'harvester' && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 50)});
                if(targets.length == 0){
                    targets = allTargets;
                }
            }
        }
    }
    if(targets.length > 0){
        return this.pos.findClosestByRange(targets).id;
    }
    return undefined;
};

Creep.prototype.takeEnergy = function(targetID){
    var target = Game.getObjectById(targetID);
    if(target == undefined){ return ERR_INVALID_ARGS; }
    if(target.structureType != undefined || target.deathTime != undefined || target.structure != undefined){
        return this.withdraw(target, RESOURCE_ENERGY);
    }
    if(target.resourceType != undefined){
        return this.pickup(target);
    }
    return target.transfer(this, RESOURCE_ENERGY);
};

Creep.prototype.findRepairs = function(){
    
};

Creep.prototype.chooseTask = function(){
    if(!creep.memory.task) creep.memory.task = 'idle';
    if(!creep.memory.taskTarget) creep.memory.taskTarget = 'none';
    if(!creep.memory.taskTargetType) creep.memory.taskTargetType = 'none';
    var possibleTasks = {
        'harvester': ['mine','deposit'],
        'upgrader': ['withdraw','upgrade'],
        'transporter': ['withdraw','deposit'],
        'builder': ['withdraw','build','repair','reinforce','upgrade'],
    };
    switch(creep.memory.role){
        case 'harvester':
            break;
        case 'upgrader':
            break;
        case 'transporter':
            break;
        case 'builder':
            break;
    }
};

Creep.prototype.performTask = {
    idle: function(){},
    withdraw: function(){},
    deposit: function(){},
    build: function(){},
    upgrade: function(){},
    mine: function(){},
    repair: function(){},
    reinforce: function(){},
    destroy: function(){},
    attack: function(){},
    heal: function(){},
    harbingered: function(){},
    none: function(){},
};

module.exports = {

};