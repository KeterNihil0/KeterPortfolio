scoreboard objectives add ticks dummy
scoreboard objectives add events dummy

scoreboard players set 10s ticks 200

## World Timer/Clock
### Increment +1 tick
scoreboard players add Timer ticks 1
### Apply current ticks passed to all events
scoreboard players operation * events = Timer ticks


## Speed Effect (every 30s)
scoreboard players operation SpeedEffect events %= 10s ticks
execute if score SpeedEffect events matches 0 run event entity @e[family=rodent] ratskins:emit_particle

