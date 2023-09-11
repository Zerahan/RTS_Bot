/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('manager.basic');
 * mod.thing == 'a thing'; // true
 */
var BasicRole = require('role.basic');
 
var BasicManager = {
    run: function(room){
        BasicRole.spawner(room);
        BasicRole.harvester(Game.creeps[Memory.rooms[room.name].managers['basic'].harvester]);
        BasicRole.upgrader(Game.creeps[Memory.rooms[room.name].managers['basic'].upgrader]);
    },
    init: function(room){
        if(!Memory.rooms){
            Memory.rooms = new Object();
        }
        if(!Memory.rooms[room.name]){
            Memory.rooms[room.name] = new Object();
        }
        if(!Memory.rooms[room.name].managers){
            Memory.rooms[room.name].managers = new Object();
        }
        if(!Memory.rooms[room.name].managers['basic']){
            Memory.rooms[room.name].managers['basic'] = new Object();
        }
    }
}

module.exports = BasicManager;