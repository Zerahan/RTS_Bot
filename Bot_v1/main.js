var spawnerHandler = require('handler.spawner');
var GC = require('GarbageCollector');
var roadPlanner = require('planner.road');
var RoomManager = require('manager.room');
var ConstructionPlanner = require('planner.construction');
var DataHandler = require('handler.data');
var MathLib = require('MathLib');
require('prototype.creep');
require('prototype.room');
require('prototype.source');
require('prototype.misc');

//var printObjectMap = true;

module.exports.loop = function () {
    /*/
    if(printObjectMap){
        printObjectMap = false;
        for(var k in Source.prototype){
            console.log(k);
            if(k == 'exports'){
                for( var j in Room[k] ){
                    console.log("   " + j);
                }
            }
        }
    }
    //*/
    /*/
    roles are not assigned to agents, agents are assigned to roles.
    if a role is missing an agent, the role generates a new agent to fill the gap.
    a role needs a "worker in-waiting" id, so it can start spawning a replacement before the worker actually dies.
    each source has a link, a storage, and a nearby turret.
        also has one harvester and one hauler.
    the controller has a tower, a link, and a storage. If the upgrader is idle, it is required to keep the link empty and the turret filled.
    when a new harvester is spawning, the hauler goes to the spawner to help bring them to the source.
    //*/
    var showDebugConsole = false;
    DataHandler.build();
    if(showDebugConsole){
        console.log();
        console.log("====================");
        var rooms = new Array();
        for(var roomID in Game.rooms){
            rooms.push(Game.rooms[roomID].name);
        }
        console.log("Newtick: " + Game.time + " | Available rooms: " + rooms.length + "(" + rooms + ")");
    }
    for(var roomID in Game.rooms){
        RoomManager.run(Game.rooms[roomID]);
    }
    if(Game.rooms["W3N4"]){
        //ConstructionPlanner.run(Game.rooms["W3N4"],0);
    }
    
    /*/
    for(var name in Game.spawns){
        //spawnerHandler.run(Game.spawns[name]);
        //roadPlanner.run(Game.spawns[name].room);
    }
    //*/
    
    GC.run();
}