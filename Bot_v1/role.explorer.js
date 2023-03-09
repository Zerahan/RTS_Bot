var roleExplorer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.room.name != "W3N3"){
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo("W3N3")));
        }else{
            var sources = creep.room.find(FIND_SOURCES);
            creep.moveTo(25,25);
        }
	}
};

module.exports = roleExplorer;