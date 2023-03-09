Source.prototype.sortNeighbors = function(){
    if(!global.sources[this.id]._sortedNeighbors){
        global.sources[this.id]._sortedNeighbors = true;
        var neighborsList = this.neighbors;
        const room = Game.rooms[this.pos.roomName];
        this._neighbors = neighborsList.sort(
            function(a,b){
                var aLength = room.controller.pos.findPathTo(a, {ignoreCreeps: true}).length;
                var bLength = room.controller.pos.findPathTo(b, {ignoreCreeps: true}).length;
                if(aLength == bLength){
                    aLength = room.controller.pos.getRangeTo(a);
                    bLength = room.controller.pos.getRangeTo(b);
                }
                return aLength > bLength;
            }
        );
    }
};

Object.defineProperty(Source.prototype, 'closestNeighborByPath', {
    configurable: true,
    get: function(){
        this.sortNeighbors();
        return this.neighbors[0];
    }
});

Object.defineProperty(Source.prototype, 'furthestNeighborByPath', {
    configurable: true,
    get: function(){
        this.sortNeighbors();
        return this.neighbors[this.neighbors.length-1];
    }
});

Object.defineProperty(Source.prototype, 'neighbors', {
    configurable: true,
    get: function() {
        if(!this._neighbors){
            if(!global.sources){
                global.sources = new Array();
            }
            if(!global.sources[this.id]){
                global.sources[this.id] = {ref: this};
            }
            if(!global.sources[this.id].neighbors){
                console.log("rebuilding neighbors for source: " + this.id);
                const room = Game.rooms[this.pos.roomName];
                global.sources[this.id].neighbors = new Array();
                for(let y = -1; y < 2; y++){
                    for(let x = -1; x < 2; x++){
                        let localPos = {x: this.pos.x+x, y: this.pos.y+y};
                        if(localPos.x < 0 || localPos.y < 0 || localPos.x > 49 || localPos.y > 49) continue;
                        if(room.getTerrain().get(localPos.x, localPos.y) != TERRAIN_MASK_WALL){
                            global.sources[this.id].neighbors.push(new RoomPosition(localPos.x, localPos.y, this.pos.roomName));
                        }
                    }
                }
            }
            this._neighbors = global.sources[this.id].neighbors;
        }
        return this._neighbors;
    }
});

Source.prototype.getOpenNeighbors = function(args){
    if(args == undefined) args = new Object();
    if(args.ignoreCreeps == undefined) args.ignoreCreeps = false
    if(args.ignoreStructures == undefined) args.ignoreStructures = false;
    
    let openNeighbors = new Array();
    for(var k in this.neighbors){
        var lookTargets = Game.rooms[this.pos.roomName].lookAt(this.neighbors[k]);
        lookTargets = _.filter(lookTargets, (foundObject) => (foundObject.type == 'creep' || foundObject.type == 'struicture'));
        if(lookTargets.length == 0){
            openNeighbors.push(this.neighbors[k]);
        }
    }
    return openNeighbors;
}

module.exports = {
}