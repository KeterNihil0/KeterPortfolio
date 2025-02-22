import { system as s, world as w, ItemStack, EntityComponentTypes} from "@minecraft/server";
//import { Vector3Utils } from "@minecraft/math";

let wires = []
let players_with_wiringkit = [];
let players_without_wiringkit = [];

s.runInterval(()=>{
    players_with_wiringkit = [];
    players_without_wiringkit = [];

    //if(wires.length>0) {
        wiresUpdate();
    //}
},2)

w.afterEvents.entitySpawn.subscribe((data) => {
})

w.beforeEvents.itemUseOn.subscribe((data) => {
    if (data.itemStack.typeId == "et:tool_wiring_kit" && data.block.matches("minecraft:iron_block") && data.isFirstEvent) {
        {
            s.run(() => {
                data.source.runCommand(`say ${data.itemStack.getDynamicProperty("wiring_ready")}`);
                wiringCommand(data.itemStack, data.block, data.source, data.itemStack.getDynamicProperty("wiring_ready"));
        })}
    }
})


function wiringCommand(itemStack, block, player, wiringState) {
    
    const item = player.getComponent("inventory").container.getSlot(player.selectedSlotIndex);
    if(wiringState == 1){
        item.setDynamicProperty("wiring_ready", 0);
        wires = [];
        player.runCommand(`say wire placed?`);
        //player.getComponent("inventory").container.setSlot(player.selectedSlotIndex);
        return;
    } else {
        item.setDynamicProperty("wiring_ready", 1);
        player.runCommand(`say wire start?`);
        const wire = player.dimension.spawnEntity("et:fx_wire_se", block.location);
        wire.setDynamicProperty("wire_controlling_player", player.id);

        wireSpawned(wire, vector3Add(block.location, {x:0.5,y:0.5,z:0.5}), 
            block.location, player);
        //player.getComponent("inventory").container.setSlot(player.selectedSlotIndex)
        return;
    }
}


function wireSpawned(wire, p1, p2, player) {
    wires.push({wireId:wire, pos1:p1, pos2:p2, player:player});
    
    wire.setDynamicProperty("wire_p1", player.getBlockFromViewDirection().block.location)

    wire.setDynamicProperty("wire_p2", player.getBlockFromViewDirection().block.location)

    wire.setProperty("et:wire_length", vector3Dist(p1, p2));
    wire.tryTeleport(vector3Mid(p1, p2));
}

function wiresUpdate() {
    for (const wire0 of w.getDimension("overworld").getEntities()) {
        if (wire0.getComponent(EntityComponentTypes.TypeFamily)) {
            if (wire0.getComponent(EntityComponentTypes.TypeFamily).hasTypeFamily("et:wire")) {

                //if (!wire0.isValid()) {wires.splice(wire,1); return;}
                
                let controllingPlayer;
                for (const player of wire0.dimension.getEntities()) {
                    if (player.getComponent(EntityComponentTypes.TypeFamily)) {
                        if (player.getComponent(EntityComponentTypes.TypeFamily).hasTypeFamily("player")) {
                            if (player.getComponent("inventory").container.getSlot(player.selectedSlotIndex).getItem() !== undefined) {
                                players_with_wiringkit.push(player.name);
                                if (player.id == wire0.getDynamicProperty("wire_controlling_player")) {
                                    controllingPlayer = player;
                                    //player.runCommand(`say i am da captin now`)
                                }
                            } else {
                                players_without_wiringkit.push(player);
                            }
                        }
                    }
                }

                if (players_with_wiringkit.length > 0) {
                    wire0.playAnimation("animation.wire.visible", {
                        players:players_with_wiringkit
                    });
                }  
                if (players_without_wiringkit > 0) {
                    wire0.playAnimation("animation.wire.invis", {
                        players:players_with_wiringkit
                    });
                }
            
                let wireP1 = vector3Add(wire0.getDynamicProperty("wire_p1"),{x:0.5,y:0.5,z:0.5});
                let wireP2 = wire0.getDynamicProperty("wire_p2");
                let player = controllingPlayer;

                if (player == undefined) { return;}
            
                let wireTarget;

                if(player.getBlockFromViewDirection() && vector3Dist(wireP1, player.getBlockFromViewDirection().block.location) < 6) {
                    wireTarget = vector3Add(player.getBlockFromViewDirection().block.location,{x:0.5,y:0.5,z:0.5});
                    wire0.setDynamicProperty("wire_p2", wireTarget);
                } else {
                    wireTarget = wire0.getDynamicProperty("wire_p2");
                    return;
                }
            
                if (player.getBlockFromViewDirection().block.matches("minecraft:iron_block")) {
                    wire0.setProperty("et:wire_valid", true)
                } else {
                    wire0.setProperty("et:wire_valid", false)
                }
            
                wire0.tryTeleport(vector3Mid(wireP1, wireTarget), {facingLocation:wireTarget});
            
                wire0.setProperty("et:wire_length", vector3Dist(wireP1, wireTarget))
                wire0.setProperty("et:wire_rot_y", angleBetweenPoints(true, wireP1, wireTarget))

                wire0.runCommand(`say ${wire0.getProperty("et:wire_length")}`)
            }
        }
    }
}



function vector3Add(p1, p2) {
    let x = p1.x+p2.x;
    let y = p1.y+p2.y;
    let z = p1.z+p2.z;

    return {x:x, y:y, z:z}
}

function vector3Mid(p1, p2) {
    let x = (p1.x+p2.x)/2;
    let y = (p1.y+p2.y)/2;
    let z = (p1.z+p2.z)/2;

    return {x:x, y:y, z:z};
}

function vector3Dist(p1, p2) {
    let dx = Math.abs(p1.x - p2.x);
    let dy = Math.abs(p1.y - p2.y);
    let dz = Math.abs(p1.z - p2.z);

    return Math.sqrt((dx*dx)+(dy*dy)+(dz*dz))
}

function angleBetweenPoints(mode, p1, p2) {
    let dx = p2.x-p1.x;
    let dy = p2.y-p1.y;
    let dz = p2.z-p1.z;
    let horizDist = Math.sqrt((dx*dx)+(dz*dz));
    
    let yaw = Math.floor(Math.atan2(dz, dx)*(180/Math.PI) + 180);
    let pitch = Math.floor(Math.atan2(horizDist, dy)*(180/Math.PI) + 180);

    let returnVal;

    if(mode) {returnVal = pitch}
    else{returnVal = yaw}

    return returnVal;
}