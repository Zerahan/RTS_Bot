Object.defineProperty(Room.prototype, 'sources', {
    get: function(){
        //console.log("Room.prototype.sources");
        if(!this._sources){
            if(!global.rooms){
                global.rooms = new Object();
            }
            if(!global.rooms[this.name]){
                global.rooms[this.name] = new Object();
            }
            if(!global.rooms[this.name].sources){
                global.rooms[this.name].sources = new Array();
                var localSources = this.find(FIND_SOURCES);
                var controller = this.controller;
                for(var k in localSources){
                    global.rooms[this.name].sources.push(localSources[k].id);
                }
                if(controller){
                    if(global.rooms[this.name].sources.length > 1){
                        global.rooms[this.name].sources = this.sortByDistanceTo(global.rooms[this.name].sources, this.controller, true);
                    }
                }
            }
            this._sources = global.rooms[this.name].sources;
        }
        return this._sources;
    },
});

Object.defineProperty(Room.prototype, 'minerals', {
    get: function(){
        //console.log("Room.prototype.minerals");
        if(this._minerals == undefined){
            if(!global.rooms){
                global.rooms = new Object();
            }
            if(!global.rooms[this.name]){
                global.rooms[this.name] = new Object();
            }
            if(!global.rooms[this.name].minerals){
                global.rooms[this.name].minerals = new Array();
                const localMinerals = this.find(FIND_MINERALS);
                var controller = this.controller;
                for(var k in localMinerals){
                    global.rooms[this.name].minerals.push(localMinerals[k].id);
                }
                if(controller){
                    if(global.rooms[this.name].minerals.length > 1){
                        global.rooms[this.name].minerals = this.sortByDistanceTo(global.rooms[this.name].minerals, this.controller, true);
                    }
                }
            }
            this._minerals = global.rooms[this.name].minerals;
        }
        return this._minerals;
    }
});

Object.defineProperty(Room.prototype, 'resources', {
    get: function(){
        //console.log("Room.prototype.resources");
        if(!this._resources){
            var resourceList = new Array();
            resourceList = resourceList.concat(this.sources);
            resourceList = resourceList.concat(this.minerals);
            this._resources = resourceList;
        }
        return this._resources;
    }
});

Room.prototype.AddToBuildQueue = function(){
    
};

Room.prototype.sortByDistanceTo = function(list, obj, bExpensive){
    //console.log("Room.prototype.sortByDistanceTo()");
    if(list == undefined) return ERR_INVALID_ARGS;
    if(list.length == undefined) return ERR_INVALID_ARGS;
    if(obj == undefined) return ERR_INVALID_ARGS;
    var sortedList = list;
    bExpensive = (bExpensive != undefined ? bExpensive : true);
    if(bExpensive){
        sortedList.sort(function(a,b){
            var aLen = Game.getObjectById(a).pos.findPathTo(obj.pos, {ignoreCreeps: true, ignoreRoads: true, plainCost: 2, swampCost: 2}).length;
            var bLen = Game.getObjectById(b).pos.findPathTo(obj.pos, {ignoreCreeps: true, ignoreRoads: true, plainCost: 2, swampCost: 2}).length;
            if(aLen == bLen){
                return Game.getObjectById(a).pos.getRangeTo(obj.pos) > Game.getObjectById(b).pos.getRangeTo(obj.pos);
            }
            return aLen > bLen;
        });
    }else{
        sortedList.sort(function(a,b){ return Game.getObjectById(a).pos.getRangeTo(obj.pos) > Game.getObjectById(b).pos.getRangeTo(obj.pos); });
    }
    return sortedList;
};

Room.prototype.getRepairTargets = function(){
    if(this._repairTargets == undefined){
        this._repairTargets = new Array();
        var localtargets = this.find(FIND_STRUCTURES, {filter: (s)=>(s.hits < s.hitsMax && s.hitsMax < 1000000)});
        localtargets.sort((a,b)=>(a.hits-b.hits));
        for(var k in localtargets){
            this._repairTargets.push(localtargets[k].id);
        }
    }
    return this._repairTargets;
}

Room.prototype.getReinforceTargets = function(){
    if(this._reinforceTargets == undefined){
        this._reinforceTargets = new Array();
        var localtargets = this.find(FIND_STRUCTURES, {filter: (s)=>(s.hits < s.hitsMax && s.hitsMax > 1000000)});
        localtargets.sort((a,b)=>(a.hits-b.hits));
        for(var k in localtargets){
            this._reinforceTargets.push(localtargets[k].id);
        }
    }
    return this._reinforceTargets;
}

Room.prototype.getClosestNeighborTo = function(aID, bID){
    //console.log("Room.prototype.getClosestNeighborTo()");
    if(aID == undefined || bID == undefined) return ERR_INVALID_ARGS;
    var aObject = Game.getObjectById(aID);
    var bObject = Game.getObjectById(bID);
    var obj = Game.getObjectById(id);
    if(aObject == undefined || bObject == undefined) return ERR_INVALID_ARGS;
    var neighbors;
};

Room.prototype.getSources = function(){
    //console.log("Room.prototype.getSources()");
    if(!global.rooms){
        global.rooms = new Object();
    }
    if(!global.rooms[this.name]){
        global.rooms[this.name] = new Object();
    }
    if(!global.rooms[this.name].sourceObjects){
        global.rooms[this.name].sourceObjects = new Array();
        for(var i = 0; i < this.sources.length; i++){
            global.rooms[this.name].sourceObjects.push(Game.getObjectById(this.sources[i]));
        }
    }
    return global.rooms[this.name].sourceObjects;
};