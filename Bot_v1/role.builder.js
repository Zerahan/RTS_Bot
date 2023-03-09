var roleBuilder = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.task == undefined){
            creep.memory.task = 'idle';
            creep.memory.taskTarget = undefined;
            creep.memory.taskTargetType = undefined;
        }
        this.chooseTask(creep);
        var taskTarget = Game.getObjectById(creep.memory.taskTarget);
        if(!taskTarget){
            creep.memory.task = 'idle';
        }
        switch(creep.memory.task){
            case 'getEnergy':
                if(creep.takeEnergy(taskTarget.id)==ERR_NOT_IN_RANGE){
                    creep.moveTo(taskTarget);
                }else{
                    creep.memory.task = 'idle';
                }
                break;
            case 'build':
                if(creep.build(taskTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(taskTarget);
                }else{
                    creep.memory.task = 'idle';
                }
                break;
            case 'fill':
                if(creep.transfer(taskTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(taskTarget);
                }else{
                    creep.memory.task = 'idle';
                }
                break;
            case 'repair':
                if(creep.repair(taskTarget) == ERR_NOT_IN_RANGE){
                    creep.moveTo(taskTarget);
                }else{
                    creep.memory.task = 'idle';
                }
                break;
	    }
        this.chooseTask(creep);
	},
	chooseTask: function(creep){
        if(creep.memory.task == 'idle'){
            if( creep.store[RESOURCE_ENERGY] == 0 ){
                creep.say('🔄');
                creep.memory.task = 'getEnergy';
                creep.memory.taskTarget = creep.findEnergy();
            }else{
                let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length > 0){
                    creep.say('🚧');
                    creep.memory.task = 'build';
                    let closestTarget = creep.pos.findClosestByRange(targets);
                    creep.memory.taskTarget = closestTarget.id;
                    creep.memory.taskTargetType = 'constructionSite'
                }else{
                    let targets = creep.room.find(FIND_STRUCTURES, {filter: (structure)=>((structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_CONTAINER) && structure.id != creep.memory.taskTarget && creep.memory.taskTargetType != structure.structureType && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 100)});
                    if(false){//targets.length > 0){
                        creep.say('⚡ ');
                        creep.memory.task = 'fill';
                        let closestTarget = creep.pos.findClosestByRange(targets);
                        creep.memory.taskTarget = closestTarget.id;
                        creep.memory.taskTargetType = closestTarget.structureType;
                    }else{
                        let repairTargets = creep.room.find(FIND_STRUCTURES, { filter: (structure) => (structure.hits < structure.hitsMax-200) });
                        targets = _.filter(repairTargets, (structure)=>(structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_WALL))
                        if(targets.length == 0){
                            targets = repairTargets;
                        }
                        if(targets.length > 0){
                            creep.say('🚧');
                            creep.memory.task = 'repair';
                            let closestTarget = creep.pos.findClosestByRange(targets);
                            creep.memory.taskTarget = closestTarget.id;
                            creep.memory.taskTargetType = closestTarget.structureType;
                        }
                    }
                }
            }
        }
	}
};

module.exports = roleBuilder;