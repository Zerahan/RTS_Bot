var LinkHandler = {
    run: function(room){
        var links = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_LINK);
            }
        });
        for(var id in links){
            var thisLink = links[id];
            if(thisLink.role == 'unknown'){
                var closeToSource = false;
                for(const k in room.sources){
                    var source = room.sources[k].get();
                    if(thisLink.pos.getRangeTo(source) < 4){
                        closeToSource = true;
                    }
                }
                thisLink.role = (closeToSource ? 'distributer' : 'collector');
            }
        }
        var distributers = _.filter(links, (link)=>(link.role == 'distributer' && link.store.getUsedCapacity(RESOURCE_ENERGY) > 100));
        var collectors = _.filter(links, (link)=>(link.role == 'collector' && link.store.getFreeCapacity(RESOURCE_ENERGY) > 100));
        //console.log("Distributers: " + distributers.length + " | Collectors: " + collectors.length);
        var num = 0;
        for(const id in distributers){
            var thisLink = distributers[id];
            if(collectors.length > num){
                thisLink.transferEnergy(collectors[num]);
                num++;
            }
        }
    }
};
module.exports = LinkHandler;