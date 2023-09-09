var MiscPrototype = require('prototype.misc');
var RoomPrototype = require('prototype.room');
var RoomPositionPrototype = require('prototype.roomposition');
var CreepPrototype = require('prototype.creep');
var SpawnPrototype = require('prototype.structureSpawn');
var BasicRole = require('role.basic');
var ConstructionPlanner = require('planner.construction');
var OutpostManager = require('manager_outpost');

module.exports.loop = function () {
    Game.debugMode = true;
    var showGameTick = false;
    var roomToObserve = "W9N1";
    if(showGameTick){
        var str = "Game tick: " + Game.time;
        var hr = "";
        for(var i = 0; i < str.length; i++){
            hr = hr + "-";
        }
        console.log(hr);
        console.log(str);
    }
    for(const k in Game.rooms){
        const room = Game.rooms[k];
        BasicRole.run(room);
        ConstructionPlanner.run(room);
        const observers = room.find(STRUCTURE_OBSERVER);
        for(const o in observers){
            o.observeRoom(roomToObserve);
        }
        OutpostManager.run(room);
    }
}