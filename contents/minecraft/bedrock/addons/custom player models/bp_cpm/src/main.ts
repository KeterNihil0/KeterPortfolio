import {world as w, system as s, ButtonState, InputButton, InputInfo, EffectType, EffectTypes, PotionEffectType, Block} from "@minecraft/server";

w.beforeEvents.chatSend.subscribe((data)=>{
    if(data.message.includes(".cpm")) {
        const skinId = Number(data.message.substring(5))
        s.run(()=>{data.sender.setProperty("cpm:skin", skinId); w.sendMessage(String(skinId));})
        data.cancel = true;
    }
})

s.runInterval(()=> {
    addSpeedToPlayer();
},1)

function addSpeedToPlayer() {
    
    let players = w.getPlayers({tags:["transformed"]})
    players.forEach(p => {
        let boats = w.getDimension(p.dimension.id).getEntities({families:["boat"]})
        
        let pv2 = p.inputInfo.getMovementVector();
        let prt = ((p.getRotation().y)/180)*Math.PI
        //p.runCommand(`say .\n${pv2.y*Math.sin(prt)}\n${pv2.x*Math.cos(prt)}\n`)

        let acc_x = Math.round(pv2.x*Math.cos(prt)-pv2.y*Math.sin(prt));
        let acc_z = Math.round(pv2.y*Math.cos(prt)-pv2.x*Math.sin(prt));

        if (((pv2.y > 0)) && (Math.abs(p.getVelocity().x) > 0 || (Math.abs(p.getVelocity().z) > 0))) {acc_z = 1}
        else {acc_z = -1}

        if (+p.getProperty("cpm:acc_z")+acc_z <= 200 && +p.getProperty("cpm:acc_z")+acc_z >= 0) {

            p.setProperty("cpm:acc_z", +p.getProperty("cpm:acc_z") + acc_z);
            p.setProperty("cpm:acc_x",0);
        }

        if (Math.abs(p.getVelocity().x) + Math.abs(p.getVelocity().z) < 0.2 && Math.abs(p.getVelocity().y) == 0) {
            
            p.setProperty("cpm:acc_x", +p.getProperty("cpm:acc_x")+1);

            if (+p.getProperty("cpm:acc_x") > 4) {
                p.setProperty("cpm:acc_z",0);
                p.setProperty("cpm:acc_x",0);
            }
        }

        

        //p.runCommand(`say _\n${Math.abs(p.getVelocity().x) + Math.abs(p.getVelocity().z)}`)
        p.runCommand(`say speed: ${p.getProperty("cpm:acc_z")}`)

        if (+p.getProperty("cpm:acc_z") > 10) {p.addEffect('speed', 15, {amplifier:1,showParticles:false}); p.addEffect('jump_boost', 15, {amplifier:1,showParticles:false})}
        if (+p.getProperty("cpm:acc_z") > 30) {p.addEffect('speed', 15, {amplifier:3,showParticles:false}); p.addEffect('jump_boost', 15, {amplifier:2,showParticles:false})}
        if (+p.getProperty("cpm:acc_z") > 60) {p.addEffect('speed', 15, {amplifier:4,showParticles:false}); p.addEffect('jump_boost', 15, {amplifier:3,showParticles:false})}
        
        if (+p.getProperty("cpm:acc_z") >= 80) {
            p.addEffect('speed', 15, {amplifier:5,showParticles:false}); 
            p.addEffect('jump_boost', 15, {amplifier:4,showParticles:false});
            {
                {
                    p.runCommandAsync(`fill ~-4~-4~-4 ~4~0.5~4 cpm:swater replace water`);
                    p.runCommandAsync(`fill ~-4~-4~-4 ~4~0.5~4 cpm:swater replace cpm:swater`);
                }
                if (w.getDimension(p.dimension.id).getBlock(p.location)?.isLiquid) {
                    p.addEffect('levitation', 5, {amplifier:4,showParticles:false});
                }
            }
        }
    });
}

/** @type {import("@minecraft/server").BlockCustomComponent} */
const SWaterTick = {
    onTick(e) {
        let block = e.block as Block
        block.setType("minecraft:water")
    }
}

w.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "cpm:swater_tick",
        SWaterTick
    );
});