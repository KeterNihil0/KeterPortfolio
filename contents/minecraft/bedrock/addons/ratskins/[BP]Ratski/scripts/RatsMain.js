import { system, world, EquipmentSlot, EntityComponentTypes, BlockVolume, ItemStack, BlockComponentTypes, Player, EntityHealthComponent } from '@minecraft/server';
import CoatNames from './RatCoats.js';
import ColConv from './ColConv.js';

//turn these int arrays into enums somehow? so they have a name AND value
const tameItems = [
    "minecraft:apple",
    "minecraft:beetroot",
    "minecraft:bread",
    "minecraft:carrot",
    "minecraft:chicken",
    "minecraft:cooked_chicken",
    "minecraft:fish",
    "minecraft:melon",
    "minecraft:porkchop",
    "minecraft:cooked_porkchop",
    "minecraft:pumpkin_pie",
    "minecraft:salmon",
    "minecraft:sweet_berries",
    "minecraft:glow_berries"
]

const ratOrders = [
    "staying",
    "following",
    "harvesting crops",
    "storing items"
]



//this whole thing is a mess ffs, when moving to typescript, remove bloat code, 
// use inventories to get items, tidy up dimension scan (atm only looking at overworld)

world.afterEvents.itemUse.subscribe(({ source: player, itemStack }) => {

    //tidy up + combine the softupdate and play check
    if (itemStack.typeId == "ratskins:hamlin_pipe") {
        const playerLocation = player.location;

        var pitch = (Math.random());

        var playerLookAngle = Math.floor((Math.round(player.getViewDirection().y * 10)/10+1)/2*24);

        var nuLookAngle = player.getViewDirection().y;
        var remapLookAngle;

            if (0.18 < nuLookAngle) {
                remapLookAngle = 4
            }
            if (0 < nuLookAngle && nuLookAngle < 0.18) {
                remapLookAngle = 3;
            }
                
            if (-0.18 < nuLookAngle && nuLookAngle < 0) {
                remapLookAngle = 2;
            }
                
            if (nuLookAngle < -0.18) {
                remapLookAngle = 1;
            }
                
            

        var lookPitch = Math.pow(2, ((remapLookAngle+3)*2-12)/12)

        player.runCommand(`playsound "note.flute" @a[r=8] ^1 ^ ^3 1 ${lookPitch}`);

        player.setDynamicProperty("ratskins:note_timer", 100);
        if(player.getDynamicProperty("ratskins:note_history") === undefined) { player.setDynamicProperty("ratskins:note_history", "") } 
        else {
            let noteHistory = ""
            noteHistory = player.getDynamicProperty("ratskins:note_history");
            noteHistory = noteHistory+remapLookAngle
            player.setDynamicProperty("ratskins:note_history", noteHistory);

            hamlinPipeUpdate(player.name, false, 0);
        

            if((noteHistory.length == 4)) { player.setDynamicProperty("ratskins:note_history", "") }
        }
    };

    //add more vars here
    if (itemStack.typeId == "ratskins:bundle" && itemStack.getDynamicProperty("in_use")) {
        const playerLocation = player.location;
        const owner = itemStack.getDynamicProperty("ratskins:owner");
        if (player.name == owner) {
        const rat = player.dimension.spawnEntity("ratskins:rat", playerLocation);
        rat.setProperty("ratskins:new_entity", false);
        
		const topCoat = itemStack.getDynamicProperty("ratskins:top_coat");
		const bottomCoat = itemStack.getDynamicProperty("ratskins:base_coat");
    

        const tamedEntityComp = rat.getComponent(EntityComponentTypes.Tameable);
        let players = world.getPlayers();
        players.forEach(playertest => {
          if (playertest.name == owner) {
            tamedEntityComp.tame(playertest);
          }
        });

		rat.applyDamage(8-itemStack.getDynamicProperty("ratskins:hp"));
        rat.triggerEvent("minecraft:on_tame")

		if (itemStack.getDynamicProperty("ratskins:hp") <= 1){
			rat.triggerEvent("ratskins:fatal")
			rat.setProperty("ratskins:wounded", true);
		}

		rat.setProperty("ratskins:top_coat", topCoat);
		rat.setProperty("ratskins:base_coat", bottomCoat);

        rat.setProperty("ratskins:col_r", itemStack.getDynamicProperty("ratskins:col_r"));
        rat.setProperty("ratskins:col_g", itemStack.getDynamicProperty("ratskins:col_g"));
        rat.setProperty("ratskins:col_b", itemStack.getDynamicProperty("ratskins:col_b"));

		const equipment = player.getComponent(EntityComponentTypes.Equippable);

        rat.nameTag = itemStack.getDynamicProperty("ratskins:rat_name");
        rat.setProperty("ratskins:order", 1);
        rat.triggerEvent("ratskins:order_change");

        player.runCommandAsync("replaceitem entity @s slot.weapon.mainhand 0 ratskins:bundle"); 
    } else {
        world.runCommandAsync(`w ${player.name} This rodent does not belong to you`);
    }
    }
})

