/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('MathLib');
 * mod.thing == 'a thing'; // true
 */
Math.randRange = function(a,b){
    if(isNaN(a) || (isNaN(b) && b != undefined)) return -1;
    var rand = Math.random();
    if(b == undefined){
        return Math.round(rand * a);
    }else{
        return Math.round(rand * (b-a) + a);
    }
}
Math.distance = function(posA,posB){
    if(posA == undefined || posB == undefined) return undefined;
    //if(posA.type != RoomPosition || posB.type != RoomPosition) return -1;
    var a = posA.x - posB.x;
    var b = posA.y - posB.y;
    return Math.sqrt(a*a+b*b);
}
var Vector = {
    x: 0,
    y: 0,
}

module.exports = {
};