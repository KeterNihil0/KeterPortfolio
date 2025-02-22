import { Entity, system as s, ItemStack, GameMode, Player, world as w, EntityComponentTypes as EntityCT, ItemComponentTypes as ItemCT, BlockInventoryComponent, EquipmentSlot, ItemDurabilityComponent } from "@minecraft/server";

w.afterEvents.playerPlaceBlock.subscribe((data) => {
    if (data.block.matches("km:wire")) {
      s.run(() => { wirePlaced(data.block);});
    };
    
    s.run(() => { machinePlaced(data.block);});
})

let networkEntities = []

s.runInterval(() => {

    conveyorScript();

    entityBlockLinkage();
    
    turbineTick();
    eFurnaceTick();
    itemTransportTick();

    updateSource();

    wireTick();
}, 1)



w.afterEvents.itemUse.subscribe((data) => {
    if (data.source.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Mainhand)?.getItem() &&
        data.source.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Offhand)?.getItem()) {
        if (data.source.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Offhand)?.getItem().typeId == "km:tool_hammer")
        s.run(() => {recipeHammer(data.source, 
            data.source.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Mainhand),
            data.source.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Offhand)?.getItem());
        });

        if (data.source.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Offhand)?.getItem().typeId == "km:tool_cutters") {
        s.run(() => {recipeCutters(data.source, 
            data.source.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Mainhand),
            data.source.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Offhand)?.getItem());
        });
    }
}
})

w.beforeEvents.playerInteractWithBlock.subscribe((data) => {
    if (data.isFirstEvent) {   
        if((data.itemStack === undefined) && !data.player.isSneaking) {
            if ((data.block.matches("km:machine_efurnace"))) {
                s.run(() => {efurnaceFunction(data.player, data.itemStack, data.block)});
                data.cancel = true;
            }
        } else {
            if ((data.itemStack.typeId == "km:debug_tool")) {
                s.run(() => {debug(data.block, data.player);})
                data.cancel = true;
            }
            if ((data.itemStack.typeId == "km:tool_wrench" && data.block.matches("km:conveyor"))) {
                s.run(() => {conveyorInteract(data.block, data.player);})
                data.cancel = true;
            }
            if ((data.block.matches("km:machine_efurnace"))&& !data.player.isSneaking) {
                s.run(() => {efurnaceFunction(data.player, data.itemStack, data.block)});
                data.cancel = true;
            }
        }
    }
})

function wirePlaced(block) {
    let x = block.location.x+0.5;
    let z = block.location.z+0.5;
    let y = block.location.y;
    let entity = block.dimension.spawnEntity("km:wire_se", {x:x, y:y, z:z });
    networkEntities.push(entity);
    assignwireLayout()
    netUpdate();
}

function machinePlaced(block) {

    let entityToSpawn = "null"
    let runFlood = false;

    switch(block.typeId) {
        case "km:conveyor":
            entityToSpawn = "km:conveyor_se";
            break;
        case "km:machine_turbine":
            entityToSpawn = "km:turbine_se";
            runFlood = true;
            break;
        case "km:machine_efurnace":
            entityToSpawn = "km:efurnace_se";
            break;
        case "km:machine_crusher":
            entityToSpawn = "km:crusher_se";
            break;
        case "km:machine_item_transporter":
            entityToSpawn = "km:item_transporter_se";
            break;
    }

    
    if (entityToSpawn != "null") {

        block.setPermutation(block.permutation.withState("km:placed", true));
        let x = block.location.x+0.5;
        let z = block.location.z+0.5;
        let y = block.location.y;
        let entity = block.dimension.spawnEntity(entityToSpawn, {x:x, y:y, z:z });
        entity.setDynamicProperty("km:eu", 0);

        
        
        if(runFlood) {
            entity.setDynamicProperty("km:original_netId", Math.floor(Math.random()*10000)+Math.floor(Math.random()*100));
            entity.setDynamicProperty("km:netId", entity.getDynamicProperty("km:original_netId"));
            resetFlood(true);
            flood(block.location, true, entity.getDynamicProperty("km:netId"));
        }
        
        assignwireLayout();
        netUpdate()
    }
}

