var LinkHandler = require('handler.link');
var TowerHandler = require('handler.tower');
var SpawnerHandler = require('handler.spawner');
var RecyleHandler = require('handler.recycler');
var OutpostManager = require('manager.outpost');

var roleHarvester = require('role.harvester');
var roleStaticHarvester = require('role.staticharvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleTransporter = require('role.transporter');
var roleExplorer = require('role.explorer');
var roleColonizer = require('role.colonizer');
var roleFunction = {
    harvester: roleHarvester,
    upgrader: roleUpgrader,
    builder: roleBuilder,
    transporter: roleTransporter,
    explorer: roleExplorer,
    colonizer: roleColonizer
};
var roleNames = {
    harvester: "Harvester",
    upgrader: "Upgrader",
    builder: "Builder",
    transporter: "Transporter",
    explorer: "Explorer",
    colonizer: "Colonizer"
};

var RoomManager = {
    maxCreepEnergyCost: 2000,
    maxCreepModuleCount: 50,
    run: function(room){
        var sources = room.sources;
        if(Memory.data == undefined){
            Memory.data = new Object();
        }
        if(Memory.data.source == undefined && sources.length > 0){
            Memory.data.source = new Object();
            Memory.data.source.sourceRespawnRate = 300;
            Memory.data.source.isCheckScheduled = false;
            Memory.data.source.sourceToWatch = sources[0];
        }
        if(Game.getObjectById(Memory.data.source.sourceToWatch) == undefined){
            Memory.data.source.sourceToWatch = sources[0].id;
        }
        if(!Memory.data.source.isCheckScheduled){
            var watchedSource = Game.getObjectById(Memory.data.source.sourceToWatch);
            if(watchedSource.ticksToRegeneration == undefined){
                Memory.data.source.isCheckScheduled = true;
            }
        }else{
            var watchedSource = Game.getObjectById(Memory.data.source.sourceToWatch);
            if(watchedSource.ticksToRegeneration != undefined){
                Memory.data.source.isCheckScheduled = false;
                if(watchedSource.ticksToRegeneration < 30){
                    Memory.data.source.sourceRespawnRate = 30;
                    Memory.data.source.nextCheck = Game.time + 30;
                }else{
                    Memory.data.source.sourceRespawnRate = 300;
                    Memory.data.source.nextCheck = Game.time + 300;
                }
            }
        }
        
        for(var k in sources){
            var source = sources[k].get();
            var openNeighbors = source.getOpenNeighbors();
            for(var j in source.neighbors){
                var color = '#ff0000';
               // room.visual.circle(source.neighbors[j], {color: color});
            }
            //room.visual.circle(source.closestNeighborByPath,{radius:0.5, fill:'#ff0000'});
            //room.visual.circle(source.furthestNeighborByPath,{radius:0.5, fill:'#00aaff'});
            //console.log(sources[k].getOpenNeighbors().length);
        }
        
        if(!Memory.rooms){
            Memory.rooms = new Object();
        }
        if(!Memory.rooms[room.name]){
            Memory.rooms[room.name] = new Object();
        }
        if(!Memory.rooms[room.name].workQueue){
            Memory.rooms[room.name].workQueue = new Array();
        }
        if(!Memory.rooms[room.name].buildQueue){
            Memory.rooms[room.name].buildQueue = new Object();
            for(var role in roleNames){
                Memory.rooms[room.name].buildQueue[role] = 0;
            }
        }
        if(Memory.rooms[room.name].canBuildRoads == undefined){
            Memory.rooms[room.name].canBuildRoads = true;
        }
        var observers = room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_OBSERVER});
        for(var k in observers){
            observers[k].observeRoom("W3N3");
        }
        TowerHandler.run(room);
        LinkHandler.run(room);
        SpawnerHandler.run(room);
        OutpostManager.run(room);
        
        var AllCreeps = room.find(FIND_MY_CREEPS);
        for(var id in AllCreeps){
            var creep = AllCreeps[id];
            if(!creep.memory.version) creep.memory.version = 1;
            if(!creep.memory.role) creep.suicide();
            if(creep.ticksToLive <= 1){
                console.log("Creep("+creep.name+") will die next tick.");
                delete Memory.creeps[id];
                continue;
            }
            if(creep.ticksToLive <= 60 && creep.memory.role != 'harvester'){
                //RecyleHandler.run(creep);
                //continue;
            }
            roleFunction[creep.memory.role].run(creep);
        }
        
    },
};

module.exports = RoomManager;