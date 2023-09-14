var Mapper = {
    steps : 32,
    run : function(room){
        this.floodfill(room);
        if(Memory.rooms[room.name].map.finishedPathableCheck){
            this.floodfillCliff(room);
        }
        for(const k in Memory.rooms[room.name].map.closeList){
            var tile = Memory.rooms[room.name].map.closeList[k];
            if(!tile) continue;
            var showCombinedDistance = false;
            var showExitDistance = true;
            if(showCombinedDistance){
                var maxCost = Memory.rooms[room.name].map.maxCost || 50;
                var maxCliff = Memory.rooms[room.name].map.cliffNum || 50;
                var color = this.getColor(tile.cost * (tile.cliff/maxCliff), maxCost, [0,0,0], [0,255,255], [0,255,0]);
                var hex = this.rgbToHex(color[0], color[1], color[2]);
                this.drawRect(room, tile.x, tile.y, hex, tile.cost);
            }else{
                if(!showExitDistance){
                    var maxCost = Memory.rooms[room.name].map.cliffNum-1 || 50;
                    var color = this.getColor(tile.cliff, maxCost, [255,0,0], [0,0,255], [0,255,0]);
                    var hex = this.rgbToHex(color[0], color[1], color[2]);
                    this.drawRect(room, tile.x, tile.y, hex, tile.cost);
                }
                if(showExitDistance){
                    var maxCost = Memory.rooms[room.name].map.maxCost || 50;
                    var color = this.getColor(tile.cost, maxCost, [255,0,0], [0,0,255], [0,255,0]);
                    var hex = this.rgbToHex(color[0], color[1], color[2]);
                    this.drawRect(room, tile.x, tile.y, hex, tile.cost);
                }
            }
            //this.drawDirection(room, tile.x, tile.y, tile.dir, hex);
            //this.drawText(room, tile.x, tile.y, tile.cliff, (tile.cliff == -1 ? 0.1 : 1));
        }
        for(const k in Memory.rooms[room.name].map.nextList){
            var idx = Memory.rooms[room.name].map.nextList[k];
            var tile = Memory.rooms[room.name].map.closeList[idx];
            this.drawRect(room, tile.x, tile.y, "#00ffff");
        }
        return;
    },
    floodfill : function(room){
        if(Memory.rooms[room.name].map.finishedPathableCheck) return;
        var openList = Memory.rooms[room.name].map.openList || [];
        var closeList = Memory.rooms[room.name].map.closeList || [];
        var nextList = Memory.rooms[room.name].map.nextList || [];
        if(closeList.length == 0){
            var exits = room.find(FIND_EXIT);
            for(var k in exits){
                openList.push({x: exits[k].x, y: exits[k].y, cost: 0, cliff: -1, dir: -1});
            }
        }
        if(openList.length == 0){
            Memory.rooms[room.name].map.finishedPathableCheck = true;
            return;
        }
        if(Memory.rooms[room.name].map.maxCost == undefined){
            Memory.rooms[room.name].map.maxCost = 1;
        }
        for(var i = 0; i < 50; i++){
            if(openList.length == 0) continue;
            var tile = openList.shift();
            if(tile == undefined) continue;
            closeList.push(tile);
            var neighborsObject = this.getNeighbors(room, tile);
            tile.containsCliff = neighborsObject.containsCliff;
            var foundOneValidNeighbor = false;
            for(var k in neighborsObject.neighbors){
                var node = neighborsObject.neighbors[k];
                if(this.contains(openList, node.x, node.y) != -1) continue;
                if(this.contains(closeList, node.x, node.y) != -1) continue;
                openList.push({x: node.x, y: node.y, cost: (tile.cost + 1), cliff: -1, dir: node.dir}); // add neighbors.
                foundOneValidNeighbor = true;
            }
            if(tile.containsCliff){
                tile.cliff = 0;
                nextList.push(closeList.length-1);
            }else{
                tile.cliff = -1;
            }
            if(foundOneValidNeighbor){
                if(Memory.rooms[room.name].map.maxCost < tile.cost + 1){
                    Memory.rooms[room.name].map.maxCost = tile.cost + 1;
                }
            }
        }
        Memory.rooms[room.name].map.openList = openList;
        Memory.rooms[room.name].map.closeList = closeList;
        Memory.rooms[room.name].map.nextList = nextList;
    },
    floodfillCliff : function(room){
        if(Memory.rooms[room.name].map.cliffCheck == "complete"){
            return;
        }
        var openList = Memory.rooms[room.name].map.openList2 || [];
        var closeList = Memory.rooms[room.name].map.closeList || [];
        var nextList = Memory.rooms[room.name].map.nextList || [];
        if(openList.length == 0){
            openList = this.copy(Memory.rooms[room.name].map.nextList);
            console.log("NextSize: " + Memory.rooms[room.name].map.nextList.length);
            delete Memory.rooms[room.name].map.nextList;
            nextList = [];
            if(Memory.rooms[room.name].map.cliffNum == undefined){
                Memory.rooms[room.name].map.cliffNum = 0;
            }else{
                Memory.rooms[room.name].map.cliffNum++;
            }
        }
        if(openList.length == 0){
            Memory.rooms[room.name].map.cliffCheck = "complete";
        }
        for(var i = 0; i < 50; i++){
            var index = openList.shift();
            var tile = closeList[index];
            if(tile == undefined) continue;
            tile.cliff = Memory.rooms[room.name].map.cliffNum;
            var neighborsObject = this.getNeighborsCardinal(room, tile);
            for(const k in neighborsObject.neighbors){
                var n = neighborsObject.neighbors[k];
                var idx = this.contains(closeList, n.x, n.y)
                var node = closeList[idx];
                if(node.cliff > -1) continue;
                if(this.containsRef(openList, idx) > -1) continue;
                if(this.containsRef(nextList, idx) > -1) continue;
                nextList.push(idx);
            }
        }
        Memory.rooms[room.name].map.openList2 = openList;
        Memory.rooms[room.name].map.closeList = closeList;
        Memory.rooms[room.name].map.nextList = nextList;
        return;
        var closeList = Memory.rooms[room.name].map.closeList || [];
        if(openList.length == 0){
            openList = this.copyRef(Memory.rooms[room.name].map.closeList) || [];
        }
        if(openList.length == 0){
            Memory.rooms[room.name].map.finishedCliffCheck = true;
            return;
        }
        for(var i = 0; i < 50; i++){
            if(openList.length == 0) continue;
            var index = openList.shift();
            var tile = closeList[index];
            if(tile == undefined) continue;
            if(tile.cliff != -1) continue;
            var neighborsObject = this.getNeighborsCardinal(room, tile);
            for(const k in neighborsObject.neighbors){
            }
            closeList[index] = tile;
        }
        if(openList.length == 0) Memory.rooms[room.name].map.finishedCliffCheck = true;
        Memory.rooms[room.name].map.openList2 = openList;
        Memory.rooms[room.name].map.closeList = closeList;
    },
    copy : function(list){
        var list2 = [];
        for(const k in list){
            list2.push(list[k]);
        }
        return list2;
    },
    copyRef : function(list){
        var list2 = [];
        for(const k in list){
            list2.push(k);
        }
        return list2;
    },
    containsRef : function(list, ref){
        for(var i = 0; i < list.length; i++){
            if(list[i] == ref) return i;
        }
        return -1;
    },
    contains : function(list, x, y){
        for(var i = 0; i < list.length; i++){
            if(list[i].x == x && list[i].y == y) return i;
        }
        return -1;
    },
    reset : function(room){
        delete Memory.rooms[room.name].map;
    },
    getDistanceArray : function(room){
        return Memory.rooms[room.name].map.distancefromExit;
    },
    init: function(room){
        if(!Memory.rooms){
            Memory.rooms = new Object();
        }
        if(!Memory.rooms[room.name]){
            Memory.rooms[room.name] = new Object();
        }
        if(!Memory.rooms[room.name].map){
            Memory.rooms[room.name].map = new Object();
        }
    },
    drawText : function(room, x, y, str, opacity){
        opacity = opacity || 1;
        room.visual.text(str, x, y+0.25, {align:'center', opacity: opacity});
    },
    drawRect : function(room, x, y, color, value){
        value = value || 0;
        color = color || '#ffffff';
        room.visual.rect(x-0.5, y-0.5, 1, 1, {fill: color, stroke: 'transparent', opacity: 0.3});
        if(value == 19) room.visual.rect(x-0.5, y-0.5, 1, 1, {fill: 'transparent', stroke: '#ffffff', opacity: 1});
    },
    drawDirection : function(room, x, y, dir, color){
        var x2 = x;
        var y2 = y;
        switch(dir){
            case TOP_RIGHT:
                x2 += -1;
                y2 += 1;
                break;
            case TOP:
                y2 += 1;
                break;
            case TOP_LEFT:
                x2 += 1;
                y2 += 1;
                break;
            case RIGHT:
                x2 += -1;
                break;
            case LEFT:
                x2 += 1;
                break;
            case BOTTOM_RIGHT:
                x2 += -1;
                y2 += -1;
                break;
            case BOTTOM:
                y2 += -1;
                break;
            case BOTTOM_LEFT:
                x2 += 1;
                y2 += -1;
                break;
            default:
                return;
        }
        room.visual.line(x, y, x2, y2, {color: color});
    },
    getNeighbors : function(room, tile){
        if(tile == undefined) return;
        var val = {};
        val.neighbors = [];
        val.containsCliff = false;
        for(var tx = -1; tx <=1; tx++){
            for(var ty = -1; ty <= 1; ty++){
                if(tx == 0 && ty == 0) continue;
                var xPos = tx + tile.x;
                var yPos = ty + tile.y;
                if(xPos < 0 || xPos > 49) continue;
                if(yPos < 0 || yPos > 49) continue;
                if(room.getTerrain().get(xPos,yPos) == TERRAIN_MASK_WALL){
                    if(tx == 0 || ty == 0){
                        val.containsCliff = true;
                    }
                    continue;
                }
                var direction = -2;
                if(tx == -1 && ty == -1) {direction = TOP_LEFT;}
                if(tx == 0 && ty == -1) {direction = TOP;}
                if(tx == 1 && ty == -1) {direction = TOP_RIGHT;}
                if(tx == -1 && ty == 1) {direction = BOTTOM_LEFT;}
                if(tx == 0 && ty == 1) {direction = BOTTOM;}
                if(tx == 1 && ty == 1) {direction = BOTTOM_RIGHT;}
                if(tx == -1 && ty == 0) {direction = LEFT;}
                if(tx == 1 && ty == 0) {direction = RIGHT;}
                val.neighbors.push({x: xPos, y: yPos, dir: direction});
            }
        }
        return val;
    },
    getNeighborsCardinal(room, tile){
        var tilesToCheck = [];
        val = {};
        val.neighbors = [];
        if(tile.x - 1 >= 0) tilesToCheck.push([tile.x - 1, tile.y, LEFT]);
        if(tile.x + 1 < 50) tilesToCheck.push([tile.x + 1, tile.y, RIGHT]);
        if(tile.y - 1 >= 0) tilesToCheck.push([tile.x, tile.y - 1, TOP]);
        if(tile.y + 1 < 50) tilesToCheck.push([tile.x, tile.y + 1, BOTTOM]);
        for(var k in tilesToCheck){
            var tile = tilesToCheck[k];
            if(room.getTerrain().get(tile[0],tile[1]) == TERRAIN_MASK_WALL){
                continue;
            }
            val.neighbors.push({x: tile[0], y: tile[1], dir: tile[2]});
        }
        return val;
    },
    coordFromDirection(direction){
        return [x,y];
    },
    getColor : function(val, maxVal, colorA, colorB, colorC){
        var perc = val / maxVal;
        var newColor = [0,0,0];
        if(perc < 0.5){
            newColor[0] = this.lerp(colorA[0], colorB[0], perc*2);
            newColor[1] = this.lerp(colorA[1], colorB[1], perc*2);
            newColor[2] = this.lerp(colorA[2], colorB[2], perc*2);
        }else{
            newColor[0] = this.lerp(colorB[0], colorC[0], (perc-0.5)*2);
            newColor[1] = this.lerp(colorB[1], colorC[1], (perc-0.5)*2);
            newColor[2] = this.lerp(colorB[2], colorC[2], (perc-0.5)*2);
        }
        return newColor;
    },
    lerp : function(a, b, p){
        var modP = p * this.steps;
        modP = Math.ceil(modP) / this.steps;
        var value = Math.floor((a * (1-modP)) + (b * modP));
        return value;
    },
    toHex : function(c){
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },
    rgbToHex : function(r, g, b){
        //return this.toHex(r);
        return "#" + this.toHex(r) + this.toHex(g) + this.toHex(b);
    }
}

module.exports = Mapper;