function conveyorScript() {
    for (const e of w.getDimension("overworld").getEntities()) {
        if((e.location.y > -64)&&(e.location.y < 128)) {
            if(e.dimension.getBlock(e.location)) {
                if(e.dimension.getBlock(e.location).matches("km:conveyor")){

                    const sloped = e.dimension.getBlockBelow(e.location).permutation.getState("km:sloped");
                    const dir = e.dimension.getBlockBelow(e.location).permutation.getState("minecraft:cardinal_direction");
                    const scale = 0.05
                    const entityScale = 0.4
                    const itemScale = 0.8;
                    let v3;
                    switch (dir) {
                        case 'west':
                            v3 = {x:1*scale,y:0,z:0};
                        break;
                        case 'east':
                            v3 = {x:-1*scale,y:0,z:0};
                            break;
                        case 'north':
                            v3 = {x:0,y:0,z:1*scale};
                        break;
                        case 'south':
                            v3 = {x:0,y:0,z:-1*scale};
                        break;
                    }

                    if (sloped) {
                        v3.y = 0.15
                    } else {
                        v3.y = 0;
                    }
                    let tpX = e.location.x+v3.x*itemScale;
                    let tpZ = e.location.z+v3.z*itemScale;
                    let tpY = e.location.y+v3.y*itemScale;
                
                    let tpV3 = {x:tpX,y:tpY,z:tpZ};
                

                    if(e.getComponent(EntityCT.Item)) {
                        if(v3.x === 0) {
                            e.tryTeleport({x:Math.floor(e.location.x)+0.5, y:tpV3.y, z:tpV3.z}, {keepVelocity:false})
                            e.applyImpulse({x:0, y:v3.y, z:v3.z})
                        }
                        if(v3.z === 0) {
                            e.tryTeleport({x:tpV3.x, y:tpV3.y, z:Math.floor(e.location.z)+0.5}, {keepVelocity:false})
                            e.applyImpulse({x:v3.x, y:v3.y, z:0})
                        }
                    } else {
                        if(!e.isSneaking) {
                            e.applyKnockback(v3.x,v3.z,entityScale,v3.y*1.4)
                        }
                    }
                }
            }
        }
    }
}

function assignwireLayout() {
    for (const e of w.getDimension("overworld").getEntities()) {
        if (e.getComponent(EntityCT.TypeFamily)) {
            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_wire")) {
    
            e.setProperty("km:u",false);
            e.setProperty("km:d",false);
            e.setProperty("km:n",false);
            e.setProperty("km:s",false);
            e.setProperty("km:e",false);
            e.setProperty("km:w",false);

            e.setProperty("km:eu",0);
    
            let p = e.location;
            let c = 0;
            let s = 0;
    
            for (const n of w.getDimension("overworld").getEntities({location:p, maxDistance:1})) {
                if (n.getComponent(EntityCT.TypeFamily)) {
                    let nf = n.getComponent(EntityCT.TypeFamily);
                    if (nf.hasTypeFamily("km_wire")) {
                            let np = n.location;
                            let offset = {x:np.x-0.5,y:np.y,z:np.z-0.5}

                            let block = w.getDimension("overworld").getBlock(offset);
                            {
                                if((np.y) == (p.y + 1) && (nf.hasTypeFamily("km:u") || block.hasTag("km_d"))) {e.setProperty("km:u",true); c++;};
                                if((np.y) == (p.y - 1) && (nf.hasTypeFamily("km:d") || block.hasTag("km_u"))) {e.setProperty("km:d",true); c++;};
                                if((np.z) == (p.z + 1) && (nf.hasTypeFamily("km:n") || block.hasTag("km_n"))) {e.setProperty("km:n",true); c++;};
                                if((np.z) == (p.z - 1) && (nf.hasTypeFamily("km:s") || block.hasTag("km_s"))) {e.setProperty("km:s",true); c++;};
                                if((np.x) == (p.x + 1) && (nf.hasTypeFamily("km:e") || block.hasTag("km_w"))) {e.setProperty("km:e",true); c++;};
                                if((np.x) == (p.x - 1) && (nf.hasTypeFamily("km:w") || block.hasTag("km_e"))) {e.setProperty("km:w",true); c++;};
                                if(c>0){e.setProperty("km:connections",true);}
                            }
                        }
                        if (nf.hasTypeFamily("km_machine") && !nf.hasTypeFamily("km_wire")) {
                            let np = n.location;
                            let offset = {x:np.x-0.5,y:np.y,z:np.z-0.5}

                            let block = w.getDimension("overworld").getBlock(offset);
                            {
                                if((np.y) == (p.y + 1) && (nf.hasTypeFamily("km:u") || block.hasTag("km_d"))) {e.setProperty("km:u",true); c++;};
                                if((np.y) == (p.y - 1) && (nf.hasTypeFamily("km:d") || block.hasTag("km_u"))) {e.setProperty("km:d",true); c++;};
                                if((np.z) == (p.z + 1) && (nf.hasTypeFamily("km:n") || block.hasTag("km_n"))) {e.setProperty("km:n",true); c++;};
                                if((np.z) == (p.z - 1) && (nf.hasTypeFamily("km:s") || block.hasTag("km_s"))) {e.setProperty("km:s",true); c++;};
                                if((np.x) == (p.x + 1) && (nf.hasTypeFamily("km:e") || block.hasTag("km_w"))) {e.setProperty("km:e",true); c++;};
                                if((np.x) == (p.x - 1) && (nf.hasTypeFamily("km:w") || block.hasTag("km_e"))) {e.setProperty("km:w",true); c++;};
                                if(c>1){e.setProperty("km:connections",true);}

                                
                            }
                        }
                    }
                }
            }
        }
    }
}


