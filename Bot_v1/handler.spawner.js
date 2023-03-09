

var spawnerHandler = {
    maxCreepModuleCount: 50,
    run: function(room, MaxCreepEnergyCost, maxCreepModuleCount){
        if(!Memory.rooms[room.name].harvesting){
            Memory.rooms[room.name].harvesting = new Object();
            Memory.rooms[room.name].harvesting.nextHarvestTarget = 0;
            Memory.rooms[room.name].harvesting.cycleSource = room.sources.length > 1;
        }
        var AllCreeps = room.find(FIND_MY_CREEPS);
        var roles = {
            harvester: new Array(),
            upgrader: new Array(),
            builder: new Array(),
            transporter: new Array(),
            explorer: new Array(),
            colonizer: new Array()
        };
        for(var id in AllCreeps){
            var creep = AllCreeps[id];
            if(creep.ticksToLive <= 1){
                continue;
            }
            if(creep.ticksToLive <= 60 && creep.memory.role != 'harvester'){
                continue;
            }
            roles[creep.memory.role].push(creep);
        }
        for(const k in Memory.creeps){
            const c = Memory.creeps[k];
            if(c.role == 'colonizer'){
                roles[c.role].push(c);
            }
        }
        var AvailableEnergy = room.energyAvailable;
        var buildQueue = new Array();
        var maxRoleCount = {
            harvester: 2,
            upgrader: 1,
            builder: 1,
            transporter: 3,
            explorer: 0,
            colonizer: 1
        }
        if (room.find(FIND_MY_CONSTRUCTION_SITES) > 0){
            maxRoleCount["builder"] = 2;
        }
        for(var role in roles){
            //console.log(role + ": " + roles[role].length + " / " + maxRoleCount[role]);
            if(roles[role].length < maxRoleCount[role]){
                buildQueue.push(role);
                Memory.rooms[room.name].buildQueue[role] = maxRoleCount[role] - roles[role].length;
            }
        }
        //console.log(buildQueue);
        
        var AvailableEnergy = room.energyAvailable;
        if(buildQueue.length > 0){
            var spawns = room.find(FIND_MY_SPAWNS);
            for(var id in spawns){
                if(buildQueue.length == 0) break;
                var roleToBuild = buildQueue.pop();
                if(spawns[id].spawning){
                    if(spawns[id].spawning.name.startsWith(roleToBuild)){
                        buildQueue.push(roleToBuild);
                    }
                }else{
                    AvailableEnergy = AvailableEnergy - this.buildCreep(AvailableEnergy, room.energyCapacityAvailable/2, spawns[id], roleToBuild);
                }
            }
        }
        return;
    },
    
    buildCreep: function( AvailableEnergy, maxCreepEnergyCost, spawner, roleToBuild){
        var modules = {
            CLAIM: 0,
            ATTACK: 0,
            RANGED_ATTACK: 0,
            HEAL: 0,
            WORK: 0,
            CARRY: 0,
            MOVE: 0,
            TOUGH: 0
        }
        var totalCost = 0;
        switch(roleToBuild){
            case "harvester":
                var sources = spawner.room.find(FIND_SOURCES);
                var sourceRate = 0;
                if(sources.length > 0){
                    const respawnRate = (Memory.data ? Memory.data.source.sourceRespawnRate : 300);
                    console.log("Respawn Rate: " + respawnRate);
                    sourceRate = sources[0].energyCapacity / respawnRate;
                    console.log("Worker modules: " + Math.ceil(sourceRate*0.55));
                }
                totalCost = spawnerHandler.setupHarvester(AvailableEnergy, maxCreepEnergyCost, modules, [MOVE,CARRY,WORK], [CARRY], Math.ceil(sourceRate*0.55));
                break;
            case "upgrader":
                totalCost = spawnerHandler.setupModules(AvailableEnergy, maxCreepEnergyCost, modules, [MOVE,CARRY,WORK], [MOVE,CARRY,WORK]);
                break;
            case "builder":
                totalCost = spawnerHandler.setupModules(AvailableEnergy, maxCreepEnergyCost, modules, [MOVE,CARRY,WORK], [MOVE,CARRY,WORK]);
                break;
            case "transporter":
                totalCost = spawnerHandler.setupModules(AvailableEnergy, maxCreepEnergyCost, modules, [MOVE,CARRY], [MOVE,CARRY,CARRY]);
                break;
            case "explorer":
                totalCost = spawnerHandler.setupModules(AvailableEnergy, maxCreepEnergyCost, modules, [MOVE], [MOVE]);
                break;
            case "colonizer":
                totalCost = spawnerHandler.setupModules(AvailableEnergy, 99999, modules, [MOVE], [MOVE,CLAIM]);
                break;
            default:
                console.log("role failed to build: " + roleToBuild);
                return 0;
        }
        //console.log(roleToBuild + " cost: " + totalCost);
        var creepModules = new Array();
        var creepName = roleToBuild + Game.time;
        for(var moduleType in modules){
            for(var i = 0; i < modules[moduleType]; i++){
                creepModules.push(moduleType.toLowerCase());
            }
        }
        //console.log("cost: " + totalCost + " | count: " + creepModules.length);
        //return;
        
        var mem = {role: roleToBuild, home: undefined, version:1};
        if(roleToBuild == 'harvester'){
            var lastHarvestTarget = Memory.rooms[spawner.room.name].harvesting.nextHarvestTarget;
            mem.harvestTarget = spawner.room.sources[Memory.rooms[spawner.room.name].harvesting.nextHarvestTarget].id;
            if(Memory.rooms[spawner.room.name].harvesting.cycleSource){
                Memory.rooms[spawner.room.name].harvesting.nextHarvestTarget = (Memory.rooms[spawner.room.name].harvesting.nextHarvestTarget + 1) % spawner.room.sources.length;
                console.log("Next harvest target: " + Memory.rooms[spawner.room.name].harvesting.nextHarvestTarget + " last: " + lastHarvestTarget);
            }
        }
        var err = spawner.spawnCreep(creepModules, creepName,
            {memory: mem}
        );
        if(err != OK){
            console.log("Spawn error: " + err + " for " + roleToBuild + " because " + AvailableEnergy);
            return 0;
        }
        var moduleStr = '';
        for(const k in modules){
            if(modules[k] == 0) continue;
            if(moduleStr != ''){
                moduleStr = moduleStr + ", ";
            }
            moduleStr = moduleStr + k + " x " + modules[k];
        }
        console.log(err + " " + creepName + "(" + roleToBuild + "): [" + moduleStr + "] @ " + spawner.name + " for " + totalCost);
        return totalCost;
    },
    getModuleCosts: function(){
        return {
            MOVE: 50,
            WORK: 100,
            CARRY: 50,
            ATTACK: 80,
            RANGED_ATTACK: 150,
            HEAL: 250,
            CLAIM: 600,
            TOUGH: 10
        }
    },
    
    setupHarvester: function(AvailableEnergy, maxCreepEnergyCost, moduleArray, starterModules, iteratedModules, maxWorkModules){
        var ModuleCosts = this.getModuleCosts();
        var totalCost = 0;
        var buildCount = 0;
        AvailableEnergy = Math.min(AvailableEnergy, maxCreepEnergyCost);
        for(var key in starterModules){
            var moduleName = starterModules[key].toUpperCase();
            moduleArray[moduleName] = moduleArray[moduleName] + 1;
            totalCost = totalCost + ModuleCosts[moduleName];
            buildCount++;
        }
        AvailableEnergy = AvailableEnergy - totalCost;
        var ModuleCount = 0;
        //ModuleCount = Math.floor(Math.min(AvailableEnergy, maxCreepEnergyCost-totalCost) / totalCost);
        //ModuleCount = Math.min(ModuleCount, Math.floor((this.maxCreepModuleCount-starterModules.length)/iteratedModules.length));
        maxWorkModules = Math.min(maxWorkModules, 29);
        ModuleCount = Math.min(maxWorkModules, Math.floor(AvailableEnergy / ModuleCosts["WORK"]));
        for(var i = 0; i < ModuleCount; i++){
            var moduleName = "WORK";
            moduleArray[moduleName] = moduleArray[moduleName] + 1;
            totalCost = totalCost + ModuleCosts[moduleName];
            buildCount++;
        }
        var IterationCost = 0;
        for(var key in iteratedModules){
            IterationCost = IterationCost + ModuleCosts[iteratedModules[key].toUpperCase()];
        }
        ModuleCount = Math.min(this.maxCreepModuleCount-buildCount, Math.floor(AvailableEnergy / IterationCost), 19);
        for(var i = 0; i < ModuleCount; i++){
            for(var key in iteratedModules){
                var moduleName = iteratedModules[key].toUpperCase();
                moduleArray[moduleName] = moduleArray[moduleName] + 1;
                totalCost = totalCost + ModuleCosts[moduleName];
            }
        }
    },
    
    setupModules: function(AvailableEnergy, maxCreepEnergyCost, moduleArray, starterModules, iteratedModules){
        //return moduleArray;
        var ModuleCosts = this.getModuleCosts();
        var totalCost = 0;
        for(var key in starterModules){
            var moduleName = starterModules[key].toUpperCase();
            moduleArray[moduleName] = moduleArray[moduleName] + 1;
            totalCost = totalCost + ModuleCosts[moduleName];
        }
        AvailableEnergy = AvailableEnergy - totalCost;
        var IterationCost = 0;
        for(var key in iteratedModules){
            IterationCost = IterationCost + ModuleCosts[iteratedModules[key].toUpperCase()];
        }
        var ModuleCount = 0;
        ModuleCount = Math.floor(Math.min(AvailableEnergy, maxCreepEnergyCost-totalCost) / totalCost);
        ModuleCount = Math.min(ModuleCount, Math.floor((this.maxCreepModuleCount-starterModules.length)/iteratedModules.length));
        for(var i = 0; i < ModuleCount; i++){
            for(var key in iteratedModules){
            var moduleName = iteratedModules[key].toUpperCase();
                moduleArray[moduleName] = moduleArray[moduleName] + 1;
                totalCost = totalCost + ModuleCosts[moduleName];
            }
        }
        return totalCost;
    },
    
    /** @param {Creep} creep **/
    killCreep: function(creep){
        
    }
};

module.exports = spawnerHandler;