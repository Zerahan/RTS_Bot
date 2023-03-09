Object.defineProperty(Room.prototype, 'sources', {
    configurable: true,
    get: function(){
        if(!this._sources){
            if(global.rooms == undefined){
                global.rooms = new Object();
            }
            if(global.rooms[this.name] == undefined){
                global.rooms[this.name] = new Object();
            }
            if(global.rooms[this.name].sources == undefined){
                console.log("Rebuilding source list for " + this.name);
                global.rooms[this.name].sources = new Array();
                var sources = this.find(FIND_SOURCES);
                for(const k in sources){
                    const source = sources[k];
                    global.rooms[this.name].sources.push({id: source.id, get: function(){ return Game.getObjectById(this.id); }});
                }
            }
            this._sources = global.rooms[this.name].sources;
        }
        return this._sources;
    }
});
/*/
Object.defineProperty(Room.prototype, 'memory', {
    configurable: true,
    get: function(){
        if(!this._memory){
            if(!Memory.rooms[this.roomName]){Memory.rooms[this.pos.roomName] = new Object()}
            this._memory = Memory.rooms[this.roomName];
        }
        return this._memory;
    }
});
//*/

module.exports = {

};