function entityBlockLinkage() {
    for (const e of w.getDimension("overworld").getEntities()) {
        if (e.getComponent(EntityCT.TypeFamily)) {
            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_machine")) {
                let p = e.location;
                let block = e.dimension.getBlock(p)
                
                if(e.getDynamicProperty("REMOVE") == true) {
                    e.kill();
                    e.teleport({x:0, y:-128, z:0})
                    e.remove();
                    netUpdate();
                    break;
                }
                
                if ((block?.isValid() === true || block?.matches("minecraft:air"))&& !block?.hasTag("km_machine")) {
                    
                    e.setDynamicProperty("REMOVE", true);
                    assignwireLayout();
                    break;
                }
            }
        }
    }
}

function updateSource() {

    //resetFlood(true);
    
    for (const e of w.getDimension("overworld").getEntities()) {
        if (e.getComponent(EntityCT.TypeFamily)) {

            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_efurnace")) {
                let xOff = e.location.x-0.5;
                let yOff = e.location.y;
                let zOff = e.location.z-0.5;
                let coordsOff = {x:xOff, y:yOff, z:zOff};

                let block = w.getDimension("overworld").getBlock(coordsOff)

                if(!block.matches("minecraft:air")) {
                
                    let rot;
                    switch(block.permutation.getState("minecraft:cardinal_direction")) {
                        case 'north':
                            rot = 2;
                        break;
                        case 'west':
                            rot = 1;
                        break;
                        case 'south':
                            rot = 0;
                        break;
                        case 'east':
                            rot = 3;
                        break;
                        default:
                            rot = 0
                        break;
                    }
                    
                    e.setProperty("km:dir", rot)
                }
            }

            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_crusher")) {
                let xOff = e.location.x-0.5;
                let yOff = e.location.y;
                let zOff = e.location.z-0.5;
                let coordsOff = {x:xOff, y:yOff, z:zOff};

                let block = w.getDimension("overworld").getBlock(coordsOff)

                if(!block.matches("minecraft:air")) {
                
                    let rot;
                    switch(block.permutation.getState("minecraft:cardinal_direction")) {
                        case 'north':
                            rot = 2;
                        break;
                        case 'west':
                            rot = 1;
                        break;
                        case 'south':
                            rot = 0;
                        break;
                        case 'east':
                            rot = 3;
                        break;
                        default:
                            rot = 0
                        break;
                    }
                    
                    e.setProperty("km:dir", rot)
                }
            }

            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_conveyor")) {
                let xOff = e.location.x-0.5;
                let yOff = e.location.y;
                let zOff = e.location.z-0.5;
                let coordsOff = {x:xOff, y:yOff, z:zOff};

                let block = w.getDimension("overworld").getBlock(coordsOff)

                if(!block.matches("minecraft:air")) {
                
                    let rot;
                    switch(block.permutation.getState("minecraft:cardinal_direction")) {
                        case 'north':
                            rot = 2;
                        break;
                        case 'west':
                            rot = 1;
                        break;
                        case 'south':
                            rot = 0;
                        break;
                        case 'east':
                            rot = 3;
                        break;
                        default:
                            rot = 0
                        break;
                    }
                    
                    e.setProperty("km:sloped", e.dimension.getBlock(e.location).permutation.getState("km:sloped"));
                    e.setProperty("km:dir", rot)
                }
            }

            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_item_transporter")) {
                let xOff = e.location.x-0.5;
                let yOff = e.location.y;
                let zOff = e.location.z-0.5;
                let coordsOff = {x:xOff, y:yOff, z:zOff};

                let block = w.getDimension("overworld").getBlock(coordsOff)

                if(!block.matches("minecraft:air")) {
                
                    let rot;
                    let updown;
                    switch(block.permutation.getState("minecraft:facing_direction")) {
                        case 'south':
                            rot = 0;
                            updown = 0;
                        break;
                        case 'west':
                            rot = 1;
                            updown = 0;
                        break;
                        case 'north':
                            rot = 2;
                            updown = 0;
                        break;
                        case 'east':
                            rot = 3;
                            updown = 0;
                        break;
                        case 'up':
                            rot = 2;
                            updown = 1;
                        break;
                        case 'down':
                            rot = 2;
                            updown = 3;
                        break;
                        default:
                            rot = 2
                            updown = 0;
                        break;
                    }
                    
                    e.setProperty("km:dir", rot)
                    e.setProperty("km:updown", updown)
                }
            }
        }
    }
}

