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

RoomPosition.prototype.getNeighbor = function(direction){

}

RoomPosition.prototype.getCoordFromDirection = function(direction){
    switch(direction){
        case TOP:           return [ 0,-1];
        case BOTTOM:        return [ 0, 1];
        case LEFT:          return [-1, 0];
        case RIGHT:         return [ 1, 0];
        case TOP_LEFT:      return [-1,-1];
        case TOP_RIGHT:     return [ 1,-1];
        case BOTTOM_LEFT:   return [-1, 1];
        case BOTTOM_RIGHT:  return [ 1, 1];
        default:            return [ 0, 0];
    }
}

RoomPosition.prototype.convertToTile = function(){
    return {x: this.x, y: this.y, roomName: this.roomName};
}