world.beforeEvents.playerInteractWithEntity.subscribe((data) => {
    if(data.itemStack) {
        if (data.target.typeId === "ratskins:rat" && data.itemStack.typeId == "ratskins:hamlin_pipe")  {
            system.run(() => ratOrder(data.target, data.player));
        }
    if (data.target.typeId === "ratskins:rat" && data.itemStack.typeId == "ratskins:bundle")  {
        system.run(() =>ratBook(data.player, data.target, data.itemStack));
    }
    if (data.target.typeId === "ratskins:rat" &&  tameItems.includes(data.itemStack.typeId))  {
        if (data.target.getProperty("ratskins:tamed") == false) {
            system.run(() =>ratTame(data.player, data.target, data.itemStack));
        } else {
            system.run(() =>ratHeal(data.player, data.target, data.itemStack));
        }
    }
    if ((data.target.typeId === "ratskins:rat") && 
    ((data.itemStack.typeId == "ratskins:truffle") ||
    (data.itemStack.typeId == "ratskins:truffle_odd") ||
    (data.itemStack.typeId == "ratskins:truffle_hearty"))
    )  {
        system.run(() => ratBreed(data.player, data.target, data.itemStack));
        
    }
}
})



world.afterEvents.entitySpawn.subscribe((entityEvent) => {
    if (entityEvent && entityEvent.entity) {
        const entity = entityEvent.entity
        if(((entity.typeId == "minecraft:cat")||(entity.typeId == "minecraft:cat")) && (Math.random()>0.5)) {
            const rat = entityEvent.entity.dimension.spawnEntity("ratskins:rat",entityEvent.entity.location);
            testForRatSpawn(rat);
        }

        //hate this,i mean its cool, but needs monsters to spawn rat cause warden runtime id used in colchange
        if(entity.getComponent(EntityComponentTypes.TypeFamily)) {
            if(entity.getComponent(EntityComponentTypes.TypeFamily).hasTypeFamily("monster") && world.getDynamicProperty("ratskins:deny_hostiles"))
            entity.remove();
        }
        if(entity.typeId == "ratskins:rat")
        {
            //testForRatSpawn(entity);
        }
    }
});


//CUSTOM COMMANDS BB
world.beforeEvents.chatSend.subscribe((eventData) => {
	const player = eventData.sender;
	switch (eventData.message) {
		case 'hsp true':
			eventData.cancel = true;
			world.setDynamicProperty("ratskins:deny_hostiles",true);
			break;
		case 'hsp false':
			eventData.cancel = true;
			world.setDynamicProperty("ratskins:deny_hostiles",false)
			break;
		default: break;
	}
});
    
//move rat orders from behaviour to hear maybe
function ratOrder(target, player) {
    if(target.getProperty("ratskins:wounded") == false) {
        target.triggerEvent("ratskins:order_change");
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"${target.nameTag} is now ${ratOrders[target.getProperty("ratskins:order")]}"}]}`);
    } else {
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"${target.nameTag} is hurt! You should revive them!"}]}`);
    }
}

//i forgot why i did this... probably so i could have more control over tame item probabilities?
//just remembered, it's cause i wanna try and move away from entity interaction in behaviours cause it sucks
function ratTame(player, target, itemStack) {
        target.triggerEvent("minecraft:on_tame");
        target.getComponent(EntityComponentTypes.Tameable).tame(player);
        target.nameTag = "Rat";
}