function netUpdate() {
    resetFlood(true);
    for (const e of w.getDimension("overworld").getEntities()) {
        if (e.getComponent(EntityCT.TypeFamily)) {
            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_turbine")) {
                if (e.getDynamicProperty("km:flooded") == false || e.getDynamicProperty("km:flooded") === undefined) {
                    let block = e.dimension.getBlock(e.location);
                    flood(block.location, e, e.getDynamicProperty("km:original_netId"))
                }
            }
        }
    }
}

function flood(coords, originator, netId) {
    if (!w.getDimension("overworld").getBlock(coords).hasTag("km_machine") && !originator) {
        return;
    }

    if(w.getDimension("overworld").getBlock(coords).matches("km:wire")) {

        let xOff = coords.x+0.5;
        let yOff = coords.y;
        let zOff = coords.z+0.5;
        let coordsOff = {x:xOff, y:yOff, z:zOff};
        let entity = w.getDimension("overworld").getEntities({location:coordsOff, maxDistance:0.2});
        if (entity.length>0) {
            entity = entity[0]
        }
        for (const e of w.getDimension("overworld").getEntities({location:coordsOff, maxDistance:0.9})) {
            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("player")) {
                e.runCommandAsync(`camerashake add @s 0.2 0.1`)
                e.runCommandAsync(`camerashake add @s 0.00001 0.1 rotational`)
                e.applyDamage(2);
                e.runCommandAsync(`playsound "entity.shocked" @s ~~~ 1 ${(Math.random()+1)/2}`);

                for (let i = 0; i < 1; i++) {
                    e.runCommandAsync(`particle "minecraft:electric_spark_particle" ~${((Math.random()-0.5)*2)} ~${((Math.random()-0.5)*2)+1} ~${((Math.random()-0.5)*2)}`);
                }
            }  
        }
    }

    let block = w.getDimension("overworld").getBlock(coords);

    //if ((block.permutation.getState("km:flooded") == true &&
    //    !originator)) {
    //    return;
    //}

    if (getTileEntity("overworld", coords).getDynamicProperty("km:flooded") == true) {return;}

    if(originator) {
        let worldNetId = "km:network_"+String(netId);
        w.setDynamicProperty(worldNetId, 0);
    }

    let newNetId = netId;

    getTileEntity("overworld",coords).setDynamicProperty("km:netId", newNetId);
    getTileEntity("overworld",coords).setDynamicProperty("km:flooded", true);
    block.setPermutation(block.permutation.withState("km:flooded", true));

    let x = block.location.x;
    let y = block.location.y;
    let z = block.location.z;

    //if(w.getDimension("overworld").getBlock(coords).hasTag("km_machine")) { block.setType("minecraft:gold_block"); }
    //console.log(coords)
    if(w.getDimension("overworld").getBlock({x:x+1,y:y,z:z}).hasTag("km_w")) { flood({x:x+1,y:y,z:z}, false, newNetId); }
    if(w.getDimension("overworld").getBlock({x:x-1,y:y,z:z}).hasTag("km_e")) { flood({x:x-1,y:y,z:z}, false, newNetId); }
    if(w.getDimension("overworld").getBlock({x:x,y:y,z:z+1}).hasTag("km_n")) { flood({x:x,y:y,z:z+1}, false, newNetId); }
    if(w.getDimension("overworld").getBlock({x:x,y:y,z:z-1}).hasTag("km_s")) { flood({x:x,y:y,z:z-1}, false, newNetId); }
    if(w.getDimension("overworld").getBlock({x:x,y:y+1,z:z}).hasTag("km_u")) { flood({x:x,y:y+1,z:z}, false, newNetId); }
    if(w.getDimension("overworld").getBlock({x:x,y:y-1,z:z}).hasTag("km_d")) { flood({x:x,y:y-1,z:z}, false, newNetId); }
}

