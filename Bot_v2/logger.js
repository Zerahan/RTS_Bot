/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('logger');
 * mod.thing == 'a thing'; // true
 */

var Logger = {
    log: function(message){
        if(Game.debugMode){
            console.log("Log: " + message);
        }
    }
}

module.exports = Logger;