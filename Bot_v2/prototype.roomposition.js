RoomPosition.prototype.getNeighbors = function(bNotWalls){
    //console.log("RoomPosition.prototype.getNeighbors()");
    if(!this.neighbors){
        bNotWalls = (bNotWalls != undefined ? bNotWalls : false);
        this.neighbors = new Array();
        for(var y = -1; y < 2; y++){
            for(var x = -1; x < 2; x++){
                if(x == 0 && y == 0) continue;
                var posX = this.x+x;
                var posY = this.y+y
                if(posX < 0 || posX > 49 || posY < 0 || posY > 49) continue;
                if(bNotWalls){
                    if(Game.rooms[this.roomName].getTerrain().get(posX, posY) != TERRAIN_MASK_WALL){
                        this.neighbors.push(new RoomPosition(posX, posY, this.roomName));
                    }
                }else{
                    this.neighbors.push(new RoomPosition(posX, posY, this.roomName));
                }
            }
        }
    }
    return this.neighbors;
}

RoomPosition.prototype.equals = function(otherPosition){
    //console.log("RoomPosition.prototype.equals()");
    if(otherPosition == undefined) return ERR_INVALID_ARGS;
    if(otherPosition.x == undefined || otherPosition.y == undefined) return ERR_INVALID_ARGS;
}