function resetFlood(full) {
    w.clearDynamicProperties();
    for (const e of w.getDimension("overworld").getEntities()) {
        if (e.getComponent(EntityCT.TypeFamily)) {
            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_wire") || (full && e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_machine"))) {
                let block = w.getDimension("overworld").getBlock(e.location)
                if(!block.matches("minecraft:air")) {
                    //block.setPermutation(block.permutation.withState("km:flooded", false));
                    e.setDynamicProperty("km:flooded", false);
                    e.setDynamicProperty("km:netId", undefined);
                }
            }
        }
    }
}


function recipeHammer(player, stack, tool) {
    let product = 'null';
    let productAmount = 0;
    switch(stack.typeId) {
        case 'minecraft:iron_ingot':
            product = 'km:plate_iron';
            productAmount = 1;
            break;
        case 'minecraft:coal':
            product = 'km:dust_coal';
            productAmount = 3
            break;
    }
    if (product != 'null') {

        player.runCommandAsync(`gamerule sendCommandFeedback false`);
        if(tool.getComponent(ItemCT.Durability).damage + 1 < tool.getComponent(ItemCT.Durability).maxDurability) {
            tool.getComponent(ItemCT.Durability).damage += 1
            player.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Offhand).setItem(tool);
        } else {
            player.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Offhand).setItem(new ItemStack("minecraft:air", 1))
            player.runCommand(`playsound random.break @s ^1^^`) 
        }

        if(stack.amount==1) stack.setItem(new ItemStack("minecraft:air", 1));
        else if(stack.amount>1) stack.setItem(new ItemStack(stack.typeId, stack.amount-1));

        player.runCommandAsync(`give @s ${product} ${productAmount}`);
        player.runCommandAsync(`gamerule sendCommandFeedback true`);
    }
}


function recipeCutters(player, stack, tool) {
    let product = 'null';
    let productAmount = 0;
    switch(stack.typeId) {
        case 'km:plate_iron':
            product = 'km:rod_iron';
            productAmount = 2;
            break;

        case 'minecraft:copper_ingot':
            product = 'km:wire';
            productAmount = 3;
            break;

    }
    if (product != 'null') {
        
        player.runCommandAsync(`gamerule sendCommandFeedback false`);
        if(tool.getComponent(ItemCT.Durability).damage + 1 < tool.getComponent(ItemCT.Durability).maxDurability) {
            tool.getComponent(ItemCT.Durability).damage += 1
            player.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Offhand).setItem(tool);
        } else {
            player.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Offhand).setItem(new ItemStack("minecraft:air", 1))
            player.runCommand(`playsound random.break @s ^1^^`) 
        }

        if(stack.amount==1) stack.setItem(new ItemStack("minecraft:air", 1));
        else if(stack.amount>1) stack.setItem(new ItemStack(stack.typeId, stack.amount-1));

        player.runCommandAsync(`give @s ${product} ${productAmount}`);
        player.runCommandAsync(`gamerule sendCommandFeedback true`);
    }
}

function rotateMachine(block, rot) {
    let coords = block.location;
    for (const e of w.getDimension("overworld").getEntities({location:coords, maxDistance:1})) {
        if (e.getComponent(EntityCT.TypeFamily)) {
            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_turbine")) {
                if(e.getProperty("km:dir") != 3) {e.setProperty("km:dir", e.getProperty("km:dir")+1);}
                else {e.setProperty("km:dir",0)}
                e.runCommandAsync(`say ${e.getProperty("km:dir")}`)
                e.setRotation({x:0,y:rot*e.getProperty("km:dir")});
            }
        }
    }
}


