function enemycode(){//#$%
    tgt = enemy_units[this_unit_id]
    if (!tgt.dead)
    {
        pathfind_mode = true
        dest.x = tgt.pos.x
        dest.y = tgt.pos.y
        rc = raycast(friendly_units[this_unit_id].pos,tgt.pos)
        fire = false
        if (rc==0){
            target_dir = inlist.point_direction(friendly_units[this_unit_id].pos,tgt.pos)
            fire = true;
        }
    }
    else{
        pathfind_mode = true
        dest.x = 26
        dest.y = 17
    }

    if (Math.random()>.9){
        pathfind_mode = false
        yspd = 1
    }
	//%$#
}