//see above
function ratHeal(player, target, itemStack) {
    const health = target.getComponent(EntityComponentTypes.Health);
    if (health.currentValue != health.defaultValue) {
        health.resetToMaxValue();
        let equipment = player.getComponent(EntityComponentTypes.Equippable);
        let itemStack = equipment.getEquipment(EquipmentSlot.Mainhand);
        itemStack.amount -= 1;
        equipment.setEquipment(EquipmentSlot.Mainhand, itemStack);
    }
}


//the whole book thing was because i wanted to spawn a guide book like some addons do as a test prior to rats
function ratBook(player, target, itemStack) {
	if (player.isSneaking) {

        const tamedEntityComp = target.getComponent(EntityComponentTypes.Tameable);

        if (tamedEntityComp === undefined) {
            return;
        } else {

           const ownerEntity = tamedEntityComp.tamedToPlayer;

           const ownerName = ownerEntity.name;


        if ((itemStack.getDynamicProperty("in_use") == true) && (ownerName == player.name)) {return;}

        const booki = new ItemStack("ratskins:bundle", 1);

        

        const ratBase = target.getProperty("ratskins:base_coat");
        const ratTop = target.getProperty("ratskins:top_coat");

        const ratColR = target.getProperty("ratskins:col_r");
        const ratColG = target.getProperty("ratskins:col_g");
        const ratColB = target.getProperty("ratskins:col_b");

        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        const equipment = player.getComponent(EntityComponentTypes.Equippable);
        if (inventory === undefined || inventory.container === undefined) {
            return;
        }
           booki.setDynamicProperty("ratskins:top_coat", ratTop);
           booki.setDynamicProperty("ratskins:base_coat", ratBase);

           booki.setDynamicProperty("ratskins:col_r", ratColR);
           booki.setDynamicProperty("ratskins:col_g", ratColG);
           booki.setDynamicProperty("ratskins:col_b", ratColB);

           booki.setDynamicProperty("ratskins:owner", ownerEntity.name);
           booki.setDynamicProperty("in_use", true);
           booki.setDynamicProperty("ratskins:rat_name", target.nameTag);
        	booki.setDynamicProperty("ratskins:hp", target.getComponent(EntityComponentTypes.Health).currentValue);

        	const HP = Math.floor((target.getComponent(EntityComponentTypes.Health).currentValue / 8)*100);

           booki.setLore([
                `Name: ${target.nameTag}`, 
               `Owner: ${ownerName}`, 
               `${CoatNames.getColours(0, ratBase)}`, 
               `${CoatNames.getColours(1, ratTop)}`
           ]);


           //STOP KILLING THE BABY
           target.kill();

           equipment.setEquipment(EquipmentSlot.Mainhand, booki);
        
           
           target.triggerEvent("ratskins:debug");
        
        }
}};


//sets breeding genetic factors, maybe rework to be more sciencey?
function ratBreed(player, target, itemStack) {

    if(!target.getProperty("ratskins:is_baby") && 
    (player.isSneaking || (!player.isSneaking && target.getComponent(EntityComponentTypes.Inventory).container.getItem(0)))) {

    if(itemStack.typeId == "ratskins:truffle_hearty") {
        target.setProperty("ratskins:breeding_type", 2);
        target.setProperty("ratskins:mut_factor", 0);

        target.setProperty("ratskins:breeding_timer", 100);
    };
    if(itemStack.typeId == "ratskins:truffle_odd") {
        target.setProperty("ratskins:mut_factor", 1);
        target.setProperty("ratskins:breeding_type", 1);
        
        target.setProperty("ratskins:breeding_timer", 100);
    };
    if(itemStack.typeId == "ratskins:truffle") {
        target.setProperty("ratskins:mut_factor", 0);
        target.setProperty("ratskins:breeding_type", 1);
        
        target.setProperty("ratskins:breeding_timer", 100);
    };

    target.addTag("ratskins:custom_breed");
}
}

///wip process to avoid the equipping behaviour cause its jank af in script lmao