function wireTick() {
for (const e of w.getDimension("overworld").getEntities({type:"km:wire_se"})) {
        for (const p of w.getDimension("overworld").getEntities({location:e.location, maxDistance:0.9})) {

            if (p.getComponent(EntityCT.TypeFamily).hasTypeFamily("player") || p.getComponent(EntityCT.TypeFamily).hasTypeFamily("mob")) {
            let worldNetId = "km:network_"+String(e.getDynamicProperty("km:netId"))

            if (worldNetId !== "km:network_undefined") {
                let euNet = w.getDynamicProperty(worldNetId)
                if (euNet>8) {
                    w.setDynamicProperty(worldNetId, 0)

                    p.runCommandAsync(`camerashake add @s 0.2 0.1`)
                    p.runCommandAsync(`camerashake add @s 0.00001 0.1 rotational`)
                    
                    p.runCommandAsync(`playsound "entity.shocked" @s ~~~ 1 ${(Math.random()+1)/2}`);
                    for (let i = 0; i < 2; i++) {
                        p.applyKnockback((Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*1)
                        p.applyDamage((euNet/8)/2);
                        p.runCommandAsync(`particle "minecraft:electric_spark_particle" ~${((Math.random()-0.5)*2)} ~${((Math.random()-0.5)*2)+1} ~${((Math.random()-0.5)*2)}`);
                    }
                }
            }
        }  }
    }
}

function turbineTick() {
    for (const e of w.getDimension("overworld").getEntities({type:"km:efurnace_se"})) {
        let block = e.dimension.getBlock(e.location);
        if(block.matches("minecraft:air")) {return}

        let worldNetId = "km:network_"+String(e.getDynamicProperty("km:netId"));
        let euNet = w.getDynamicProperty(worldNetId)
        if (euNet < 128) {
            w.setDynamicProperty(worldNetId, w.getDynamicProperty(worldNetId)+32)
        }
    }
}

function efurnaceFunction(player, item, block) {

    let xOff = block.location.x+0.5;
    let yOff = block.location.y;
    let zOff = block.location.z+0.5;
    let coordsOff = {x:xOff, y:yOff, z:zOff};
    let temp = w.getDimension("overworld").getEntities({location:coordsOff, maxDistance:0.1});
    let furnace = temp[0];
    let air = new ItemStack("minecraft:air", 1);

    let furnace_inventory = furnace.getComponent(EntityCT.Inventory);
    let playerItem = player.getComponent(EntityCT.Equippable).getEquipmentSlot(EquipmentSlot.Mainhand);

    if(item == undefined){
        let slotToTake = 1;
        if(!furnace_inventory.container.getItem(1)) {
            slotToTake = 0
        }
        if (furnace_inventory.container.getItem(slotToTake)) {
            player.runCommandAsync(`gamerule sendCommandFeedback false`);
            player.runCommandAsync(`give @s ${furnace_inventory.container.getItem(slotToTake).typeId} ${furnace_inventory.container.getItem(slotToTake).amount}`);
            player.runCommandAsync(`gamerule sendCommandFeedback true`);
            //playerItem.setItem();
            furnace_inventory.container.setItem(slotToTake, air);
            //w.getDimension("overworld").spawnItem()
        }
    } else {
        if(!furnace_inventory.container.getItem(0) || (furnace_inventory.container.getItem(0).typeId == item.typeId)) {
            if (furnace_inventory.container.getItem(0)?.amount > 0) {
                let pullAmount = furnace_inventory.container.getItem(0).maxAmount - furnace_inventory.container.getItem(0).amount;
                let pushAmount = item.amount - pullAmount;
                if (pullAmount > 0) {
                    if (item.amount < pullAmount) {
                        furnace_inventory.container.setItem(0, new ItemStack(item.typeId, furnace_inventory.container.getItem(0).amount + item.amount));
                        playerItem.setItem(air);
                    } else {
                        furnace_inventory.container.getItem(0).amount = furnace_inventory.container.getItem(0).amount + pullAmount;
                        item.amount = pushAmount;
                    }
                } 
            } else {
                furnace_inventory.container.setItem(0, item);
                playerItem.setItem(air);
            }
        }
    }
}

function eFurnaceTick() {
    for (const e of w.getDimension("overworld").getEntities({type:"km:efurnace_se"})) {
        if (e.getComponent(EntityCT.TypeFamily)) {
            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_efurnace")) {
                let block = e.dimension.getBlock(e.location);
                if(block.matches("minecraft:air")) {return}

                let worldNetId = "km:network_"+String(e.getDynamicProperty("km:netId"))

                if (worldNetId !== "km:network_undefined") {
                    let euNet = w.getDynamicProperty(worldNetId)
                
                    let euWanted = 32 - e.getDynamicProperty("km:eu")
                    w.setDynamicProperty(worldNetId, w.getDynamicProperty(worldNetId)-euWanted)
                    e.setDynamicProperty("km:eu", e.getDynamicProperty("km:eu")+euWanted);
                }

                e.setProperty("km:active",false)
                block.setPermutation(block.permutation.withState("km:active",false))
                let furnace_inventory = e.getComponent(EntityCT.Inventory);
                let slot0 = furnace_inventory.container.getItem(0);
                let slot1 = furnace_inventory.container.getItem(1);

                if (slot0 === undefined) { e.runCommandAsync(`replaceitem entity @s slot.weapon.mainhand -1 minecraft:air 1 0 {"minecraft:keep_on_death":{}}`) }
                if (slot1 === undefined) { e.runCommandAsync(`replaceitem entity @s slot.weapon.offhand -1 minecraft:air 1 0 {"minecraft:keep_on_death":{}}`) }
                if (slot1 !== undefined) { e.runCommandAsync(`replaceitem entity @s slot.weapon.offhand -1 ${slot1.typeId} 1 0 {"minecraft:keep_on_death":{}}`) }
                if (slot0 !== undefined) { e.runCommandAsync(`replaceitem entity @s slot.weapon.mainhand -1 ${slot0.typeId} 1 0 {"minecraft:keep_on_death":{}}`)

                    if (e.getDynamicProperty("km:eu") > 1) {
                        if (rawMetals.includes(slot0.typeId) && (slot1 === undefined || slot1.typeId == metalSmelting(slot0.typeId))) {
                            block.setPermutation(block.permutation.withState("km:active",true))
                            e.setProperty("km:progress", e.getProperty("km:progress")+1);
                            e.setDynamicProperty("km:eu", e.getDynamicProperty("km:eu")-1);
                            e.setProperty("km:active",true)
                            if (e.getProperty("km:progress") > 32) {
                                e.setProperty("km:progress", 0)
                                let air = new ItemStack("minecraft:air", 1);
                                let product;
                                if (slot1 === undefined) { product = new ItemStack(metalSmelting(slot0.typeId), 1)}
                                else {product = new ItemStack(metalSmelting(slot0.typeId), slot1.amount+1)}
                                if (slot0.amount == 1) {furnace_inventory.container.setItem(0, air);}
                                else {furnace_inventory.container.setItem(0, new ItemStack(slot0.typeId, slot0.amount-1));}
                                furnace_inventory.container.setItem(1, product);
                                //e.runCommandAsync(`say furnace should be clear? now contains ${furnace_inventory.container.getItem(0).typeId} and ${furnace_inventory.container.getItem(1).typeId}`)
                            }
                        } else {e.setProperty("km:progress", 0)}
                    } else {e.setProperty("km:progress", 0)}
                } else {e.setProperty("km:progress", 0)}
            }
        }
    }
}

