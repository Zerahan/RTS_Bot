var CreepPrototype = require('prototype.creep');
var BasicManager = require('manager.basic');
var Mapper = require('planner.mapper');

module.exports.loop = function () {
    for(const k in Memory.creeps){
        if(!Game.creeps[k]){
            delete Memory.creeps[k];
        }
    }
    for(const k in Game.rooms){
        const room = Game.rooms[k];
        BasicManager.init(room);
        BasicManager.run(room);
        //Mapper.reset(room);
        Mapper.init(room);
        Mapper.run(room)
    }
}