function swapItems(player, animal, slot) {
//    let container = player.getComponent(EntityComponentTypes.Inventory).container.get
//  
//
//
}


function dropLoot(animal) {
    //turn inv into an array, then spawn item entities for each obj in array
}


system.runInterval(() => {
    for (const entity of world.getDimension("overworld").getEntities()) {

        testForRatSpawn(entity);

        if (entity.getComponent(EntityComponentTypes.TypeFamily)) {

            if (entity.getComponent(EntityComponentTypes.TypeFamily).hasTypeFamily("rat")) {
                let rat = entity;

                let p = rat.location;

                ///a failed attempt to make rats burrow in and out of houses, was a bit jank but needs coming back to

                ////if (rat.isValid() === true){
                //let range = { maxDistance: 1 };
                //if (!(rat.getBlockFromViewDirection(range) === undefined) ) { 
                //    
                //    let block = rat.getBlockFromViewDirection(range).block;
                //    if((block?.isValid() === true)) {
                //    if (block.getItemStack().typeId == ("minecraft:oak_planks" || "minecraft:oak_log")) {
                //      block.setType("minecraft:oak_slab"); 
                //      block.setPermutation(block.permutation.withState("minecraft:vertical_half", "top"));
                //    }
                //    if (block.getItemStack().typeId == "minecraft:birch_planks") {
                //        block.setType("minecraft:birch_slab"); 
                //        block.setPermutation(block.permutation.withState("minecraft:vertical_half", "top"));
                //      }
                //      if (block.getItemStack().typeId == "minecraft:spruce_planks") {
                //        block.setType("minecraft:spruce_slab"); 
                //        block.setPermutation(block.permutation.withState("minecraft:vertical_half", "top"));
                //      }
                //      if (block.getItemStack().typeId == "minecraft:jungle_planks") {
                //        block.setType("minecraft:jungle_slab"); 
                //        block.setPermutation(block.permutation.withState("minecraft:vertical_half", "top"));
                //      }
                //      if (block.getItemStack().typeId == "minecraft:oak_planks") {
                //        block.setType("minecraft:oak_slab"); 
                //        block.setPermutation(block.permutation.withState("minecraft:vertical_half", "top"));
                //      }
                //    }
                //}
            //}
                
            //wild rats look for containers and attempt to steal, occasionally breaking the chest
                if ((rat.dimension.getBlockBelow(p).isValid() === true) && !rat.getProperty("ratskins:tamed")) {
                 if (rat.dimension.getBlockBelow(p).getComponent(BlockComponentTypes.Inventory)) {
                    let blockContainer = rat.dimension.getBlockBelow(p).getComponent(BlockComponentTypes.Inventory).container;
                    let slot = blockContainer.getItem(Math.floor(Math.random() * blockContainer.size));
                    if(!(slot === undefined)) {
                        //rat.getComponent(EntityComponentTypes.Equippable).setEquipment(EquipmentSlot.Mainhand, slot);
                        blockContainer.swapItems(0, 0, rat.getComponent(EntityComponentTypes.Inventory).container);
                        
                        if(Math.random()>0.9) {rat.dimension.getBlockBelow(p).setType("minecraft:air")}
                    }
                }
            }
            }
            //sends the hamlin guide to the player using tp commands, a bit jank tho :c
            if (entity.getComponent(EntityComponentTypes.TypeFamily).hasTypeFamily("hamlin_guide")) {
                entity.runCommand(`execute at ${entity.getComponent(EntityComponentTypes.Tameable).tamedToPlayer.name} anchored eyes run tp @s ^^^-0.5 facing ${entity.getComponent(EntityComponentTypes.Tameable).tamedToPlayer.name}`);
            }
            if (entity.getComponent(EntityComponentTypes.TypeFamily).hasTypeFamily("player")) {
                let player = entity;

                if (player.getDynamicProperty("ratskins:note_timer") > 0) {
                    player.setDynamicProperty("ratskins:note_timer", player.getDynamicProperty("ratskins:note_timer")-1);
                } 
                if (player.getDynamicProperty("ratskins:note_timer") == 0) { 
                    player.setDynamicProperty("ratskins:note_history", ""); 
                    hamlinPipeUpdate(player.name, true, 0); 
                }

                //checks if hamlin pipe is held and updates the display for eou
                if (player.getComponent(EntityComponentTypes.Equippable).getEquipment(EquipmentSlot.Mainhand)) {
                    if ((player.getComponent(EntityComponentTypes.Equippable).getEquipment(EquipmentSlot.Mainhand).typeId == "ratskins:hamlin_pipe") &&
                    player.isSneaking)  {
                       
                        var nuLookAngle = player.getViewDirection().y;
                        var remapLookAngle;
                
                            if (0.18 < nuLookAngle) {
                                remapLookAngle = 4;
                            }
                            if (0 < nuLookAngle && nuLookAngle < 0.18) {
                                remapLookAngle = 3;
                            }
                                
                            if (-0.18 < nuLookAngle && nuLookAngle < 0) {
                                remapLookAngle = 2;
                            }
                                
                            if (nuLookAngle < -0.18) {
                                remapLookAngle = 1;
                            }

                            hamlinPipeUpdate(player.name, false, remapLookAngle);

                        if (player.getDynamicProperty("ratskins:using_pipe") != 1) {
                            player.setDynamicProperty("ratskins:using_pipe", 1);
                            const hamlin_guide = player.dimension.spawnEntity("ratskins:hamlin_guide", entity.location);
                            hamlin_guide.getComponent(EntityComponentTypes.Tameable).tame(entity);
                    }
                } 
                //used to remove hamlin guide, tidy up
                    if ((player.getComponent(EntityComponentTypes.Equippable).getEquipment(EquipmentSlot.Mainhand).typeId != "ratskins:hamlin_pipe") ||
                    !(player.isSneaking)  && player.getDynamicProperty("ratskins:using_pipe") == 1)
                    {
                        player.setDynamicProperty("ratskins:using_pipe", 0);
                        player.setDynamicProperty("ratskins:note_history", "");
                        player.runCommandAsync(`event entity @e[family=hamlin_guide,r=4] ratskins:despawn`);
                    }
                
            } else if (player.getDynamicProperty("ratskins:using_pipe") == 1){
                {
                    player.setDynamicProperty("ratskins:using_pipe", 0);
                    player.setDynamicProperty("ratskins:note_history", "");
                    player.runCommandAsync(`event entity @e[family=hamlin_guide,r=4] ratskins:despawn`);
                }
            }
        }
    }

    //tidy up, it works but a mess
    if (entity.hasTag("ratskins:custom_breed") && (entity.getProperty("ratskins:breeding_timer") != 0)) {
        entity.setProperty("ratskins:breeding_timer", entity.getProperty("ratskins:breeding_timer")-1);
        const mate = findMate(entity, world.getDimension("overworld").getEntities());
        if (mate == "none" || (mate === undefined)) { 
        } else {
        

        entity.removeTag("ratskins:custom_breed");
        mate.removeTag("ratskins:custom_breed");
    
        const entityLocation = entity.location;
        const mateLocation = mate.location;

        const midPoint = {
            x : calcMid(entityLocation, mateLocation).x,
            y : calcMid(entityLocation, mateLocation).y,
            z : calcMid(entityLocation, mateLocation).z
        }

        const rat = entity.dimension.spawnEntity("ratskins:rat", midPoint);
        entity.setProperty("ratskins:new_entity", false);
        rat.setProperty("ratskins:new_entity", false);
        rat.setProperty("ratskins:new_entity", false);
        const topCoat = Math.random() < 0.5 ? entity.getProperty("ratskins:top_coat") : mate.getProperty("ratskins:top_coat");
        const bottomCoat = Math.random() < 0.5 ? entity.getProperty("ratskins:base_coat") : mate.getProperty("ratskins:base_coat");
  
        rat.setProperty("ratskins:top_coat", topCoat);
        rat.setProperty("ratskins:base_coat", bottomCoat);

        const parentsRgb = blendHex(0, entity, mate, 
            entity.getProperty("ratskins:breeding_type"), 
            mate.getProperty("ratskins:breeding_type"),
            (entity.getProperty("ratskins:mut_factor")+mate.getProperty("ratskins:mut_factor"))*2+1)

        rat.setProperty("ratskins:col_r", parentsRgb.r);
        rat.setProperty("ratskins:col_g", parentsRgb.g);
        rat.setProperty("ratskins:col_b", parentsRgb.b);
        rat.triggerEvent("ratskins:baby_born");

        entity.setProperty("ratskins:breeding_type", 1);
        entity.setProperty("ratskins:mut_factor", 0);
        mate.setProperty("ratskins:breeding_type", 1);
        mate.setProperty("ratskins:mut_factor", 0);

        entity.triggerEvent("ratskins:clear_breeding");
        mate.triggerEvent("ratskins:clear_breeding");
        
        }
    }
        if (entity.hasTag("ratskins:custom_breed") && (entity.getProperty("ratskins:breeding_timer") == 0)){
            entity.removeTag("ratskins:custom_breed");
            entity.triggerEvent("ratskins:clear_breeding");
        }
    }
    },
   2);

