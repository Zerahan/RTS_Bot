var ConstructionPlanner = {
    timer: 0,
    toggle: false,
    reset: false,
    straightCost: 1,
    diagonalCost: 1.4142,
    run: function(room, phase){
        ConstructionPlanner.findSafeZone(room);
        //ConstructionPlanner.roads(room);
    },
    findSafeZone: function(room){
        ConstructionPlanner.timer++;
        if(ConstructionPlanner.timer < 1) return;
        ConstructionPlanner.timer = 0;
        if(Game.cpu.bucket < 6000) return;
        if(room.name != "W3N4") return;
        //console.log("bucket: " + Game.cpu.bucket);
        var newList = new Array();
        var openList;
        var closeList;
        var ignoreList;
        var maxCost = 0;
        var count = 0;
        if(!Memory.rooms){
            Memory.rooms = new Object();
            Memory.rooms[room.name] = new Object();
        }
        //*/
        if(Memory.rooms[room.name].areaGen && (ConstructionPlanner.reset || Memory.rooms[room.name].areaGen.openList.length > 200)){
            delete Memory.rooms[room.name].areaGen;
            console.log("cleared areagen");
            return;
        }
        //*/
        if(!Memory.rooms[room.name].areaGen){
            Memory.rooms[room.name].areaGen = new Object();
            Memory.rooms[room.name].areaGen.generating = true;
            Memory.rooms[room.name].areaGen.openList = new Array();
        }
        if(!Memory.rooms[room.name].areaGen.generating){
            delete Memory.rooms[room.name].areaGen.openList;
            Memory.rooms[room.name].areaGen.generating = true;
            Memory.rooms[room.name].areaGen.maxCost = 0;
            Memory.rooms[room.name].areaGen.count = 0;
            Memory.rooms[room.name].areaGen.openList = new Array();
            Memory.rooms[room.name].areaGen.closeList = new Array();
            Memory.rooms[room.name].areaGen.ignoreList = new Array();
            openList = new Array();
            closeList = new Array();
            ignoreList = new Array();
            /*/
            var exits = room.find(FIND_EXIT);
            for(var e in exits){
                openList.push({cost:0, range: ConstructionPlanner.distance(room.controller.pos, exits[e]), pos:exits[e], isDeadEnd: false, neighborCount: -1, lastTile: exits[e]});
            }
            //*/
            //*/
            var exits = ConstructionPlanner.findNeighborTiles(room, room.controller.pos, TERRAIN_MASK_WALL);
            for(var e in exits){
                openList.push({cost:0, range: ConstructionPlanner.distance(room.controller.pos, exits[e].pos), pos:exits[e].pos, isDeadEnd: false, neighborCount: -1, lastTile: room.controller.pos});
            }
            //*/
            console.log(openList.length);
        }else{
            openList = Memory.rooms[room.name].areaGen.openList;
            closeList = Memory.rooms[room.name].areaGen.closeList;
            ignoreList = Memory.rooms[room.name].areaGen.ignoreList;
            maxCost = Memory.rooms[room.name].areaGen.maxCost;
            count = Memory.rooms[room.name].areaGen.count;
        }
        if(openList.length == 0){
            Memory.rooms[room.name].areaGen.generating = false;
            return;
        }
        
        while(openList.length > 0 && count++ < (50*50)){
            var tile = openList.pop();
            //if(!tile) break;
            if(tile.cost < 0 ){
                ignoreList.push(tile);
            }else{
                closeList.push(tile);
            }
            //console.log(tile.pos);
            //continue;
            var neighbors = ConstructionPlanner.findNeighborTiles(room, tile.pos, TERRAIN_MASK_WALL);
            var hasNewNeighbors = false;
            for(var i in neighbors){
                //var neighborTile = neighbors[i];
                var openTile = undefined;
                var closeTile = undefined;
                var ignoreTile = undefined;
                var newListTile = undefined;
                openTile = openList.find((e) => (ConstructionPlanner.posEquals(e.pos, neighbors[i].pos)));
                if(!openTile){
                    closeTile = closeList.find((e) => (ConstructionPlanner.posEquals(e.pos, neighbors[i].pos)));
                    if(!closeTile){
                        ignoreTile = ignoreList.find((e) => (ConstructionPlanner.posEquals(e.pos, neighbors[i].pos)));
                        if(!ignoreTile){
                            newListTile = newList.find((e) => (ConstructionPlanner.posEquals(e.pos, neighbors[i].pos)));
                        }
                    }
                }
                var tileCost = (neighbors[i].isStraight ? ConstructionPlanner.straightCost : ConstructionPlanner.diagonalCost);
                if(!openTile && !closeTile && !ignoreTile && !newListTile){
                    hasNewNeighbors = true;
                    newList.push({cost: tile.cost+tileCost, range: ConstructionPlanner.distance(room.controller.pos, neighbors[i].pos), pos: neighbors[i].pos, isDeadEnd: false, neighborCount: 0, lastTile: tile.pos});
                    continue;
                }else{
                    if(openTile != undefined){
                        if(openTile.cost > (tile.cost+tileCost)){
                            openTile.cost = tile.cost+tileCost;
                            openTile.lastTile = tile.pos;
                        }
                    }
                    if(closeTile != undefined){
                        if(closeTile.cost > (tile.cost+tileCost)){
                            closeTile.cost = tile.cost+tileCost;
                            closeTile.lastTile = tile.pos;
                        }
                    }
                    if(ignoreTile != undefined){
                        if(ignoreTile.cost > (tile.cost+tileCost)){
                            ignoreTile.cost = (tile.cost+tileCost);
                            ignoreTile.lastTile = tile.pos;
                        }
                    }
                    if(newListTile != undefined){
                        hasNewNeighbors = true;
                        if(newListTile.cost > (tile.cost+tileCost)){
                            newListTile.cost = (tile.cost+tileCost);
                            newListTile.lastTile = tile.pos;
                        }
                    }
                }
            }
            //tile.isDeadEnd = !hasNewNeighbors;
            if(tile.neighborCount != -1){
                //tile.isDeadEnd = neighbors.length < 4;
                tile.neighborCount = 4-neighbors.length;
            }
            if(tile.cost > maxCost){
                maxCost = tile.cost;
            }
            //console.log("openList: " + openList.length);
        }
        Memory.rooms[room.name].areaGen.openList = newList.reverse();//.sort((a,b) => (a.cost < b.cost));
        Memory.rooms[room.name].areaGen.closeList = closeList;
        //console.log("openList: " + openList.length + " | ignoreList: " + ignoreList.length + " | closeList: " + closeList.length + " | newList: " + newList.length);
        for(var i = 0; i < closeList.length; i++){
            var tile = closeList[i];
            //if(closeList[i].cost < 20) continue;
            var color = ConstructionPlanner.rgbToHex(255,Math.floor(128*(tile.cost/maxCost)),Math.floor(255*(tile.cost/maxCost)));
            room.visual.line(tile.pos, tile.lastTile, {color:(!tile.isDeadEnd ? '#ff0000' : '#00ffff')});
            if(tile.isDeadEnd){
                room.visual.circle(tile.pos, {color:'#00ffff'});
            }
            //room.visual.text(tile.cost, tile.pos, {color:(!tile.isDeadEnd ? '#ff0000' : '#00ffff')});
        }
        for(var i = 0; i < newList.length; i++){
            if(i == 0){
                this.convertPosToDirection(newList[0].pos, newList[0].lastTile);
            }
            var tile = newList[i];
            room.visual.circle(tile.pos, {color:'#00ff00'});
            room.visual.line(tile.pos, tile.lastTile, {color:'#00ff00'});
        }
    },
    convertPosToDirection: function(a,b){
        var returnValue = -1;
        var direction = {x: 0, y: 0, round: function(){this.x = Math.ceil(this.x); this.y = Math.ceil(this.y);}, construct: function(a,b){this.x = a.x-b.x; this.y = a.y-b.y;}, toString: function(){ return ("(" + Math.ceil(this.x) + ", " + Math.ceil(this.y) + ")"); }, divide: function(scalar) { this.x = this.x/scalar; this.y = this.y/scalar;}, magnitude: function() {return Math.sqrt(this.x * this.x + this.y * this.y)}};
        direction.construct(a,b);
        direction.divide(direction.magnitude());
        direction.round();
        var directionConverter = [{code: TOP, coord: {x: 0, y: -1}},{code: TOP_RIGHT, coord: {x: 1, y: -1}}, {code: RIGHT, coord: {x: 1, y: 0}}, {code: BOTTOM_RIGHT, coord: {x: 1, y: 1}}, {code: BOTTOM, coord: {x: 0, y: 1}}, {code: BOTTOM_LEFT, coord: {x: -1, y: 1}}, {code: LEFT, coord: {x: -1, y: 0}}, {code: TOP_LEFT, coord: {x: -1, y: 1}}];
        var i = -1;
        for(var k in directionConverter){
            if(directionConverter[k].coord.x == direction.x && directionConverter[k].coord.y == direction.y){
                i = k;
                break;
            }
        }
        var code = "";
        switch(directionConverter[i].code){
            case TOP:
                code = "TOP";
                break;
            case TOP_RIGHT:
                code = "TOP_RIGHT";
                break;
            case RIGHT:
                code = "RIGHT";
                break;
            case BOTTOM_RIGHT:
                code = "BOTTOM_RIGHT";
                break;
            case BOTTOM:
                code = "BOTTOM";
                break;
            case BOTTOM_LEFT:
                code = "BOTTOM_LEFT";
                break;
            case LEFT:
                code = "LEFT";
                break;
            case TOP_LEFT:
                code = "TOP_LEFT";
                break;
        }
        console.log(direction.toString() + " is " + code);
        
    },
    posEquals: function(a, b){
        return (a.x == b.x && a.y == b.y);
    },
    findNeighborTiles: function(room,tilePos,notType){
        var neighbors = new Array();
        //console.log(tilePos.x + ":" + tilePos.y + ":"+room.name);
        //if(!tilePos.x) return neighbors;
        var offsetX = 0;
        var offsetY = 0;
        for(var y = -1; y < 2; y++){
            for(var x = -1; x < 2; x++){
                offsetX = tilePos.x+x;
                offsetY = tilePos.y+y;
                if(offsetX < 0 || offsetX > 49) continue;
                if(offsetY < 0 || offsetY > 49) continue;
                if(x == 0 && y == 0) continue;
                //if(Math.abs(x) == Math.abs(y)) continue;
                if(room.getTerrain().get(offsetX, offsetY) != notType){
                    var isStraight = Math.abs(x) != Math.abs(y);
                    neighbors.push({pos: new RoomPosition(offsetX, offsetY, room.name), isStraight: isStraight});
                }
            }
        }
        return neighbors;
    },
    distance: function(posA, posB){
        var a = posA.x - posB.x;
        var b = posA.y - posB.y;
        return Math.floor(Math.sqrt(a*a + b*b));
    },
    rgbToHex: function(r,g,b){
         return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    roads: function(room){
        var roadPaths = new Object();
        var closestPoints = new Array();
        var pos = room.controller.pos;
        var objects = new Array();
        objects.push(room.controller);
        objects = objects.concat(room.find(FIND_SOURCES));
        //objects = objects.concat(room.find(FIND_MINERALS));
        
        for(var i = 0; i < objects.length; i++){
            var v = objects[i];
            pos = v.pos;
            room.visual.circle(
                v.pos.x,
                v.pos.y,
                {radius:'0.5', fill:'#00ff00'}
            );
            for(var y = -1; y < 2; y++){
                for(var x = -1; x < 2; x++){
                    if(room.getTerrain().get(pos.x+x, pos.y+y) != TERRAIN_MASK_WALL){
                        if(!roadPaths[(pos.x+x) + "," + (pos.y+y)]){
                            //roadPaths[(pos.x+x) + "," + (pos.y+y)] = new RoomPosition(pos.x+x, pos.y+y, room.name);
                        }
                    }
                }
            }
            for(var j = i; j < objects.length; j++){
                var path = v.pos.findPathTo(objects[j].pos,{ignoreCreeps:true,ignoreRoads:false,ignoreDestructibleStructures:true});
                for(var l = 0; l < path.length-1; l++){
                    if(!roadPaths[(path[l].x) + "," + (path[l].y)]){
                        roadPaths[(path[l].x) + "," + (path[l].y)] = new RoomPosition(path[l].x, path[l].y, room.name);
                    }
                }
            }
        }
        
        ConstructionPlanner.debug(room, roadPaths);
    },
    debug: function(room, list){
        if(list){
            for(var k in list){
                v = list[k];
                room.visual.circle(
                    v,
                    {radius:'0.2', fill:'#aaaaaa'}
                );
            }
        }
        
    }
};
module.exports = ConstructionPlanner;