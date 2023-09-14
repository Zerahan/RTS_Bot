Object.defineProperty(StructureSpawner.prototype, 'memory', {
    get: function(){
        if(_.isUndefined(Memory.spawners)) Memory.spawners = {};
        return Memory.spawners[this.id] = Memory.spawners[this.id] || {};
    },
    set: function(value){
        if(_.isUndefined(Memory.spawners)) Memory.spawners = {};
        Memory.spawners[this.id] = value;
    },
    configurable: true
})

Object.defineProperty(StructureSpawner.prototype, 'currentOrder',{
    get: function(){
        return this.memory.currentOrder;
    },
    set: function(value){
        this.memory.currentOrder = value;
    },
    enumerable: false,
    configurable: true
})

StructureSpawner.prototype.CanAddOrder = function(spawner){

}

StructureSpawner.prototype.GetCurrentOrder = function(spawner){

}