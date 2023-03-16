var BasicRole = {
    freeBuild: false,
    run: function(room){
        if(room.memory.freeBuild == undefined){
            room.memory.freeBuild = false;
        }
        for(const i in Memory.creeps){
            if(!Game.creeps[i]){
                delete Memory.creeps[i];
            }
        }
        const spawns = room.find(FIND_MY_SPAWNS);
        const creeps = room.find(FIND_MY_CREEPS);
        const towers = room.find(FIND_MY_STRUCTURES, {filter: (s)=>(s.structureType == STRUCTURE_TOWER)});
        const walls = room.find(FIND_STRUCTURES, {filter: (s)=>(s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART)});
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
        /*/
        for(const i in constructionSites){
            constructionSites[i].remove();
        }
        //*/
        if(towers.length > 0){
            if(hostiles.length > 0){
                var hostileCreeps = hostiles.sort((a,b)=>(a.hits-b.hits));
                for(const t in towers){
                    const tower = towers[t];
                    tower.attack(hostileCreeps[0]);
                }
            }else{
                var filteredTowers = _.filter(towers, (s)=>(s.store.getUsedCapacity(RESOURCE_ENERGY) > (s.store.getCapacity(RESOURCE_ENERGY)*0.5)));
                if(filteredTowers.length > 0){
                    var repairsToMake = room.getRepairTargets();
                    if(repairsToMake.length == 0){
                        repairsToMake = repairsToMake.concat(room.getReinforceTargets());
                        filteredTowers = _.filter(filteredTowers, (s)=>(s.store.getUsedCapacity(RESOURCE_ENERGY) > (s.store.getCapacity(RESOURCE_ENERGY)*0.75)));
                    }
                    if(repairsToMake.length > 0 && filteredTowers.length > 0){
                        for(var t in filteredTowers){
                            filteredTowers[t].repair(Game.getObjectById(repairsToMake[t%repairsToMake.length]));
                        }
                    }
                }
            }
        }
        var harvesters = new Array();
        var upgrader = undefined;
        var builder = undefined;
        var transporter = undefined;
        var transporters = new Array();
        for(const i in creeps){
            var creep = creeps[i];
            if(creep.memory.role == undefined) creep.suicide();
            if(creep.memory.role =='basicbuilder') creep.suicide();
            if(creep){
                if(creep.memory.role == 'basicHarvester'){
                    if(creep.memory.outpost != undefined){
                        creep.memory.role = 'harvester';
                        creep.memory.target = undefined;
                        creep.memory.container = undefined;
                        room.memory.outposts[creep.memory.outpost].creeps.harvester.push(creep.name);
                        continue;
                    }
                    harvesters.push(creep);
                    this.harvester(creep);
                }
                if(creep.memory.role == 'basicUpgrader'){
                    upgrader = creep;
                    this.upgrader(creep);
                }
                if(creep.memory.role == 'basicBuilder'){
                    builder = creep;
                    if(constructionSites.length > 0 || walls.length > 0){
                        this.builder(creep, constructionSites, walls);
                    }else{
                        this.upgrader(creep);
                    }
                }
                if(creep.memory.role == 'basicTransporter'){
                    if(creep.memory.outpost != undefined){
                        creep.memory.role = 'transporter';
                        creep.memory.target = undefined;
                        room.memory.outposts[creep.memory.outpost].creeps.transporter.push(creep.name);
                        continue;
                    }
                    transporters.push(creep);
                    this.transporter(creep, towers);
                }
            }
        }
        var preEnergy = room.energyAvailable;
        var errCode = ERR_NOT_OWNER;
        var postEnergy = room.energyAvailable;
        var modules = new Array();
        for(const i in spawns){
            const spawn = spawns[i];
            if(spawn.store[RESOURCE_ENERGY] < 300) continue;
            if(spawn.spawning) continue;
            var spawnedCreepRole = "";
            if(harvesters.length < 0){ // 0 is disabled
                modules = (room.memory.freeBuild ? [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE]: [WORK,WORK,CARRY,MOVE]);
                errCode = spawn.spawnCreep(modules, 'Harvester' + Game.time, {memory:{role:'basicHarvester'}});
                spawnedCreepRole = 'harvester';
            }else{
                if(!spawn.spawning && upgrader == undefined){
                    modules = (room.memory.freeBuild ? [WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE]: [WORK,CARRY,CARRY,MOVE,MOVE]);
                    errCode = spawn.spawnCreep(modules, 'Upgrader' + Game.time, {memory:{role:'basicUpgrader'}});
                    spawnedCreepRole = 'upgrader';
                }else{
                    if(!spawn.spawning && builder == undefined){
                        modules = (room.memory.freeBuild ? [WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE]: [WORK,CARRY,CARRY,MOVE,MOVE]);
                        errCode = spawn.spawnCreep(modules, 'Builder' + Game.time, {memory:{role:'basicBuilder'}});
                        spawnedCreepRole = 'builder';
                    }else{
                        if(!spawn.spawning && transporters.length < towers.length){
                            modules = (room.memory.freeBuild ? [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE]: [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE]);
                            errCode = spawn.spawnCreep(modules, 'Transporter' + Game.time, {memory:{role:'basicTransporter'}});
                            spawnedCreepRole = 'transporter';
                        }
                    }
                }
            }
        }
        if(room.controller.level > 4){
            this.buildDefenses(room);
        }
        if(errCode == OK){
            postEnergy = room.energyAvailable;
            room.memory.freeBuild = (preEnergy-postEnergy) == 0;
            console.log("Actual cost of new creep("+spawnedCreepRole+"): " + (preEnergy-postEnergy));
        }
    },
    harvester: function(creep){
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
            }else{
                
            }
        }
        if(creep.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.memory.mineStrength){
            const myTarget = Game.getObjectById(creep.memory.target); 
            var err = creep.harvest(myTarget);
            if(err == ERR_NOT_IN_RANGE){
                creep.moveTo(myTarget);
            }
        }else{
            var repairTargets = _.filter(creep.getStructuresOnTile(), (target)=>(target.hits < target.hitsMax));
            if(repairTargets.length > 0){
                creep.repair(repairTargets[0]);
            }else{
                repairTargets = _.filter(creep.getStructuresOnTile(), (s)=>(s.structureType == STRUCTURE_CONTAINER));
                if(repairTargets.length > 0){
                    creep.transfer(repairTargets[0], RESOURCE_ENERGY);
                }else{
                    creep.room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_CONTAINER);
                }
            }
        }
    },
    upgrader: function(creep){
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
        this.findEnergy(creep);
        if(creep.memory.state == true){
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
    builder: function(creep, constructionSites, walls){
        if(creep.memory.state == undefined){
            creep.memory.state = false;
        }
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
        this.findEnergy(creep);
        if(creep.memory.state == true){
            const myTarget = Game.getObjectById(creep.memory.target);
            if(myTarget == undefined){ creep.memory.target = undefined; return; }
            if(creep.getEnergyFrom(myTarget) == ERR_NOT_IN_RANGE){
                creep.moveTo(myTarget);
            }
        }else{
            var doConstruction = true;
            var targets = constructionSites;
            if(targets.length == 0){
                doConstruction = false;
                targets = _.filter(walls, (s)=>(s.hits < 25000));
            }
            const myTarget = creep.pos.findClosestByRange(targets);
            if(myTarget == undefined){ return; }
            if(doConstruction){
                if(creep.build(myTarget) == ERR_NOT_IN_RANGE){
                    creep.moveTo(myTarget);
                }
            }else{
                if(creep.repair(myTarget) == ERR_NOT_IN_RANGE){
                    creep.moveTo(myTarget);
                }
            }
        }
    },
    transporter: function(creep, towers){
        if(creep.memory.state == undefined){
            creep.memory.state = false;
        }
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
        if(creep.memory.target == undefined){
            var targets = creep.room.find(FIND_DROPPED_RESOURCES, {filter: (c)=>(c.resourceType == RESOURCE_ENERGY)});
            if(targets.length == 0) targets = creep.room.find(FIND_TOMBSTONES, {filter: (c)=>(c.store[RESOURCE_ENERGY] > 0)});
            if(targets.length == 0) targets = creep.room.find(FIND_RUINS, {filter: (c)=>(c.store[RESOURCE_ENERGY] > 0)});
            if(targets.length == 0) targets = creep.room.find(FIND_STRUCTURES, {filter: (c)=>(c.structureType == STRUCTURE_CONTAINER && c.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});
            if(targets.length == 0) targets = creep.room.find(FIND_MY_CREEPS, {filter: (c)=>(c.memory.role=='basicHarvester')});
            if(targets.length > 0){
                const closestTarget = creep.pos.findClosestByPath(targets);
                creep.memory.target = closestTarget.id;
            }else{
                return;
            }
        }
        if(creep.memory.state == true){
            const myTarget = Game.getObjectById(creep.memory.target);
            if(myTarget == undefined){ creep.memory.target = undefined; return; }
            if(creep.getEnergyFrom(myTarget) == ERR_NOT_IN_RANGE){
                creep.moveTo(myTarget);
            }
        }else{
            var targets = _.filter(towers, (s)=> (s.store.getFreeCapacity(RESOURCE_ENERGY) > 100));
            if(targets.length > 0){
                const myTarget = creep.pos.findClosestByRange(targets);
                if(myTarget == undefined){ return; }
                if(creep.transfer(myTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(myTarget);
                }
            }
        }
    },
    buildDefenses: function(room){
        return;
        if(!room.memory.basicDefenses){
            room.memory.basicDefenses = true;
            var wallTiles = new Array();
            for(var x = 2; x < 48; x++){
                if(room.getTerrain().get(x,2) != TERRAIN_MASK_WALL) wallTiles.push({x: x, y: 2, id: -1});
                if(room.getTerrain().get(x,47) != TERRAIN_MASK_WALL) wallTiles.push({x: x, y: 47, id: -1});
            }
            for(var y = 2; y < 48; y++){
                if(room.getTerrain().get(2,y) != TERRAIN_MASK_WALL) wallTiles.push({x: 2, y: y, id: -1});
                if(room.getTerrain().get(47,y) != TERRAIN_MASK_WALL) wallTiles.push({x: 47, y: y, id: -1});
            }
            var rampartTiles = new Array();
            var cluster = new Array();
            var clusterCount = 0;
            for(var t = 0; t < wallTiles.length; t++){
                if(t == 0){
                    cluster.push(wallTiles[t]);
                }else{
                    if(this.distance(wallTiles[t], cluster[cluster.length-1]) < 2 && t != wallTiles.length-1){
                        cluster.push(wallTiles[t]);
                    }else{
                        clusterCount++;
                        var aX = 0;
                        var aY = 0;
                        for(var k in cluster){
                            aX = aX + cluster[k].x;
                            aY = aY + cluster[k].y;
                        }
                        aX = aX / cluster.length;
                        aY = aY / cluster.length;
                        //room.visual.circle(aX, aY, {fill: '#00ff00', radius: 0.5});
                        if(aX === 2){
                            rampartTiles.push({x: aX, y: aY, direction: RIGHT, range: {start: cluster[0], end: cluster[cluster.length-1]}});
                        }else if(aX === 47){
                            rampartTiles.push({x: aX, y: aY, direction: LEFT, range: {start: cluster[0], end: cluster[cluster.length-1]}});
                        }else if(aY === 2){
                            rampartTiles.push({x: aX, y: aY, direction: BOTTOM, range: {start: cluster[0], end: cluster[cluster.length-1]}});
                        }else if(aY === 47){
                            rampartTiles.push({x: aX, y: aY, direction: TOP, range: {start: cluster[0], end: cluster[cluster.length-1]}});
                        }
                        cluster = new Array();
                        cluster.push(wallTiles[t]);
                        endCluster = t;
                    }
                }
            }
            //console.log("ClusterCount: " + clusterCount);
            for(var t in wallTiles){
                room.visual.circle(wallTiles[t].x, wallTiles[t].y, {fill: '#ff0000'});
            }
            var towerTiles = new Array();
            for(var t in rampartTiles){
                room.visual.circle(rampartTiles[t].x, rampartTiles[t].y, {fill: '#00ff00'});
                var posX = rampartTiles[t].x;
                var posY = rampartTiles[t].y;
                var skipToNext = false;
                for(var i = 0; i < 5; i++){
                    if(skipToNext) break;
                    switch(rampartTiles[t].direction){
                        case RIGHT:
                            if(room.getTerrain().get(posX+1,posY) != TERRAIN_MASK_WALL){
                                posX++;
                            }else{
                                skipToNext = true;
                            }
                            break;
                        case LEFT:
                            if(room.getTerrain().get(posX-1,posY) != TERRAIN_MASK_WALL){
                                posX--;
                            }else{
                                skipToNext = true;
                            }
                            break;
                        case BOTTOM:
                            if(room.getTerrain().get(posX,posY+1) != TERRAIN_MASK_WALL){
                                posY++;
                            }else{
                                skipToNext = true;
                            }
                            break;
                        case TOP:
                            if(room.getTerrain().get(posX,posY-1) != TERRAIN_MASK_WALL){
                                posY--;
                            }else{
                                skipToNext = true;
                            }
                            break;
                    }
                }
                towerTiles.push({x: posX, y: posY});
                room.visual.circle(posX, posY, {fill: '#0055ff'});
            }
            for(var t in towerTiles){
                room.createConstructionSite(towerTiles[t].x, towerTiles[t].y, STRUCTURE_TOWER);
            }
            for(var t in rampartTiles){
                room.createConstructionSite(rampartTiles[t].x, rampartTiles[t].y, STRUCTURE_RAMPART);
            }
            for(var t in wallTiles){
                room.createConstructionSite(wallTiles[t].x, wallTiles[t].y, STRUCTURE_WALL);
            }
        }
    },
    findEnergy: function(creep){
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
        }else{
        //    if(creep.memory.state == true && Game.getObjectById(creep.memory.target).store && Game.getObjectById(creep.memory.target).store.getUsedCapacity(RESOURCE_ENERGY) == 0){
        //        creep.memory.target = undefined;
        //    }
        }
    },
    distance: function(a,b){
        var posX = a.x - b.x;
        var posY = a.y - b.y;
        return Math.sqrt(posX * posX + posY * posY);
    },
}

module.exports = BasicRole;