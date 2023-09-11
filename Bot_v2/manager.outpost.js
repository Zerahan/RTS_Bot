var HarvesterRole = require('role.harvester');
var TransporterRole = require('role.transporter');
var Logger = require('logger');

// Outposts are things like energy sources.

function Outpost(id){
    this.id = id;
    this.pos = Game.getObjectById(id).pos;
}
Outpost.prototype.toString = function(){
    return 'Outpost at '+this.x+', '+this.y+'. Central Object ID: '+this.id;
}
Outpost.prototype.run = function(room){
    for(var role in this.memory.creeps){
        this.memory.creeps[role] = _.filter(this.memory.creeps[role], (s)=>(Game.creeps[s]));
        for(var id in this.memory.creeps[role]){
            var creep = Game.creeps[this.memory.creeps[role][id]];
            if(creep){
                if(!creep.memory.target){
                    creep.memory.target = this.id;
                }
                if(!creep.memory.container){
                    if(this.memory.containers && this.memory.containers.length > 0){
                        creep.memory.container = this.memory.containers[0];
                    }
                }
                //console.log("Harvesters...");
                switch(creep.memory.role){
                    case 'harvester':
                        HarvesterRole.run(creep);
                        break;
                    case 'transporter':
                        TransporterRole.run(creep);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    if(!this.memory.nextSpawnCheck){
        this.memory.nextSpawnCheck = Game.time;
    }
    if(this.memory.nextSpawnCheck < Game.time){
        var spawns = room.find(FIND_MY_SPAWNS);
        spawns = _.filter(spawns, (s)=>(s.spawning == null && s.store.getFreeCapacity(RESOURCE_ENERGY) == 0));
        //console.log("Available spawns: " + spawns.length);
        var isSpawning = ERR_INVALID_ARGS;
        if(spawns.length > 0 && false){
            for(var role in this.memory.maxCreeps){
                Logger.log("Outpost ("+this.id + "): " + "# of " + role + " is " + this.memory.creeps[role].length + " < " + this.memory.maxCreeps[role]);
                if(this.memory.creeps[role].length < this.memory.maxCreeps[role]){
                    switch(role){
                        case 'harvester':
                            var modules = (room.memory.freeBuild ? [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE]: [WORK,WORK,CARRY,MOVE]);
                            isSpawning = spawns[0].spawnCreep(modules, 'OutpostHarvester' + Game.time, {memory:{role:'basicHarvester', outpost: this.id, target: this.id}});
                            break;
                        case 'transporter':
                            var modules = (room.memory.freeBuild ? [WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]: [CARRY,MOVE]);
                            isSpawning = spawns[0].spawnCreep(modules, 'OutpostTransporter' + Game.time, {memory:{role:'basicTransporter', outpost: this.id, target: undefined}});
                            break;
                        default:
                            break;
                    }
                    if(isSpawning == OK){
                        break;
                    }
                }
            }
            if(isSpawning == OK){
                //this.memory.creeps[role].push(spawns[0].spawning.name);
                this.memory.nextSpawnCheck = Game.time + spawns[isSpawning].remainingTime + 5;
            }
        }
        if(isSpawning < 0){
            this.memory.nextSpawnCheck = Game.time + 5;
        }
    }
}
Outpost.prototype.initialize = function(room){
    var outpostObject = Game.getObjectById(this.id);
    if(!this.memory.role){
        if(outpostObject instanceof Source){
            this.memory.role = 'energyMine';
        }
        if(outpostObject instanceof StructureController){
            this.memory.role = 'controller';
        }
    }else{
        switch(this.memory.role){
            case 'energyMine':
                if(!this.memory.maxCreeps){
                    this.memory.maxCreeps = {
                        'harvester': 1,
                        'transporter': 1
                    }
                }
                if(!this.memory.creeps){
                    this.memory.creeps = new Object();
                    for(var role in this.memory.maxCreeps){
                        this.memory.creeps[role] = new Array();
                    }
                }
                if(!this.memory.containers){
                    var containers = Game.getObjectById(this.id).pos.findInRange(FIND_STRUCTURES,1);
                    containers = _.filter(containers,((s)=>(s.structureType == STRUCTURE_CONTAINER)));
                    console.log("Containers: " + containers.length);
                    if(containers.length > 0){
                        this.memory.containers = new Array();
                        for(var c in containers){
                            this.memory.containers.push(containers[c].id);
                        }
                    }
                    /*/
                    var neighbors = Game.getObjectById(this.id).pos.getNeighbors();
                    for(var n in neighbors){
                        var structures = room.lookForAt(LOOK_STRUCTURES, neighbors[n].x, neighbors[n].y);
                        structures = _.filter(structures, (s)=>(s.structureType == STRUCTURE_CONTAINER));
                        for(var s in structures){
                            if(structures[s].memory != undefined){
                                structures[s].memory.role = 'distributer';
                            }
                            this.memory.containers.push(structures[s].id);
                        }
                    }
                    //*/
                }
                break;
            case 'controller':
                if(!this.memory.containers){
                    var containers = Game.getObjectById(this.id).pos.findInRange(FIND_STRUCTURES,2);
                    containers = _.filter(containers,((s)=>(s.structureType == STRUCTURE_CONTAINER)));
                    console.log("Containers: " + containers.length);
                    if(containers.length > 0){
                        this.memory.containers = new Array();
                        for(var c in containers){
                            this.memory.containers.push(containers[c].id);
                        }
                    }
                }
                break;
            case 'spawner':
                break;
        }
    }
    room.visual.circle(this.pos, {fill: '#00000000', radius: 0.5, stroke: '#00ffff'});
    for(var a in this.memory.containers){
        var container = Game.getObjectById(this.memory.containers[a]);
        if(!container) continue;
        room.visual.line(this.pos.x, this.pos.y, container.pos.x, container.pos.y, {color: '#00ff00'});
        room.visual.circle(container.pos, {fill: '#00ff00'});
    }
}

Object.defineProperty(Outpost.prototype, 'memory', {
    get: function(){
        if(!this._memory){
            if(this.id == undefined) return ERR_INVALID_ARGS;
            if(!Memory.rooms){
                Memory.rooms = new Object();
            }
            if(!Memory.rooms[this.pos.roomName]){
                Memory.rooms[this.pos.roomName] == new Object();
            }
            if(!Memory.rooms[this.pos.roomName].outposts){
                Memory.rooms[this.pos.roomName].outposts = new Object();
            }
            if(!Memory.rooms[this.pos.roomName].outposts[this.id]){
                Memory.rooms[this.pos.roomName].outposts[this.id] = new Object();
            }
            this._memory = Memory.rooms[this.pos.roomName].outposts[this.id];
        }
        return this._memory;
   }
});

var OutpostManager = {
    outposts: [],
    run: function(room){
        this.buildOutposts(room);
        for(var o in this.outposts){
            this.outposts[o].initialize(room);
            this.outposts[o].run(room);
        }
    },
    buildOutposts: function(room){
        if(this.outposts.length == 0){
            if(room.memory.outposts === undefined){
                var basicOutposts = room.getSources();
                basicOutposts.push(room.controller);
                for(var o in basicOutposts){
                    var outpost = new Outpost(basicOutposts[o].id);
                    outpost.memory;
                    this.outposts.push(outpost);
                }
            }else{
                for(var outpostID in room.memory.outposts){
                    this.outposts.push(new Outpost(outpostID));
                }
            }
        }
    },
}

module.exports = OutpostManager;