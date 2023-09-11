Creep.prototype.getStructuresOnTile = function(){
    //console.log("Creep.prototype.getStructuresOnTile()");
    if(!this._structuresOnTile){
        this._structuresOnTile = this.pos.lookFor(LOOK_STRUCTURES);
        //this._structuresOnTile = _.filter(structures, (target)=>(target.hits < target.hitsMax));
    }
    return this._structuresOnTile;
}

Creep.prototype.getEnergyFrom = function(target){
    if(target == undefined) return ERR_INVALID_ARGS;
    if(target instanceof Creep) return target.transfer(this, RESOURCE_ENERGY);
    if(target instanceof Structure || target instanceof Tombstone || target instanceof Ruin) return this.withdraw(target, RESOURCE_ENERGY);
    if(target instanceof Resource) return this.pickup(target);
}