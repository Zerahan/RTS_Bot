/*/
Room.prototype.getSources = function(){
    if(this.sources == undefined){
        this.sources = this.find(FIND_SOURCES);
    }
    return this.sources;
    if(global.map.rooms[this.name] == undefined){
        global.map.rooms[this.name] = new Object();
    }
    if(global.map.rooms[this.name].sources == undefined){
        var sourceData = {
            id: undefined,
            ref: undefined,
            isValid: function(){
                if(this.id == undefined) return ERR_INVALID_ARGS;
                if(this.get() == undefined) return ERR_INVALID_TARGET;
                return OK;
            },
            get: function(){
                if(ref == undefined || ref.id != this.id) ref = Game.getObjectById(this.id);
                return ref;
                
            }};
        global.map.rooms[this.name].sources = this.find(FIND_SOURCES);
    }
    return global.map.rooms[this.name].sources;
};
//*/

var DataHandler = {
    build: function(){
        if(global.map == undefined){
            console.log('rebuilding globals...');
            global.map = new Object();
            global.map.rooms = new Object();
        }
    }
};

module.exports = DataHandler;