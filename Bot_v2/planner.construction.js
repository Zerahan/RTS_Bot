var ConstructionPlanner = {
    roadBuilderMk2: function(room){
        if(room.controller == undefined) return;
        if(!room.controller.my) return;
        if(room.memory.roadBuilder == undefined){
            room.memory.roadBuilder = new Object();
            room.memory.roadBuilder.phase = 0;
            room.memory.roadBuilder.hasConstructionSites = false;
        }
        var path = new Array();
        var foundRoad = false;
        var hasAttemptedPhase = false;
        if(room.memory.roadBuilder.startTarget != undefined){
            //console.log("Attempting to build path for phase " + room.memory.roadBuilder.phase);
            room.visual.circle(Game.getObjectById(room.memory.roadBuilder.startTarget).pos, {fill: '#00ff00', radius: 0.5});
            room.visual.circle(Game.getObjectById(room.memory.roadBuilder.endTarget).pos, {fill: '#0000ff', radius: 0.5});
            hasAttemptedPhase = true;
            let path = this.findRoadPath(room, Game.getObjectById(room.memory.roadBuilder.startTarget).pos, Game.getObjectById(room.memory.roadBuilder.endTarget).pos);
            foundRoad = path.length > 0;
            if(!room.memory.roadBuilder.hasConstructionSites && room.memory.roadBuilder.phase == 0){
                room.memory.roadBuilder.endPosition = path[path.length-1];
                room.memory.roadBuilder.startPosition = path[0];
            }
            for(var k in path){
                if(!room.memory.roadBuilder.hasConstructionSites){
                    room.createConstructionSite(path[k].x, path[k].y, STRUCTURE_ROAD);
                }
                room.visual.circle(path[k].x, path[k].y, {fill: '#ff0000'});
            }
            room.memory.roadBuilder.hasConstructionSites = true;
            if(!foundRoad){
                if(room.memory.roadBuilder.endPosition != undefined){
                    room.createConstructionSite(room.memory.roadBuilder.endPosition.x, room.memory.roadBuilder.endPosition.y, STRUCTURE_CONTAINER);
                    delete room.memory.roadBuilder.endPosition;
                }
                if(room.memory.roadBuilder.startPosition != undefined){
                    room.createConstructionSite(room.memory.roadBuilder.startPosition.x, room.memory.roadBuilder.startPosition.y, STRUCTURE_CONTAINER);
                    delete room.memory.roadBuilder.startPosition;
                }
                room.memory.roadBuilder.startTarget = undefined;
                room.memory.roadBuilder.endTarget = undefined;
                room.memory.roadBuilder.hasConstructionSites = false;
            }
        }else{
            if(room.memory.roadBuilder.phase != 2){
                console.log("Roadbuilding discovery: phase " + room.memory.roadBuilder.phase);
            }
            switch(room.memory.roadBuilder.phase){
                case 0:
                    hasAttemptedPhase = true;
                    var sources = room.sources;
                    if(sources.length > 1){
                        sources = room.sortByDistanceTo(sources, room.controller, true);
                    }
                    for(var k in sources){
                        if(foundRoad) break;
                        var source = Game.getObjectById(sources[k]);
                        var path = this.findRoadPath(room, room.controller.pos, source.pos, true);
                        if(path.length > 0){
                            foundRoad = true;
                            //console.log("Found path: " + path.length);
                            room.memory.roadBuilder.startTarget = room.controller.id;
                            room.memory.roadBuilder.endTarget = source.id;
                        }
                    }
                    if(!foundRoad){
                        room.memory.roadBuilder.phase = 1;
                    }
                    break;
                case 1:
                    console.log("Running phase 2");
                    hasAttemptedPhase = true;
                    var sources = room.sources;
                    if(sources.length <= 1){
                        foundRoad = false;
                        hasAttemptedPhase = true;
                        break;
                    }
                    let roads = room.find(FIND_STRUCTURES, {filter: (s)=>(s.structureType == STRUCTURE_ROAD)});
                    roads.push(room.controller);
                    for(var k = 1; k < sources.length; k++){
                        //console.log(k + "----------");
                        if(foundRoad) break;
                        var source = Game.getObjectById(sources[k]);
                        var localSources = room.getSources();
                        localSources = _.filter(localSources, function(s){return s.id != source.id;});
                        var list = new Array();
                        list = list.concat(localSources);
                        var closestRoad = source.pos.findClosestByPath(roads, {ignoreCreeps: true, ignoreRoads: true, plainCost: 2, swampCost: 2});
                        var closestPOI = source.pos.findClosestByPath(list, {ignoreCreeps: true, ignoreRoads: true, plainCost: 2, swampCost: 2});
                        var totalPathForRoad = this.findRoadPath(room, source.pos, closestRoad.pos, false).concat(this.findRoadPath, source.pos, closestPOI.pos, false);
                        var directPath = this.findRoadPath(room, source.pos, closestPOI.pos, false);
                        var closestTarget = (totalPathForRoad < directPath ? closestRoad : closestPOI);
                        //var closestTarget = source.pos.findClosestByPath(list, {ignoreCreeps: true, ignoreRoads: true, plainCost: 2, swampCost: 2});
                        for(var j in list){
                            //var debugPath = source.pos.findPathTo(list[j]);
                            //console.log("List: " + j + " (" + list[j].id + "): " + debugPath.length);
                            room.visual.circle(list[j].pos);
                        }
                        if(!closestTarget){
                            return;
                        }
                        path = this.findRoadPath(room, source.pos, closestTarget.pos);
                        //console.log("Road length for " + room.sources[k] + " is " + path.length);
                        if(path.length > 0){
                            foundRoad = true;
                            room.memory.roadBuilder.startTarget = room.sources[k];
                            room.memory.roadBuilder.endTarget = closestTarget.id;
                            //console.log("--foundRoad: " + foundRoad);
                            break;
                        }
                    }
                    if(!foundRoad){
                        room.memory.roadBuilder.phase = 2;
                    }
                    //console.log("--foundRoad: " + foundRoad);
                    break;
                default:
                    foundRoad = true;
                    break;
            }
        }
        //if(!foundRoad && hasAttemptedPhase) room.memory.roadBuilder.phase = room.memory.roadBuilder.phase+1;
    },
    defenseBuilderMk1: function(room){
        if(room.controller == undefined) return;
        if(!room.controller.my) return;
        if(room.memory.hasDefenses == undefined){
            room.memory.hasDefenses = false;
        }
        if(!room.memory.hasDefenses){
            
        }
    },
    run: function(room){
        this.roadBuilderMk2(room);
        //this.defenseBuilderMk1(room);
        //if(room.memory.roadBuilder != undefined) delete room.memory.roadBuilder;
        /*/
        for(var k in room.sources){
            var source = Game.getObjectById(room.sources[k]);
            var path = this.findRoadPath(room, room.controller.pos, source.pos, false);
            for(var p in path){
                room.visual.circle(path[p].x, path[p].y, {fill: this.debugColors(k)});
            }
        }
        //*/
        //this.roadPlanner(room);
        /*/
        var allTargets = room.find(FIND_STRUCTURES, {filter: (s)=>(s.structureType == STRUCTURE_ROAD)});
        if(allTargets.length > 0){
            for(var k in allTargets){
                allTargets[k].destroy();
                room.visual.circle(allTargets[k].pos.x, allTargets[k].pos.y, {fill:'#ff0000', radius:1});
            }
        }
        allTargets = room.find(FIND_MY_CONSTRUCTION_SITES);
        if(allTargets.length > 0){
            for(var k in allTargets){
                allTargets[k].remove();
                room.visual.circle(allTargets[k].pos.x, allTargets[k].pos.y, {fill:'#ff0000', radius:1});
            }
        }
        return;
        //*/
        return;
        var pointsOfInterest = [room.controller];
        var connectionsPOI = [new Array()];
        var roads = new Array();
        
        var targets = room.getSources();
        for(const k in targets){
            pointsOfInterest.push(targets[k]);
            connectionsPOI.push(new Array());
        }
        pointsOfInterest = this.sortPOI(room, pointsOfInterest);
        var count = 0;
        var roadFound = false;
        for(var k = 0; k < pointsOfInterest.length; k++){
            room.visual.text(k, pointsOfInterest[k].pos, {backgroundPadding: 0.1, backgroundColor: '#000000'});
            for(var j = pointsOfInterest.length; j > k; j--){
                if(roadFound) break;
                var index = j;
                if(j == pointsOfInterest.length){
                    index = 0;
                }
                if(index == k) continue;
                count++;
                var path = this.findRoadPath(room, pointsOfInterest[k].pos, pointsOfInterest[index].pos);
                if(path.length > 0){
                    roads.push(path);
                    roadFound = true;
                    //break;
                }
                if(roadFound){
                    room.visual.line(pointsOfInterest[k].pos.x, pointsOfInterest[k].pos.y, pointsOfInterest[index].pos.x, pointsOfInterest[index].pos.y, {color: this.debugColors(count)});
                }
            }
        }
        if(!roadFound){
            targets = room.find(FIND_MINERALS);
            for(const k in targets){
                pointsOfInterest.push(targets[k]);
                connectionsPOI.push(new Array());
            }
            targets = room.find(FIND_MY_SPAWNS);
            for(const k in targets){
                pointsOfInterest.push(targets[k]);
                connectionsPOI.push(new Array());
            }
            pointsOfInterest = this.sortPOI(room, pointsOfInterest);
            count = 0;
            roadFound = false;
            for(var k = 0; k < pointsOfInterest.length; k++){
                room.visual.text(k, pointsOfInterest[k].pos, {backgroundPadding: 0.1, backgroundColor: '#000000'});
                //room.visual.text(k, pointsOfInterest[k].pos);
                for(var j = pointsOfInterest.length; j > k; j--){
                    if(roadFound) break;
                    var index = j;
                    if(j == pointsOfInterest.length){
                        index = 0;
                    }
                    if(index == k) continue;
                    count++;
                    var path = this.findRoadPath(room, pointsOfInterest[k].pos, pointsOfInterest[index].pos);
                    if(path.length > 0){
                        roads.push(path);
                        roadFound = true;
                        //break;
                    }
                    if(roadFound){
                        room.visual.line(pointsOfInterest[k].pos.x, pointsOfInterest[k].pos.y, pointsOfInterest[index].pos.x, pointsOfInterest[index].pos.y, {color: this.debugColors(count)});
                    }
                }
            }
        }
        if(!roadFound){
            room.visual.circle(25,25,{color:'#ff0000', radius: 1});
        }
        for(const k in roads){
            for(const p in roads[k]){
                //room.createConstructionSite(roads[k][p].x, roads[k][p].y, STRUCTURE_ROAD);
                //room.visual.text(k + '', roads[k][p].x, roads[k][p].y);
                room.visual.circle(roads[k][p].x, roads[k][p].y, {fill:this.debugColors(k)});
            }
        }
    },
    roadPlanner: function(room){
        console.log("Tiles: ");
        var poiList = [room.controller];
        poiList = poiList.concat(room.getSources());
        poiList = this.sortPOI(room, poiList);
        var roads = new Array();
        for(let k = 0; k < poiList.length; k++){
            for(let j = k; j < poiList.length; j++){
                if(j==k) continue;
                var path = this.findRoadPath(room, poiList[k].pos, poiList[j].pos, true);
                if(path.length > 0){
                    roads.push(path);
                }
            }
        }
        var minerals = room.find(FIND_MINERALS);
        var furthestPOIs = poiList;
        for(var k in minerals){
            var path = this.findRoadPath(room, minerals[k].pos, room.controller.pos, true);
            if(path.length > 0){
                roads.push(path);
            }
            furthestPOIs.sort((a,b)=>(minerals[k].pos.getRangeTo(a.pos) < minerals[k].pos.getRangeTo(b.pos)));
            path = this.findRoadPath(room, minerals[k].pos, furthestPOIs[0], true);
            if(path.length > 0){
                roads.push(path);
            }
        }
        poiList = poiList.concat(room.find(FIND_MINERALS));
        for(var k in poiList){
            //console.log(poiList[k].pos);
            var exposedTiles = poiList[k].pos.getNeighbors(true);
            var roadTiles = new Array();
            roadTiles = roadTiles.concat(exposedTiles);
            if(false){
                for(var j in exposedTiles){
                    roadTiles = roadTiles.concat(exposedTiles[j].getNeighbors(false));
                }
            }
            roads.push(roadTiles);
        }
        //var roadPlannerList = this.roadPlanner(room);
        var count = 0;
        for(var k in roads){
            for(var i = 0; i < roads[k].length; i++){
                if(i < roads[k].length - 1){
                    room.visual.line(roads[k][i].x,roads[k][i].y,roads[k][i+1].x,roads[k][i+1].y,{color:this.debugColors(count)});
                }
                room.createConstructionSite(roads[k][i].x, roads[k][i].y, STRUCTURE_ROAD);
                room.visual.circle(roads[k][i].x,roads[k][i].y,{fill:this.debugColors(count)});
            }
            count++;
        }
    },
    debugColors: function(i){
        if(isNaN(i)) return '#000000';
        var colors = [
            '#ff0000', // red
            '#ffa500', // orange
            '#ffff00', // yellow
            '#32cd32', // lime green
            '#00ff00', // green
            '#00ffff', // cyan
            '#add8e6', // light blue
            '#0000ff', // blue
            '#ff00ff', // magenta
            '#a020f0', // purple
            '#ffc0cb', // pink
            '#ffffff', // white
            '#ffffff', // light gray
            '#d3d3d3', // gray
            '#5a5a5a', // dark gray
            '#000000' // black
        ];
        if(i >= colors.length) return '#000000';
        return colors[i];
    },
    findRoadPath: function(room, posA, posB, bRemoveOnRoads){
        bRemoveOnRoads = (bRemoveOnRoads != undefined ? bRemoveOnRoads : true);
        var path = posA.findPathTo(posB, {ignoreCreeps: true, ignoreRoads: true, swampCost: 2, plainCost: 2});
        var filteredPath = new Array();
        for(var k in path){
            var tiles = room.lookAt(path[k].x, path[k].y);
            tiles = _.filter(tiles,(t)=>((t.type == "terrain" && t.terrain == "wall") || (bRemoveOnRoads && t.type == "structure" && t.structure.structureType == STRUCTURE_ROAD)));
            //tiles = _.filter(tiles, function(t) {return t.terrain === 'swamp'}); // (tile.terrain != undefined && tile.terrain != 'wall') && (tile.structure != undefined && tile.structure.structureType != STRUCTURE_ROAD);});
            if(tiles.length == 0){
                filteredPath.push(path[k]);
            }else{
                //room.visual.circle(path[k].x, path[k].y);
            }
        }
        return filteredPath;
    },
    getNeighbors: function(room, pos, range = 1){
        var tileRange = range;
        var neighbors = new Array();
        for(var y = 0-tileRange; y < tileRange+1; y++){
            for(var x = 0-tileRange; x < tileRange+1; x++){
                if(x == 0 && y == 0) continue;
                if(pos.x+x < 0 || pos.x+x > 49 || pos.y+y < 0 || pos.y+y > 49) continue;
                var tiles = room.lookAt(pos.x+x, pos.y+y);
                //tiles = _.filter(tiles,(t)=>((t.type == "terrain" && t.terrain == "wall") || (t.type == "structure" && t.structure.structureType == STRUCTURE_ROAD)));
                //tiles = _.filter(tiles, function(t) {return t.terrain === 'swamp'}); // (tile.terrain != undefined && tile.terrain != 'wall') && (tile.structure != undefined && tile.structure.structureType != STRUCTURE_ROAD);});
                //if(tiles.length == 0){
                    neighbors.push({x: pos.x+x, y: pos.y+y});
                //}
            }
        }
        return neighbors;
    },
    sortPOI: function(room, list){
        var sortedList = new Array();
        var count = 0;
        sortedList.push(list[0]);
        list.splice(0,1);
        while(list.length > 0){
            //console.log("Count: " + count + ": " + list.length);
            if(list.length > 1){
                var closest = sortedList[count].pos.findClosestByRange(list,{ignoreCreeps: true, ignoreRoads: false, plainCost: 2, swampCost: 2});
                sortedList.push(closest);
                var index = list.indexOf(closest);
                if(index > -1){
                    list.splice(index,1);
                }
            }else{
                sortedList.push(list[0]);
                list.pop();
            }
            count++;
        }
        return sortedList;
    },
    buildConnections: function(room, list, id){
        if(list == undefined) return new Array();
        if(list.length == 0) return new Array();
        if(!global.rooms){
            global.rooms = new Object();
        }
        if(!global.rooms[room.name]){
            global.rooms[room.name] = new Object();
        }
        if(!global.rooms[room.name].connections){
            global.rooms[room.name].connections = new Object();
        }
        if(!global.rooms[room.name].connections[id]){
            global.rooms[room.name].connections[id] = new Array();
            var sortedList = this.sortPOI(room, list);
            var connections = new Array();
            for(var k = 0; k < sortedList.length; k++){
                if(k == sortedList.length-1){
                    connections.push([sortedList[k], sortedList[0]]);
                }else{
                    connections.push([sortedList[k], sortedList[k+1]]);
                }
            }
            global.rooms[room.name].connections[id] = connections;
        }
        return global.rooms[room.name].connections[id];
    },
    rgbToHex: function(r,g,b){
         return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
}

module.exports = ConstructionPlanner;