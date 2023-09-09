
function Outpost(id){
    this.id = id;
    this.pos = Game.getObjectById(id).pos;
}

Outpost.prototype.run = function(room){

}

Outpost.ptototype.initialize = function(room){
    var outpostObject = Game.getObjectById(this.id);
    if(!this.memory.role){
        if(outpostObject instanceof Source){
            this.memory.role = 'energyMine';
        }
        if(outpostObject instanceof StructureController){
            this.memory.role = 'controller';
        }
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

var OutpostManager={
    outposts: [],
    run: function(room){

    },
    build: function(room){

    },
}

module.exports = OutpostManager;