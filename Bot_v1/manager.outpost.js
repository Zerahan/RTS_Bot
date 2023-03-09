var OutpostManager = {
    run: function(room){
        //delete Memory.rooms[room.name].outposts;
        if(!room.controller) return;
        if(!Memory.rooms[room.name].outposts){
            Memory.rooms[room.name].outposts = new Object();
            Memory.rooms[room.name].outposts.controller = {
                center: room.controller.id,
                outpostType: "control",
                agents: {
                    upgrader: new Array(),
                    transporter: new Array(),
                },
                maxAgents: {
                    upgrader: 1,
                    transporter: 1,
                },
                structures: new Object(),
            }
            if(!Memory.rooms[room.name].outposts['source0']){
                for(const k in room.sources){
                    const source = room.sources[k];
                    if(!Memory.rooms[room.name].outposts['source'+k]){
                        Memory.rooms[room.name].outposts['source'+k] = {
                            center: source.id,
                            outpostType: "source",
                            agents: {
                                harvester: new Array(),
                                transporter: new Array(),
                            },
                            maxAgents: {
                                harvester: 1,
                                transporter: 1,
                            },
                            structures: new Object(),
                        }
                    }
                }
            }
        }
        for(const k in Memory.rooms[room.name].outposts){
            var outpost = Memory.rooms[room.name].outposts[k];
            room.visual.text(outpost.outpostType, Game.getObjectById(outpost.center).pos);
            switch(outpost.outpostType){
                case "control":
                    break;
                case "source":
                    //delete outpost.structures[STRUCTURE_CONTAINER];
                    if(outpost.structures[STRUCTURE_CONTAINER] == undefined){
                        outpost.structures[STRUCTURE_CONTAINER] = new Array();
                    }
                    if(outpost.structures[STRUCTURE_CONTAINER].length == 0){
                        let source = Game.getObjectById(outpost.center);
                        let closest = source.closestNeighborByPath;
                        let lookTargets = room.lookAt(closest);
                        lookTargets = _.filter(lookTargets, (target)=>(target.type == 'structure' && target.structure.structureType == STRUCTURE_CONTAINER));
                        //console.log("-----");
                        for(const b in lookTargets){
                            console.log(lookTargets[b].type);
                        }
                        if(lookTargets.length == 0){
                            room.createConstructionSite(closest, STRUCTURE_CONTAINER);
                        }else{
                            outpost.structures[STRUCTURE_CONTAINER][0] = lookTargets[0].structure.id;
                        }
                        room.visual.circle(closest,{radius:0.5, fill:'#ff0000'});
                    }
                    break;
            }
            
        }
    },
};

module.exports = OutpostManager;