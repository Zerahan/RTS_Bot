Object.defineProperty(StructureLink.prototype, 'memory', {
    configurable: true,
    get: function(){
        if(_.isUndefined(Memory.structures)){Memory.structures = {}}
        if(!_.isObject(Memory.structures)){ return undefined; }
        return Memory.structures[this.id] = Memory.structures[this.id] || {};
    },
    set: function(value){
        return;
        if(_.isUndefined(Memory.structures)){Memory.structures = {}}
        if(!_.isObject(Memory.structures)){ throw new Error('Could not set link memory'); }
        Memory.structures[this.id] = value;
    }
})

Object.defineProperty(StructureLink.prototype, 'role', {
    configurable: true,
    get: function(){
        if(_.isUndefined(this.memory['role'])){ this.memory['role'] = 'unknown'}
        //console.log("Role: " + this.memory['role']);
        return this.memory['role'];
    },
    set: function(val){
        if(typeof val === 'string'){
            if(_.isUndefined(this.memory['role'])){ this.memory['role'] = 'unknown'}
            this.memory['role'] = val;
            this._role = this.memory.role;
        }
    }
})

module.exports = {

};