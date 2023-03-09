Object.defineProperty(StructureContainer.prototype, 'memory', {
    get: function(){
        if(!this._memory){
            if(!Memory.rooms){
                Memory.rooms = new Object();
            }
            if(!Memory.rooms[this.pos.roomName]){
                Memory.rooms[this.pos.roomName] = new Object();
            }
            if(!Memory.rooms[this.pos.roomName].structures){
                Memory.rooms[this.pos.roomName].structures = new Object();
            }
            if(!Memory.rooms[this.pos.roomName].structures[this.id]){
                Memory.rooms[this.pos.roomName].structures[this.id] = new Object();
            }
            this._memory = Memory.rooms[this.pos.roomName].structures[this.id];
        }
        return this._memory;
    }
});

Object.defineProperty(StructureLink.prototype, 'memory', {
    get: function(){
        if(!this._memory){
            if(!Memory.rooms){
                Memory.rooms = new Object();
            }
            if(!Memory.rooms[this.pos.roomName]){
                Memory.rooms[this.pos.roomName] = new Object();
            }
            if(!Memory.rooms[this.pos.roomName].structures){
                Memory.rooms[this.pos.roomName].structures = new Object();
            }
            if(!Memory.rooms[this.pos.roomName].structures[this.id]){
                Memory.rooms[this.pos.roomName].structures[this.id] = new Object();
            }
            this._memory = Memory.rooms[this.pos.roomName].structures[this.id];
        }
        return this._memory;
    }
});