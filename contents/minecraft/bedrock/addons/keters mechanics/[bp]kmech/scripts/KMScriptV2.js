import { system as s, world as w, EntityComponentTypes as EntityCT, ItemStack } from "@minecraft/server";
import { V3Math } from "MathUtils";
const offset = {
    entity: { x: 0.5, y: 0, z: 0.5 },
    block: { x: -0.5, y: 0, z: -0.5 }
};
s.runInterval(() => {
    tileEntityValidation();
    //for fun
    if (w.getAllPlayers()[0]?.getComponent(EntityCT.Inventory).container.getSlot(w.getAllPlayers()[0]?.selectedSlotIndex) !== undefined) {
        let player = w.getAllPlayers()[0];
        if (player.getComponent(EntityCT.Inventory).container.getSlot(player?.selectedSlotIndex).hasItem()) {
            if (player.getComponent(EntityCT.Inventory).container.getSlot(player?.selectedSlotIndex).typeId == "km:glider") {
                player.playAnimation("animation.player.glider");
                player.addEffect("minecraft:slow_falling", 4, { showParticles: false, amplifier: 1 });
                if (player.dimension.getBlockFromRay(player.location, { x: 0, y: -1, z: 0 }, { maxDistance: 5 })?.block.typeId == "minecraft:campfire") {
                    player.applyKnockback(0, 0, 0, 1);
                }
            }
        }
    }
}, 1);
w.afterEvents.playerPlaceBlock.subscribe((data) => {
    if (data.block.matches("km:wire")) {
        s.run(() => { wirePlaced(data.block); assignwireLayout(data.dimension.id); return; });
    }
    ;
    if (data.block.hasTag("km_machine")) {
        s.run(() => { machinePlaced(data.block); assignwireLayout(data.dimension.id); return; });
    }
    ;
});
w.beforeEvents.playerInteractWithBlock.subscribe((data) => {
    if (data.itemStack.typeId == "km:debug_tool" && data.isFirstEvent) {
        s.run(() => { debugTool(data); });
    }
});
function machinePlaced(block) {
    let entityToSpawn = "null";
    let runFlood = false;
    let rotates = "";
    switch (block.typeId) {
        case "km:conveyor":
            entityToSpawn = "km:conveyor_se";
            break;
        case "km:machine_turbine":
            entityToSpawn = "km:turbine_se";
            runFlood = true;
            break;
        case "km:machine_efurnace":
            entityToSpawn = "km:efurnace_se";
            rotates = "y";
            break;
        case "km:machine_crusher":
            entityToSpawn = "km:crusher_se";
            rotates = "y";
            break;
        case "km:machine_item_transporter":
            entityToSpawn = "km:item_transporter_se";
            break;
        case "km:fluid_pipe":
            entityToSpawn = "km:fluid_pipe_se";
            break;
    }
    if (entityToSpawn != "null") {
        block.setPermutation(block.permutation.withState("km:placed", true));
        let entity = block.dimension.spawnEntity(entityToSpawn, V3Math.add(block.location, offset.entity));
        if (rotates == "y") {
            tileEntityRotation(entity, block);
        }
        assignwireLayout(block.dimension.id);
        if (runFlood) {
            entity.setDynamicProperty("km:original_netId", Math.floor(Math.random() * 10000) + Math.floor(Math.random() * 100));
            entity.setDynamicProperty("km:netId", entity.getDynamicProperty("km:original_netId"));
        }
        netUpdate(block.dimension);
    }
}
//WIRE HANDLING
function wirePlaced(block) {
    let e = block.dimension.spawnEntity("km:wire_se", V3Math.add(block.location, offset.entity));
    assignwireLayout(block.dimension.id);
    netUpdate(block.dimension);
}
function assignwireLayout(dim) {
    for (const e of w.getDimension(dim).getEntities()) {
        if (e.getComponent(EntityCT.TypeFamily)?.hasTypeFamily("km_wire")) {
            e.setProperty("km:u", false);
            e.setProperty("km:d", false);
            e.setProperty("km:n", false);
            e.setProperty("km:s", false);
            e.setProperty("km:e", false);
            e.setProperty("km:w", false);
            let e_block = e.dimension.getBlock(V3Math.add(e.location, offset.block));
            if (e_block?.isValid() !== true) {
                return;
            }
            let loc1 = e_block?.location;
            if (loc1 === undefined) {
                return;
            }
            for (const n of e.dimension.getEntities({ maxDistance: 1, location: e.location })) {
                if (n.getComponent(EntityCT.TypeFamily)?.hasTypeFamily("km_conductor")) {
                    let n_block = n.dimension.getBlock(V3Math.add(n.location, offset.block));
                    if (n_block.isValid() !== true) {
                        return;
                    }
                    let loc2 = n_block?.location;
                    if (loc2 === undefined) {
                        return;
                    }
                    let c = 0;
                    if ((loc1.x == loc2.x + 1) && n_block?.hasTag("km_conducts_e")) {
                        e.setProperty("km:w", true);
                        c++;
                    }
                    if ((loc1.x == loc2.x - 1) && n_block?.hasTag("km_conducts_w")) {
                        e.setProperty("km:e", true);
                        c++;
                    }
                    if ((loc1.y == loc2.y + 1) && n_block?.hasTag("km_conducts_d")) {
                        e.setProperty("km:u", true);
                        c++;
                    }
                    if ((loc1.y == loc2.y - 1) && n_block?.hasTag("km_conducts_u")) {
                        e.setProperty("km:d", true);
                        c++;
                    }
                    if ((loc1.z == loc2.z + 1) && n_block?.hasTag("km_conducts_s")) {
                        e.setProperty("km:n", true);
                        c++;
                    }
                    if ((loc1.z == loc2.z - 1) && n_block?.hasTag("km_conducts_n")) {
                        e.setProperty("km:s", true);
                        c++;
                    }
                }
            }
        }
    }
}
//NETWORK HANDLING
function floodNetwork(dim, coords, originator, netId) {
    if (!dim.getBlock(coords).hasTag("km_machine") && !originator) {
        return;
    }
    //move to wireTick()
    if (dim.getBlock(coords).matches("km:wire")) {
        let coordsOff = V3Math.add(coords, offset.entity);
        let wire = getTileEntity(dim, coords);
        for (const e of dim.getEntities({ location: coordsOff, maxDistance: 0.9 })) {
            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("player")) {
                e.runCommandAsync(`camerashake add @s 0.2 0.1`);
                e.runCommandAsync(`camerashake add @s 0.00001 0.1 rotational`);
                e.applyDamage(2);
                e.runCommandAsync(`playsound "entity.shocked" @e[r=10] ~~~ 1 ${(Math.random() + 1) / 2}`);
                for (let i = 0; i < 1; i++) {
                    e.runCommandAsync(`particle "minecraft:electric_spark_particle" ~${((Math.random() - 0.5) * 2)} ~${((Math.random() - 0.5) * 2) + 1} ~${((Math.random() - 0.5) * 2)}`);
                }
            }
        }
    }
    let block = dim.getBlock(coords);
    if (getTileEntity(dim, coords).getDynamicProperty("km:flooded") == true) {
        return;
    }
    if (originator) {
        let worldNetId = "km:network_" + String(netId);
        w.setDynamicProperty(worldNetId, 0);
    }
    let newNetId = netId;
    getTileEntity(dim, coords).setDynamicProperty("km:netId", newNetId);
    getTileEntity(dim, coords).setDynamicProperty("km:flooded", true);
    block.setPermutation(block.permutation.withState("km:flooded", true));
    let x = block.location.x;
    let y = block.location.y;
    let z = block.location.z;
    if (dim.getBlock({ x: x + 1, y: y, z: z }).hasTag("km_conducts_w")) {
        floodNetwork(dim, { x: x + 1, y: y, z: z }, originator, newNetId);
    }
    if (dim.getBlock({ x: x - 1, y: y, z: z }).hasTag("km_conducts_e")) {
        floodNetwork(dim, { x: x - 1, y: y, z: z }, originator, newNetId);
    }
    if (dim.getBlock({ x: x, y: y, z: z + 1 }).hasTag("km_conducts_n")) {
        floodNetwork(dim, { x: x, y: y, z: z + 1 }, originator, newNetId);
    }
    if (dim.getBlock({ x: x, y: y, z: z - 1 }).hasTag("km_conducts_s")) {
        floodNetwork(dim, { x: x, y: y, z: z - 1 }, originator, newNetId);
    }
    if (dim.getBlock({ x: x, y: y + 1, z: z }).hasTag("km_conducts_u")) {
        floodNetwork(dim, { x: x, y: y + 1, z: z }, originator, newNetId);
    }
    if (dim.getBlock({ x: x, y: y - 1, z: z }).hasTag("km_conducts_d")) {
        floodNetwork(dim, { x: x, y: y - 1, z: z }, originator, newNetId);
    }
}
function resetFlood(dim, full) {
    w.clearDynamicProperties();
    for (const e of dim.getEntities()) {
        if (e.getComponent(EntityCT.TypeFamily)) {
            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_wire") || (full && e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_machine"))) {
                let block = e.dimension.getBlock(e.location);
                if (!block.matches("minecraft:air")) {
                    //block.setPermutation(block.permutation.withState("km:flooded", false));
                    e.setDynamicProperty("km:flooded", false);
                    e.setDynamicProperty("km:netId", undefined);
                }
            }
        }
    }
}
function netUpdate(dim) {
    resetFlood(dim, true);
    for (const e of dim.getEntities()) {
        if (e.getComponent(EntityCT.TypeFamily)) {
            if (e.getComponent(EntityCT.TypeFamily).hasTypeFamily("km_turbine")) {
                if (e.getDynamicProperty("km:flooded") == false || e.getDynamicProperty("km:flooded") === undefined) {
                    let block = e.dimension.getBlock(e.location);
                    floodNetwork(dim, block.location, e, e.getDynamicProperty("km:original_netId"));
                }
            }
        }
    }
}
function getNetworkEu(entity) {
    let netId = entity.getDynamicProperty("km:netId");
}
class handleNetworkEu {
    static request(entity, amount) {
        let netId = "km:network_" + String(entity.getDynamicProperty("km:netId"));
        let networkEu = Number(w.getDynamicProperty(netId));
        if (networkEu > amount) {
            return amount;
        }
        if (networkEu >= 0) {
            return networkEu;
        }
    }
    static offer(entity, amount) {
        let netId = "km:network_" + String(entity.getDynamicProperty("km:netId"));
        let networkEu = Number(w.getDynamicProperty(netId));
        if (networkEu > amount) {
            return amount;
        }
        if (networkEu >= 0) {
            return networkEu;
        }
    }
}
//PIPE HANDLING
////hate this hate this hate this hate this
////rework to be similar to powder toy if possible? idk what's wrong with it lmao
function fluidFlow(dim) {
    for (const e of dim.getEntities()) {
        if (e.getComponent(EntityCT.TypeFamily)?.hasTypeFamily("km_fluid_conductor")) {
            if (dim.getBlockAbove(e.location)?.above(1)?.matches("glass")) {
                e.setDynamicProperty("km:fluid_stored", "water");
            }
            if ((e.getDynamicProperty("km:fluid_stored") != undefined) && (e.getDynamicProperty("km:fluid_stored") != "none")) {
                let fluidPassed = false;
                let ef = e.getComponent(EntityCT.TypeFamily);
                let potentialTargets = [];
                let yFlow;
                switch (e.getDynamicProperty("km:fluid_stored")) {
                    case "water":
                        yFlow = -1;
                        break;
                    case "lava":
                        yFlow = -1;
                        break;
                    case "steam":
                        yFlow = 1;
                        break;
                }
                for (const n of dim.getEntities({ maxDistance: 1, location: e.location })) {
                    if (n.getComponent(EntityCT.TypeFamily)?.hasTypeFamily("km_fluid_conductor") && (n != e)) {
                        if (n.getDynamicProperty("km:fluid_stored") == "none" || n.getDynamicProperty("km:fluid_stored") == undefined) {
                            let nf = n.getComponent(EntityCT.TypeFamily);
                            if ((e.location.y + 1 == n.location.y) && (ef.hasTypeFamily("km_pipe_u")) && (nf.hasTypeFamily("km_pipe_d"))) {
                                potentialTargets.push({ e: n, y: 1 });
                            }
                            if ((e.location.y - 1 == n.location.y) && (ef.hasTypeFamily("km_pipe_d")) && (nf.hasTypeFamily("km_pipe_u"))) {
                                potentialTargets.push({ e: n, y: -1 });
                            }
                            if ((e.location.z + 1 == n.location.z) && (ef.hasTypeFamily("km_pipe_n")) && (nf.hasTypeFamily("km_pipe_s"))) {
                                potentialTargets.push({ e: n, y: 0 });
                            }
                            if ((e.location.z - 1 == n.location.z) && (ef.hasTypeFamily("km_pipe_s")) && (nf.hasTypeFamily("km_pipe_n"))) {
                                potentialTargets.push({ e: n, y: 0 });
                            }
                        }
                    }
                }
                if (potentialTargets.length > 0) {
                    for (let t = 0; t < potentialTargets.length; t++) {
                        const target = potentialTargets[t];
                        if (!fluidPassed) {
                            if (target.y == yFlow) {
                                fluidPass(true, e, target.e);
                                fluidPassed = true;
                            }
                        }
                    }
                    if (!fluidPassed) {
                        let v = Math.ceil(Math.random() * potentialTargets.length);
                        fluidPass(true, e, potentialTargets[v - 1].e);
                        fluidPassed = true;
                    }
                }
            }
        }
    }
}
function fluidPass(isPipe, o, t) {
    let fluid = o.getDynamicProperty("km:fluid_stored");
    //o.runCommand(`say attempting to pass ${fluid}`)
    t.setDynamicProperty("km:fluid_stored", String(fluid));
    o.setDynamicProperty("km:fluid_stored", "none");
    t.setProperty("km:fluid_filled", true);
    o.setProperty("km:fluid_filled", false);
}
//TILE ENTITIES
function tileEntityValidation() {
    let dimensions = checkForDimensions();
    for (let i = 0; i < dimensions.length; i++) {
        const dim = dimensions[i];
        for (const e of w.getDimension(dim).getEntities()) {
            if (e.getComponent(EntityCT.TypeFamily)?.hasTypeFamily("km_machine")) {
                let p = e.location;
                let block = e.dimension.getBlock(p);
                //fluidFlow(w.getDimension(dim));
                if (e.typeId == "km:turbine_se") {
                    turbineTick(e);
                }
                if (e.typeId == "km:efurnace_se") {
                    //eFurnaceTick(e);
                }
                if ((block?.isValid() === true || block?.matches("minecraft:air")) && !block?.hasTag("km_machine")) {
                    if (e.getComponent(EntityCT.Inventory)) {
                        dropInventory(e);
                    }
                    assignwireLayout(block.dimension.id);
                    netUpdate(e.dimension);
                    e.remove();
                }
            }
        }
    }
}
function dropInventory(te) {
    let container = te.getComponent(EntityCT.Inventory).container;
    for (let i = 0; i < container.size; i++) {
        let item = container.getSlot(i).getItem();
        if (item !== undefined) {
            te.dimension.spawnItem(item, te.location);
        }
    }
}
function tileEntityRotation(te, block) {
    if (!block.matches("minecraft:air")) {
        let rot = 0;
        switch (block.permutation.getState("minecraft:cardinal_direction")) {
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
        }
        te.setProperty("km:dir", rot);
    }
}
function getTileEntity(dim, coords) {
    let array = dim.getEntities({
        maxDistance: 0.2,
        location: V3Math.add(coords, offset.entity)
    });
    return array[0];
}
function checkForDimensions() {
    let dimensions = [];
    if (w.getDimension("overworld")) {
        dimensions.push("overworld");
    }
    if (w.getDimension("nether")) {
        dimensions.push("nether");
    }
    if (w.getDimension("the_end")) {
        dimensions.push("the_end");
    }
    return dimensions;
}
//TICKING TILE ENTITIES
function turbineTick(turbine) {
    let worldNetId = "km:network_" + turbine.getDynamicProperty("km:netId");
    let euNet = w.getDynamicProperty(worldNetId);
    if (euNet < 32) {
        w.setDynamicProperty(worldNetId, +w.getDynamicProperty(worldNetId) + 32);
    }
}

