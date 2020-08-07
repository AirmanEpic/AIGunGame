**What is this?**
AIGG is short for Artificial Intelligence Gun Game. You are designing an AI which can play other AIs in a very simple, top-down shooter.
Coding is done using JS - to edit your code, look in yourcode.js. 
The game is specifically designed to be as compatible as possible with gamemaker.

**Rules**:
you can win either by holding the center 9 tiles, or by killing everyone on the enemy team
you can't shoot and move at the same time
you can't move and reload at the same time
reloading happens after the 5th bullet in the mag is fired and takes 5 timesteps
bullets travel at 3 cells per step
units travel at 1 cell per step
a single bullet will kill you
Ties happen if both sides' last units shoot each other
Ties can also happen if the clock goes over 150 without a wincon.
The contender AI with the highest winrate over 100 rounds in random mode is the current champion. As of posting this is Airman's 24 May 2020 (Currently Yourcode.js).

**Functions and Variables**
*variables*
target_dir - firing direction
xspd - manually set your x speed
yspd - manually set your y speed
uservars - you can store persistent variables in here like uservars.aggression or something
field - a variable that stores the grid data of the map
friendly_units - a list of friendly units. friendly_units[0] has pos.x and pos.y. If you're red or blue, this will be the case; IE friendly_units will be red units if you're red.
enemy_units - same as above
this_unit_id - integer of the unit being commanded. 
bullets - a list of all bullets in play
pathfind_mode - set to false unless you want to use my pathfinding
fire - binary to indicate if you're shooting or no.
raycast(start:{x,y},end:{x,y}) - gives you a 1 if there's a wall, 0 if it's clear between start and end
dest.x, dest.y - pathfinding end for use with the built-in pathfinding
teams[] - a 2D array of units. teams[0] is allies, teams[1] is enemies, regardless of what side you're on. 
match_time - integer of the match time in steps. If this clock reaches 150, it is a draw.

*functions*
\_point_distance - works the same as GM
\_point_direction - same as above
\_angledif 
\_lengthdir - works the same as GM, but returns an object with .x and .y