//parses notes and runs commands
function hamlinPipeUpdate(player, reset, softUpdateValue) {
    for (const entity of world.getDimension("overworld").getEntities()) {
        if (entity.getComponent(EntityComponentTypes.TypeFamily)) {
            if (entity.getComponent(EntityComponentTypes.TypeFamily).hasTypeFamily("hamlin_guide")) {
                const owner = entity.getComponent(EntityComponentTypes.Tameable).tamedToPlayer;
                if (owner.name == player) {
                    if(softUpdateValue>0)
                    {
                        entity.setProperty("ratskins:suv", softUpdateValue);
                    }
                    var noteHistory = owner.getDynamicProperty("ratskins:note_history");
                    if(noteHistory.charAt(0)!="") {
                        entity.setProperty("ratskins:notes_active",1);
                        const note = parseInt(noteHistory.charAt(0));
                        entity.setProperty("ratskins:note1", parseInt(note));
                    }
                    if(noteHistory.charAt(1)!="") {
                        entity.setProperty("ratskins:notes_active",2);
                        const note = parseInt(noteHistory.charAt(1));
                        entity.setProperty("ratskins:note2", parseInt(note));
                    }
                    if(noteHistory.charAt(2)!="") {
                        entity.setProperty("ratskins:notes_active",3);
                        const note = parseInt(noteHistory.charAt(2));
                        entity.setProperty("ratskins:note3", parseInt(note));
                    }
                    if(noteHistory.charAt(3)!="") {
                        entity.setProperty("ratskins:notes_active",4);
                        const note = parseInt(noteHistory.charAt(3));
                        entity.setProperty("ratskins:note4", parseInt(note));
                    }
                    if(reset){
                        entity.setProperty("ratskins:notes_active",0);
                    }
                        if(noteHistory=="1234") {owner.runCommandAsync(`particle ratskins:phoenix_down ~ ~ ~`);  owner.runCommandAsync(`toggledownfall`);}
                        if(noteHistory=="1243") {owner.runCommandAsync(`particle ratskins:phoenix_down ~ ~ ~`); owner.runCommandAsync(`time add 5000`);}
                        for (const rat of world.getDimension("overworld").getEntities()) {
                            if (rat.getComponent(EntityComponentTypes.TypeFamily) && rat.getComponent(EntityComponentTypes.Tameable)) {
                                if (rat.getComponent(EntityComponentTypes.TypeFamily).hasTypeFamily("rat") && rat.getComponent(EntityComponentTypes.Tameable).isTamed) {
                                    const tamedEntityComp = rat.getComponent(EntityComponentTypes.Tameable);
                            
                                       const ownerEntity = tamedEntityComp.tamedToPlayer;
                            
                                       const ownerName = ownerEntity.name;
                                        if ((calcDist(entity.location, rat.location) < 10) && (ownerName == player))  
                                            {
                                                if(noteHistory=="3341") {
                                                    rat.triggerEvent("ratskins:order_follow");
                                                    ownerEntity.runCommandAsync(`tellraw @s {"rawtext":[{"text":"All nearby rats are now following you"}]}`)
                                                }
                                                if(noteHistory=="3342") {
                                                    rat.triggerEvent("ratskins:order_stay");
                                                    ownerEntity.runCommandAsync(`tellraw @s {"rawtext":[{"text":"All nearby rats are now staying"}]}`)
                                                }
                                                if(noteHistory=="3343") {
                                                    rat.triggerEvent("ratskins:order_harvest");
                                                    ownerEntity.runCommandAsync(`tellraw @s {"rawtext":[{"text":"All nearby rats are now harvesting nearby crops"}]}`)
                                                }
                                                if(noteHistory=="3344") {
                                                    rat.triggerEvent("ratskins:order_store");
                                                    ownerEntity.runCommandAsync(`tellraw @s {"rawtext":[{"text":"All nearby rats are now storing items"}]}`)
                                                }
                                        }
                                    
                                }
                            }
                        }
                    }
            }
        }
    }
}


