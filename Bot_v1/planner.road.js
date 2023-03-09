var RoadPlanner = {
    run: function(room){
        if(!Memory.rooms[room.name]){
            Memory.rooms[room.name] = new Object();
        }
        if(!Memory.rooms[room.name].roads){
            Memory.rooms[room.name].roads = new Object();
        }
        var sources = room.find(FIND_SOURCES);
        if(!Memory.rooms[room.name].roads[room.controller]){
            Memory.rooms[room.name].roads[room.controller] = new Object();
            for(var sourceID in sources){
                var path = room.controller.pos.findPathTo(sources[sourceID].pos);
                Memory.rooms[room.name].roads[room.controller][sources[sourceID].id] = true;
                for(var i = 0; i < path.length-1; i++){
                    room.createConstructionSite(path[i].x,path[i].y,STRUCTURE_ROAD);
                }
            }
        }
        if(sources.length > 1){
            if(!Memory.rooms[room.name].roads[sources[0].id]){
                var path = sources[0].pos.findPathTo(sources[1].pos);
                Memory.rooms[room.name].roads[sources[0].id] = true;
                for(var i = 0; i < path.length-1; i++){
                    room.createConstructionSite(path[i].x,path[i].y,STRUCTURE_ROAD);
                }
            }
        }
        if(!Memory.rooms[room.name].roads.sourceRoads){
            Memory.rooms[room.name].roads.sourceRoads = new Object();
            for(var id in sources){
                Memory.rooms[room.name].roads.sourceRoads[sources[id].id] = new Array();
                var pos = sources[id].pos;
                for(var y = -1; y < 2; y++){
                    for(var x = -1; x < 2; x++){
                        if(room.getTerrain().get(pos.x+x, pos.y+y) != TERRAIN_MASK_WALL){
                            room.createConstructionSite(pos.x + x, pos.y + y, STRUCTURE_ROAD);
                            Memory.rooms[room.name].roads.sourceRoads[sources[id].id].push({x: pos.x + x, y: pos.y + y});
                        }
                    }
                }
            }
        }
    },
    reset: function(room){
        if(Memory.rooms[room.name].roads){
            delete Memory.rooms[room.name].roads;
        }
    }
}
module.exports = RoadPlanner;