function itemTransportTick() {
    for (const e of w.getDimension("overworld").getEntities()) {
        if (e.getComponent(EntityCT.TypeFamily)) {
            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_item_transporter")) {
                
                let transporter_inventory = e.getComponent(EntityCT.Inventory);
                let pickUpLoc = {x:e.location.x, y:e.location.y, z:e.location.z}
                let dropOffLoc = {x:e.location.x, y:e.location.y, z:e.location.z}
                
                switch (e.getProperty("km:dir")) {
                    case 0:
                        pickUpLoc.z += 1;
                        dropOffLoc.z -= 1;
                        break;
                    case 1:
                        pickUpLoc.x -= 1;
                        dropOffLoc.x += 1;
                        break;
                    case 2:
                        pickUpLoc.z -= 1;
                        dropOffLoc.z += 1;
                        break;
                    case 3:
                        pickUpLoc.x += 1;
                        dropOffLoc.x -= 1;
                        break;
                }

                switch (e.getProperty("km:updown")) {
                    case 1:
                        pickUpLoc.y -= 1;
                        dropOffLoc.y += 1;
                        pickUpLoc.z -= 1;
                        dropOffLoc.z += 1;
                        break;
                    case 3:
                        pickUpLoc.y += 1;
                        dropOffLoc.y -= 1;
                        pickUpLoc.z -= 1;
                        dropOffLoc.z += 1;
                        break;
                }

                if (e.dimension.getBlock(dropOffLoc)) {
                    if (e.dimension.getBlock(dropOffLoc).getComponent('inventory')) {
                    const blockContainer = e.dimension.getBlock(dropOffLoc).getComponent('inventory').container;
                        if(blockContainer.emptySlotsCount>0 && transporter_inventory.container.getItem(0)) {
                            blockContainer.addItem(transporter_inventory.container.getItem(0))
                            transporter_inventory.container.setItem(0, new ItemStack("minecraft:air", 1));
                        }
                    }
                }

                
                for (const i of w.getDimension("overworld").getEntities({location:pickUpLoc, maxDistance:0.5})) {
                    if (i.getComponent(EntityCT.Item)) {
                        if (!transporter_inventory.container.getItem(0)) {
                            transporter_inventory.container.setItem(0, i.getComponent(EntityCT.Item).itemStack);
                            i.remove();
                        }
                    }
                }

                for (const i of w.getDimension("overworld").getEntities({location:pickUpLoc, maxDistance:0.2})) {
                    if (i.getComponent(EntityCT.Inventory)) {
                        let pushTo_inventory = i.getComponent(EntityCT.Inventory)
                        if (pushTo_inventory.container.getItem(1) && !transporter_inventory.container.getItem(0)) {
                            transporter_inventory.container.setItem(0, pushTo_inventory.container.getItem(1));
                            pushTo_inventory.container.setItem(1, new ItemStack("minecraft:air", 1));
                        }
                    }
                }

                for (const i of w.getDimension("overworld").getEntities({location:dropOffLoc, maxDistance:0.2})) {
                    if (i.getComponent(EntityCT.Inventory)) {
                        let pushTo_inventory = i.getComponent(EntityCT.Inventory)
                        if (transporter_inventory.container.getItem(0) && !pushTo_inventory.container.getItem(0)) {
                            pushTo_inventory.container.setItem(0, transporter_inventory.container.getItem(0));
                            transporter_inventory.container.setItem(0, new ItemStack("minecraft:air", 1));
                        }
                    }
                }

                for (const i of w.getDimension("overworld").getEntities({location:dropOffLoc, maxDistance:0.2})) {
                    if (i.getComponent(EntityCT.TypeFamily)) {
                        if (i.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_conveyor")) {
                            if (transporter_inventory.container.getItem(0)) {
                                w.getDimension("overworld").spawnItem(transporter_inventory.container.getItem(0), dropOffLoc)
                                transporter_inventory.container.setItem(0, new ItemStack("minecraft:air", 1));
                            }
                        }
                    }
                }
            }
        }
    }
}

