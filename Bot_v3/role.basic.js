/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.basic');
 * mod.thing == 'a thing'; // true
 */
 
var BasicRole = {
    spawner : function(room){
        memory = Memory.rooms[room.name].managers['basic'];
        var Spawners = room.find(FIND_MY_SPAWNS);
        if(!memory.harvester || !Memory.creeps[memory.harvester]){
            var IsSpawning = false;
            for(const k in Spawners){
                if(Spawners[k].Spawning){
                    if(Spawns[k].Spawning.memory['role'] == 'basicHarvester') IsSpawning = true;
                }
                if(!IsSpawning){
                    var name = 'BasicHarvester' + Game.time;
                    var Err = Spawners[k].spawnCreep([MOVE,WORK,CARRY,CARRY,CARRY], name, {memory: {role: 'basicHarvester'}});
                    if(Err === OK) memory.harvester = name;
                }
            }
        }
        if(!memory.upgrader || !Memory.creeps[memory.upgrader]){
            var IsSpawning = false;
            for(const k in Spawners){
                if(Spawners[k].Spawning){
                    if(Spawns[k].Spawning.memory['role'] == 'basicUpgrader') IsSpawning = true;
                }
                if(!IsSpawning){
                    var name = 'BasicUpgrader' + Game.time;
                    var Err = Spawners[k].spawnCreep([MOVE,MOVE,WORK,CARRY,CARRY], name, {memory: {role: 'basicUpgrader'}});
                    if(Err === OK) memory.upgrader = name;
                }
            }
        }
    },
    upgrader : function(creep){
        if(creep.memory.state == true){
            if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
                creep.memory.state = false;
            }
        }else{
            if(creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
                creep.memory.target = undefined;
                creep.memory.state = true;
            }
        }
        if(creep.memory.state == true){
            this.findEnergy(creep);
            const myTarget = Game.getObjectById(creep.memory.target);
            if(myTarget == undefined){ creep.memory.target = undefined; return; }
            if(creep.getEnergyFrom(myTarget) == ERR_NOT_IN_RANGE){
                creep.moveTo(myTarget);
            }
        }else{
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){
                var repairTargets = _.filter(creep.getStructuresOnTile(), (target)=>(target.hits < target.hitsMax));
                if(repairTargets.length > 0){
                    creep.repair(repairTargets[0]);
                }else{
                    creep.moveTo(creep.room.controller);
                }
            }
        }
    },
    harvester : function(creep){
        if(creep.memory.mineStrength == undefined){
            var body = _.filter(creep.body, (b)=>(b.type == WORK));
            if(body.length > 0){
                creep.memory.mineStrength = body.length * 2;
            }else{
                creep.memory.mineStrength = 0;
            }
        }
        if(creep.memory.target == undefined){
            const targets = creep.room.find(FIND_SOURCES);
            const closestTarget = creep.room.controller.pos.findClosestByPath(targets);
            if(closestTarget){
                creep.memory.target = closestTarget.id;
            }
        }
        if(creep.store.getFreeCapacity(RESOURCE_ENERGY) > creep.memory.mineStrength){
            const myTarget = Game.getObjectById(creep.memory.target);
            var err = creep.harvest(myTarget);
            if(err == ERR_NOT_IN_RANGE) creep.moveTo(myTarget);
        }
    },
    findEnergy(creep){
        if(creep.memory.target == undefined || Game.getObjectById(creep.memory.target) == undefined){
            var targets = creep.room.find(FIND_DROPPED_RESOURCES, {filter: (c)=>(c.resourceType == RESOURCE_ENERGY)});
            if(targets.length == 0) targets = creep.room.find(FIND_TOMBSTONES, {filter: (c)=>(c.store[RESOURCE_ENERGY] > 0)});
            if(targets.length == 0) targets = creep.room.find(FIND_RUINS, {filter: (c)=>(c.store[RESOURCE_ENERGY] > 0)});
            if(targets.length == 0) targets = creep.room.find(FIND_STRUCTURES, {filter: (c)=>(c.structureType == STRUCTURE_CONTAINER && c.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
            if(targets.length == 0) targets = creep.room.find(FIND_MY_CREEPS, {filter: (c)=>(c.memory.role=='basicHarvester' && c.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
            if(targets.length == 0) targets = creep.room.find(FIND_MY_CREEPS, {filter: (c)=>(c.memory.role=='harvester' && c.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
            if(targets.length == 0) targets = creep.room.find(FIND_SOURCES);
            if(targets.length > 0){
                const closestTarget = creep.pos.findClosestByPath(targets);
                if(closestTarget){
                    creep.memory.target = closestTarget.id;
                }
            }else{
                return;
            }
        }
    }
}

module.exports = BasicRole;