//used to give rats their coats
function testForRatSpawn(entity) {
    if((entity.typeId === "ratskins:rat" && entity.getProperty("ratskins:new_entity") == true)) {

        entity.setProperty("ratskins:new_entity", false);

        const pickSkin = Math.floor(Math.random()*5);
        if (Math.random >= 0.8) {pickSkin = Math.floor(Math.random()*9);}
        const hexSkin = CoatNames.getColours(2,pickSkin);
        const r = ColConv.hexToRgb(hexSkin).r/255*100;
        const g = ColConv.hexToRgb(hexSkin).g/255*100;
        const b = ColConv.hexToRgb(hexSkin).b/255*100;
  
        entity.setProperty("ratskins:col_r",r);
        entity.setProperty("ratskins:col_g",g);
        entity.setProperty("ratskins:col_b",b);
        }
    }

    //part of breeding, tidy up
function findMate(entity, entities) {
    const potentialMates = [];
    const entityLocation = entity.location;
    for (const otherEntity of entities) {
        if (otherEntity != entity) {
            if (otherEntity.hasTag("ratskins:custom_breed")) {
                potentialMates.push(otherEntity);
                for (const closestMate of potentialMates) {
                    const distance = calcDist(entityLocation, closestMate.location)
                    if (distance <= 2) {
                        return otherEntity;
                    }
                }
                return "none";
            }
        }
    }
}