function conveyorInteract(block, player) {
    block.setPermutation(block.permutation.withState("km:sloped", !block.permutation.getState("km:sloped")));
}




function debug(block, player) {
    let x = block.location.x + 0.5;
    let y = block.location.y + 0;
    let z = block.location.z + 0.5;
    let elist = w.getDimension("overworld").getEntities({location:{x:x,y:y,z:z}, maxDistance:0.1}) 
    let e = elist[0];
    let el = e.location;
    {
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"\nTileEntity: ${block.location.x}, ${block.location.y}, ${block.location.z}\nContains: ${e.getDynamicProperty("km:eu")}eu\n"}]}`);
    }
    {
        //player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"\nTileEntity: ${block.location.x}, ${block.location.y}, ${block.location.z}\nContains: ${e.getComponent(EntityCT.Inventory).container.getItem(1).typeId}\n"}]}`);
    }
    {
        //player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"\nNetId: ${getTileEntity("overworld", block.location).getDynamicProperty("km:netId")}\nOriginalNetId: ${getTileEntity("overworld", block.location).getDynamicProperty("km:original_netId")}\n"}]}`);
        //player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"\nFlooded: ${getTileEntity("overworld", block.location).getDynamicProperty("km:flooded")}\n"}]}`);
    }
    {
        //let worldNetId = "km:network_"+String(e.getDynamicProperty("km:netId"))
        //let euNet = w.getDynamicProperty(worldNetId);
//
        //player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"\nFlooded: ${worldNetId} has ${euNet}\n"}]}`);
    }
}

function getTileEntity(dimension, coords) {
    let array = w.getDimension(dimension).getEntities({
        maxDistance: 0.2,
        location: vector3Add(coords, {x:0.5, y:0, z:0.5})
      })
    return array[0];
}

function vector3Add(v1, v2) {
    let x = v1.x+v2.x;
    let z = v1.z+v2.z;
    let y = v1.y+v2.y;

    return {x:x, y:y, z:z};
}

const rawMetals = [
    "minecraft:raw_iron",
    "minecraft:raw_copper",
    "minecraft:raw_gold"
]

function metalSmelting(input) {
    switch(input) {
        case "minecraft:raw_iron":
            return "minecraft:iron_ingot";

        case "minecraft:raw_copper":
            return "minecraft:copper_ingot";

        case "minecraft:raw_gold":
            return "minecraft:gold_ingot";

        default:
            return "";
    }
}

function metalRolling(input) {
    switch(input) {
        case "minecraft:iron_ingot":
            return "km:plate_iron";

        case "minecraft:coal":
            return "km:dust_coal";

        default:
            return "";
    }
}