//Needs fully implementing into this version of KMScript, original KMScript is broken somewhere but was working fine GET ON IT
function eFurnaceTick(e) {
    let block = e.dimension.getBlock(e.location);
    if (block.matches("minecraft:air")) {
        return;
    }
    let worldNetId = "km:network_" + String(e.getDynamicProperty("km:netId"));
    if (worldNetId !== "km:network_undefined") {
        let euNet = w.getDynamicProperty(worldNetId);
        let euWanted = 32 - +e.getDynamicProperty("km:eu");
        w.setDynamicProperty(worldNetId, +w.getDynamicProperty(worldNetId) - euWanted);
        e.setDynamicProperty("km:eu", +e.getDynamicProperty("km:eu") + euWanted);
    }
    e.setProperty("km:active", false);
    block.setPermutation(block.permutation.withState("km:active", false));
    let furnace_inventory = e.getComponent(EntityCT.Inventory);
    let slot0 = furnace_inventory.container.getItem(0);
    let slot1 = furnace_inventory.container.getItem(1);
    if (slot0 === undefined) {
        e.runCommandAsync(`replaceitem entity @s slot.weapon.mainhand -1 minecraft:air 1 0 {"minecraft:keep_on_death":{}}`);
    }
    if (slot1 === undefined) {
        e.runCommandAsync(`replaceitem entity @s slot.weapon.offhand -1 minecraft:air 1 0 {"minecraft:keep_on_death":{}}`);
    }
    if (slot1 !== undefined) {
        e.runCommandAsync(`replaceitem entity @s slot.weapon.offhand -1 ${slot1.typeId} 1 0 {"minecraft:keep_on_death":{}}`);
    }
    if (slot0 !== undefined) {
        e.runCommandAsync(`replaceitem entity @s slot.weapon.mainhand -1 ${slot0.typeId} 1 0 {"minecraft:keep_on_death":{}}`);
        if (+e.getDynamicProperty("km:eu") > 1) {
            if (rawMetals.includes(slot0.typeId) && (slot1 === undefined || slot1.typeId == metalSmelting(slot0.typeId))) {
                block.setPermutation(block.permutation.withState("km:active", true));
                e.setProperty("km:progress", +e.getProperty("km:progress") + 1);
                e.setDynamicProperty("km:eu", +e.getDynamicProperty("km:eu") - 1);
                e.setProperty("km:active", true);
                if (+e.getProperty("km:progress") > 32) {
                    e.setProperty("km:progress", 0);
                    let air = new ItemStack("minecraft:air", 1);
                    let product;
                    if (slot1 === undefined) {
                        product = new ItemStack(metalSmelting(slot0.typeId), 1);
                    }
                    else {
                        product = new ItemStack(metalSmelting(slot0.typeId), slot1.amount + 1);
                    }
                    if (slot0.amount == 1) {
                        furnace_inventory.container.setItem(0, air);
                    }
                    else {
                        furnace_inventory.container.setItem(0, new ItemStack(slot0.typeId, slot0.amount - 1));
                    }
                    furnace_inventory.container.setItem(1, product);
                    //e.runCommandAsync(`say furnace should be clear? now contains ${furnace_inventory.container.getItem(0).typeId} and ${furnace_inventory.container.getItem(1).typeId}`)
                }
            }
            else {
                e.setProperty("km:progress", 0);
            }
        }
        else {
            e.setProperty("km:progress", 0);
        }
    }
    else {
        e.setProperty("km:progress", 0);
    }
}
//ITEM TRANSFORMS
const rawMetals = [
    "minecraft:raw_iron",
    "minecraft:raw_copper",
    "minecraft:raw_gold"
];
function metalSmelting(input) {
    switch (input) {
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
//DEBUG
function debugTool(data) {
    let te = getTileEntity(data.player.dimension, data.block.location);
    let player = data.player;
    let worldNetId = "km:network_" + te.getDynamicProperty("km:netId");
    {
        //player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"\nNetId: ${te.getDynamicProperty("km:netId")}\nOriginalNetId: ${te.getDynamicProperty("km:original_netId")}\n"}]}`);
        //player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"\nFlooded: ${te.getDynamicProperty("km:flooded")}\n"}]}`);
    }
    {
        //player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"\Fluid: ${te.getDynamicProperty("km:fluid_stored")}\n"}]}`);
    }
    {
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"euNet: ${te.getDynamicProperty("km:eu")}\n"}]}`);
    }
}
function getDynamicProperty(subject, property) {
    if (subject === w) {
        switch (w.getDynamicProperty(property)) {
            case "string":
                return String(w.getDynamicProperty(property));
            case "number":
                return Number(w.getDynamicProperty(property));
            default:
                break;
        }
    }
    else {
        const e = subject;
        switch (e.getDynamicProperty(property)) {
            case "string":
                return String(e.getDynamicProperty(property));
            case "number":
                return Number(e.getDynamicProperty(property));
            default:
                e.runCommandAsync(`say ERROR: dynamic property is ${typeof e.getDynamicProperty(property)}`);
                break;
        }
    }
}
function setDynamicProperty(subject, property, input) {
    if (subject === w) {
        w.setDynamicProperty(property, input);
    }
    else {
        subject.setDynamicProperty(property, input);
    }
}