//mathutils
function calcDist(locationA, locationB) {
    const dx = Math.abs(locationA.x - locationB.x);
    const dy = Math.abs(locationA.y - locationB.y);
    const dz = Math.abs(locationA.z - locationB.z);

    const distanceA = ((dx*dx) + (dy*dy) + (dz+dz));
    const distanceB = (Math.sqrt(distanceA));


    return distanceB;
}

function calcMid(locationA, locationB) {
    const dx = (locationA.x + locationB.x)/2;
    const dy = (locationA.y + locationB.y)/2;
    const dz = (locationA.z + locationB.z)/2;

    return {
        x : dx,
        y : dy,
        z : dz
    }
}

//col utils
function blendHex(mode, hex1, hex2, r1, r2, randomRange) {

    const blendedRgb = {
        r : limit(Math.round((hex1.getProperty("ratskins:col_r")*r1
        +hex2.getProperty("ratskins:col_r")*r2)/(r1+r2)
        +smallRandomness(randomRange*5)), 0, 100),

        g : limit(Math.round((hex1.getProperty("ratskins:col_g")*r1
        +hex2.getProperty("ratskins:col_g")*r2)/(r1+r2)
        +smallRandomness(randomRange*5)), 0, 100),

        b : limit(Math.round((hex1.getProperty("ratskins:col_b")*r1
        +hex2.getProperty("ratskins:col_b")*r2)/(r1+r2)
        +smallRandomness(randomRange*5)), 0, 100),
    };
    
    if (mode==1){    
        blendedRgb = ColConv.rgbToHex(blendedRgb.r, blendedRgb.g, blendedRgb.b);
    };

    return blendedRgb;
}


function smallRandomness(range) {
    return Math.round((Math.random()*2-1)*range);
}

function limit(num, min, max){
    const MIN = min ?? 1;
    const MAX = max ?? 20;
    const parsed = parseInt(num)
    return Math.min(Math.max(parsed, MIN), MAX)
}