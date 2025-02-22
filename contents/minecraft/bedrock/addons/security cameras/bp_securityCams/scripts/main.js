import { EntityComponentTypes, system as s, world as w } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
s.runInterval(() => {
    for (const player of w.getPlayers()) {
        const inv = player.getComponent("inventory");
        const selectedItem = inv.container.getItem(player.selectedSlotIndex);
        if (selectedItem?.typeId === "sec_cams:monitor" || selectedItem?.typeId === "sec_cams:monitor_v2") {
            player.addTag("holding_monitor");
        }
        else if (player.hasTag("holding_monitor") && player.hasTag("using_monitor") || player.hasTag("used_monitor")) {
            player.camera.clear();
            player.removeTag("holding_monitor");
            player.removeTag("used_monitor");
        }
        else { }
        if (player.hasTag("used_monitor")) {
            player.camera.clear();
            player.removeTag("holding_monitor");
            player.removeTag("used_monitor");
        }
        for (const entity of player.dimension.getEntities({ families: ["tileEntity"] })) {
            validateTileEntity(entity);
        }
    }
});
w.beforeEvents.itemUse.subscribe((data) => {
    if (data.itemStack) {
        const { source, itemStack } = data;
        if ((itemStack.typeId == "sec_cams:monitor" || itemStack.typeId == "sec_cams:monitor_v2") && !source.isSneaking) {
            s.run(() => { source.addTag("used_monitor"); openCamForm(source, itemStack); });
        }
    }
});
w.beforeEvents.itemUseOn.subscribe((data) => {
    if (data.itemStack && data.isFirstEvent) {
        const { source, itemStack, block } = data;
        if (itemStack.typeId == "sec_cams:monitor" || itemStack.typeId == "sec_cams:monitor_v2") {
            if (block.typeId == "sec_cams:camera_block" && source.isSneaking) {
                s.run(() => { createCamera(source, itemStack, block); });
            }
            else if (source.isSneaking) {
                s.run(() => { source.addTag("used_monitor"); openCamForm(source, itemStack); });
            }
        }
    }
});
w.afterEvents.playerPlaceBlock.subscribe((data) => {
    const { player, block, dimension } = data;
    if (block.typeId == "sec_cams:camera_block") {
        s.run(() => spawnTileEntity(block));
    }
});
function createCamera(player, monitor, block) {
    updateCams(player, monitor);
    const monitorCams = monitor.getDynamicPropertyIds();
    const newCam = "sec_cams:cam_" + String(monitorCams.length + 1);
    monitor.setDynamicProperty(newCam, { x: block.location.x, y: block.location.y, z: block.location.z });
    let playerContainer = player.getComponent(EntityComponentTypes.Inventory);
    let newMonitor = monitor.getDynamicProperty(newCam);
    playerContainer.container.setItem(player.selectedSlotIndex, monitor);
    //player.runCommandAsync(`say there are ${monitorCams.length} cams.\nNow registering ${newCam} at X:${newMonitor.x}, Y:${newMonitor.y}, Z:${newMonitor.z}`);
}
function openCamForm(player, monitor) {
    updateCams(player, monitor);
    let form = new ActionFormData();
    form.title("Registered Cameras");
    const monitorCams = monitor.getDynamicPropertyIds();
    let monitorCamButtons = [];
    let monitorCamNames = [];
    for (let i = 0; i < monitorCams.length; i++) {
        {
            const monitorCam = monitorCams[i];
            let cam = getTileEntity(player.dimension.getBlock(monitor.getDynamicProperty(monitorCam)));
            if (cam != undefined) {
                let monitorCamButton = form.button(cam.nameTag);
                monitorCamButtons.push(monitorCamButton);
            }
        }
    }
    if (monitorCamButtons.length == 0) {
        form.body("Error: No cameras registered.\n\nRegister a new camera by crouching and using the monitor on a camera.\n ");
    }
    form.button("Cancel");
    form.show(player).then(r => {
        if (monitorCamButtons.length > 0) {
            if (r.canceled)
                return;
            let response = r.selection;
            if (response != undefined && response != monitorCamButtons.length) {
                let cam = getTileEntity(player.dimension.getBlock(monitor.getDynamicProperty(monitorCams[response])));
                if (cam != undefined) {
                    if (monitor.typeId == "sec_cams:monitor") {
                        openCamButtonForm(player, monitor, cam);
                    }
                    else if (monitor.typeId == "sec_cams:monitor_v2") {
                        checkIfCamPresent(player, cam);
                    }
                }
            }
            if (response == monitorCamButtons.length) {
                return;
            }
        }
    }).catch(e => {
        console.error(e, e.stack);
    });
}
function openCamButtonForm(player, monitor, camera) {
    let form = new ActionFormData();
    form.title(`Showing ${camera.nameTag}`);
    form.button("View camera");
    form.button("Adjust camera");
    form.button("Cancel");
    form.show(player).then(r => {
        if (r.canceled)
            return;
        let response = r.selection;
        switch (response) {
            //player.applyDamage(0);
            case 0:
                checkIfCamPresent(player, camera);
                break;
            case 1:
                openCamAdjustForm(player, monitor, camera);
                break;
            case 2:
                openCamForm(player, monitor);
                break;
            default:
                break;
        }
    }).catch(e => {
        console.error(e, e.stack);
    });
}
function openCamAdjustForm(player, monitor, camera) {
    let form = new ModalFormData();
    form.title("Camera Adjust");
    let camName = form.textField("Camera Name: ", camera.nameTag, camera.nameTag);
    let yaw = form.slider("Yaw Angle: ", -90, 90, 5, camera.getProperty("sec_cams:yaw"));
    let pitch = form.slider("Pitch Angle: ", -45, 45, 5, camera.getProperty("sec_cams:pitch"));
    form.show(player).then(r => {
        if (r.canceled)
            return;
        let [camName, yaw, pitch] = r.formValues;
        camera.setProperty("sec_cams:yaw", yaw);
        camera.setProperty("sec_cams:pitch", pitch);
        camera.nameTag = camName;
        openCamButtonForm(player, monitor, camera);
    }).catch(e => {
        console.error(e, e.stack);
    });
}
function checkIfCamPresent(player, cam) {
    player.addTag("using_monitor");
    player.runCommandAsync(`/camera @s fade time 0 0.2 0.2`);
    player.runCommandAsync(`/camera @s set minecraft:free pos ${cam.location.x} ${cam.location.y + 0.5} ${cam.location.z}`);
    player.runCommandAsync(`/camera @s set minecraft:free rot ${cam.getProperty("sec_cams:pitch")} ${cam.getProperty("sec_cams:yaw") + cam.getProperty("sec_cams:dir")}`);
}
function updateCams(player, monitor) {
    const camIdsOld = monitor.getDynamicPropertyIds();
    let camsNew = [];
    for (let i = 0; i < camIdsOld.length; i++) {
        {
            let camLoc = monitor.getDynamicProperty(camIdsOld[i]);
            if (getTileEntity(player.dimension.getBlock(camLoc)) != undefined) {
                camsNew.push(camLoc);
            }
        }
    }
    monitor.clearDynamicProperties();
    camsNew.forEach(camLoc => {
        const newCam = "sec_cams:cam_" + String(monitor.getDynamicPropertyIds().length + 1);
        monitor.setDynamicProperty(newCam, { x: camLoc.x, y: camLoc.y, z: camLoc.z });
    });
    let playerContainer = player.getComponent(EntityComponentTypes.Inventory);
    playerContainer.container.setItem(player.selectedSlotIndex, monitor);
}
function spawnTileEntity(block) {
    const cam = block.dimension.spawnEntity("sec_cams:camera_entity", { x: block.location.x + 0.5, y: block.location.y, z: block.location.z + 0.5 });
    block.setPermutation(block.permutation.withState('sec_cams:placed', true));
    const blockRot = block.permutation.getState("minecraft:cardinal_direction");
    let camRot = 0;
    switch (blockRot) {
        case 'north':
            camRot = 180;
            break;
        case 'east':
            camRot = 270;
            break;
        case 'south':
            camRot = 0;
            break;
        case 'west':
            camRot = 90;
            break;
        default:
            break;
    }
    cam.nameTag = "Camera";
    cam.setProperty("sec_cams:dir", camRot);
}
function getTileEntity(block) {
    if (block == undefined) {
        return;
    }
    const entity = block.dimension.getEntities({ location: { x: block.location.x + 0.5, y: block.location.y, z: block.location.z + 0.5 }, type: "sec_cams:camera_entity", maxDistance: 0.1 })[0];
    if (entity == undefined) {
        block.setType("minecraft:air");
    }
    return entity;
}
function validateTileEntity(entity) {
    const block = entity.dimension.getBlock({ x: entity.location.x - 0.5, y: entity.location.y, z: entity.location.z - 0.5 });
    if (block.isValid()) {
        if (!block.isAir) {
            return;
        }
    }
    entity.remove();
}
