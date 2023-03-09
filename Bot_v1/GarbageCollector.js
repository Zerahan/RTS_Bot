var GarbageCollector = {
    log: false,
    collectionTick: 30,
    run: function() {
        if(!Memory.GC){ Memory.GC = Game.time + this.collectionTick; }
        if(Game.time > Memory.GC){
            Memory.GC = Game.time + GarbageCollector.collectionTick;
            if(GarbageCollector.log){
                console.log("Garbage Collection @ (" + Game.time + ")");
            }
            for(const creepID in Memory.creeps){
                if(!Game.creeps[creepID]){
                    delete Memory.creeps[creepID];
                }
            }
            //delete Memory.rooms;
            for(const structureID in Memory.structures){
                if(!Game.getObjectById(structureID)){
                    delete Memory.structures[structureID];
                }
            }
        }
    }
}

module.exports = GarbageCollector;