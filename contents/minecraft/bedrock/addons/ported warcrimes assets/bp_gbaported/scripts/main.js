import { system, world, ItemStack } from "@minecraft/server";
import { V3Math } from "MathUtils";
/** @type {import("@minecraft/server").BlockCustomComponent} */
const CustomDoorBlockComponent = {
    onPlayerInteract({ block, dimension }) {
        const isOpen = block.permutation.getState("gbaported:open");
        const dir = block.permutation.getState("minecraft:cardinal_direction");
        const sound = isOpen ? "close.wooden_trapdoor" : "open.wooden_trapdoor";
        block.setPermutation(block.permutation.withState("gbaported:open", !isOpen));
        doorUpdate(block, dir, "gbaported:open", !isOpen);
        dimension.playSound(sound, block.center(), {
            pitch: 0.9,
            volume: 0.9,
        });
    },
};
world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("gbaported:custom_door", CustomDoorBlockComponent);
});
world.afterEvents.playerPlaceBlock.subscribe((data) => {
    if (data.block.matches("gbaported:gba_door_0_bottom")) {
        system.run(() => { doorPlaced(data); });
    }
});
world.beforeEvents.playerBreakBlock.subscribe((data) => {
    let block = data.block;
    if (block.hasTag("gbaported:door")) {
        system.run(() => { doorRemoved(block); });
    }
});
function doorUpdate(block, dir, state, set) {
    if (block.hasTag("gbaported:door_bottom") && block.dimension.getBlock(V3Math.add(block.location, { x: 0, y: 1, z: 0 })).hasTag("gbaported:door_top")) {
        const targetBlock = block.dimension.getBlock(V3Math.add(block.location, { x: 0, y: 1, z: 0 }));
        targetBlock.setPermutation(targetBlock.permutation.withState(state, set));
        targetBlock.setPermutation(targetBlock.permutation.withState("minecraft:cardinal_direction", dir));
    }
    else if (block.hasTag("gbaported:door_top") && block.dimension.getBlock(V3Math.add(block.location, { x: 0, y: -1, z: 0 })).hasTag("gbaported:door_bottom")) {
        const targetBlock = block.dimension.getBlock(V3Math.add(block.location, { x: 0, y: -1, z: 0 }));
        targetBlock.setPermutation(targetBlock.permutation.withState(state, set));
        targetBlock.setPermutation(targetBlock.permutation.withState("minecraft:cardinal_direction", dir));
    }
    else {
        block.dimension.spawnItem(new ItemStack("gbaported:gba_door_0", 1), block.location);
        block.setType("minecraft:air");
    }
}
function doorRemoved(block) {
    if (block.dimension.getBlock(V3Math.add(block.location, { x: 0, y: 1, z: 0 })).matches("gbaported:gba_door_0_top")) {
        block.dimension.getBlock(V3Math.add(block.location, { x: 0, y: 1, z: 0 })).setType("minecraft:air");
        block.dimension.spawnItem(new ItemStack("gbaported:gba_door_0", 1), block.location);
    }
    else {
        block.dimension.getBlock(V3Math.add(block.location, { x: 0, y: -1, z: 0 })).setType("minecraft:air");
        block.dimension.spawnItem(new ItemStack("gbaported:gba_door_0", 1), block.location);
    }
}
function doorPlaced(data) {
    if (data.block.above(1).matches("minecraft:air")) {
        data.dimension.setBlockType(V3Math.add(data.block.location, { x: 0, y: 1, z: 0 }), "gbaported:gba_door_0_top");
        let doorTop = data.dimension.getBlock(V3Math.add(data.block.location, { x: 0, y: 1, z: 0 }));
        doorTop.setPermutation(doorTop.permutation.withState("minecraft:cardinal_direction", data.block.permutation.getState("minecraft:cardinal_direction")));
    }
    else {
        data.block.dimension.spawnItem(new ItemStack("gbaported:gba_door_0", 1), data.block.location);
        data.block.setType("minecraft:air");
    }
}
