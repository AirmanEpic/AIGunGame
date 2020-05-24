// please don't look at how your enemys' code is written! That's no fair!
medley = [
	{name:"AIrman's STDAI Hard",code:function(){
			tgt = enemy_units[this_unit_id]

			target_dir = -1
			fire = false
			enemy_units.forEach(function(unit){
				rc = raycast(friendly_units[this_unit_id].pos,unit.pos)
				if (rc==0 && target_dir==-1){
					target_dir = inlist.point_direction(friendly_units[this_unit_id].pos,unit.pos)
					fire = true;
				}

			})

			if (!tgt.dead)
			{
				pathfind_mode = true
				dest.x = tgt.pos.x
				dest.y = tgt.pos.y
				// rc = raycast(friendly_units[this_unit_id].pos,tgt.pos)
				// fire = false
				// if (rc==0){
				// 	target_dir = inlist.point_direction(friendly_units[this_unit_id].pos,tgt.pos)
				// 	fire = true;
				// }
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
		}
	},
	{name:"AIrman's STDAI Basic",code:function(){
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
		}
	},
	{name:"Airman's Contender 23 May 2020",code:function(){
			cover_blocks = [{x:21,y:13},{x:21,y:16},{x:21,y:18},{x:21,y:21},{x:27,y:14},{x:25,y:14},{x:25,y:8},{x:27,y:8},{x:25,y:20},{x:27,y:20},{x:25,y:26},{x:27,y:26},{x:31,y:13},{x:31,y:16},{x:31,y:18},{x:31,y:21}]
			def_pos = [{x:22,y:12},{x:22,y:22},{x:20,y:17,a:true},{x:30,y:12},{x:30,y:22},{x:32,y:17,a:true}]
			if (!uservars.firedat){
				uservars.firedat = [[0,0,0],[0,0,0],[0,0,0]]
				uservars.tdp_armed = [false,false,false]
			}

			//"master" unit is the controller
				masterUnit = -1;
				if (masterUnit == -1 && !friendly_units[2].dead)
				{
					masterUnit = 2
				}

				if (masterUnit == -1 && !friendly_units[1].dead)
				{
					masterUnit = 1
				}

				if (masterUnit == -1 && !friendly_units[0].dead)
				{
					masterUnit = 0
				}

			if (this_unit_id == masterUnit){
				uservars.firedat.forEach(function(fdva){
					fdva.forEach(function(i,ind){
						if (i!=0 && !enemy_units[ind].dead){
							uservars.firedat[this_unit_id][ind] = Math.max(uservars.firedat[this_unit_id][ind]-3.5,0)
						}
					})
				})

			}

			tup = friendly_units[this_unit_id].pos 

			tgt = enemy_units[this_unit_id]

			//fire at any visible enemies, so long as they haven't recently been fired at. If an enemy is visible and has been fired at, move until it's not visible.
			//if we have superiority, send one of the living units into the center and the rest should hide.

			//closest unit in general
				closest_dis = 10000
				enemy_units.forEach(function(unit,ind){
					dis = inlist.point_distance(tup,unit.pos)
					if (dis<closest_dis && !unit.dead){
						closest_enemy = ind
						closest_dis = dis
					}
				})

			//target closest visible enemy
			visibles = []
				closest_dis = 10000
				enemy_units.forEach(function(unit,ind){
					rc = raycast(friendly_units[this_unit_id].pos,unit.pos)
					if (rc==0)
					{
						dis = inlist.point_distance(tup,unit.pos)
						if (dis<closest_dis){
							tgt = unit
							closest_dis = dis
							visibles[ind] = 1;
						}
					}
					else{
						visibles[ind] = 0
					}
				})

			//fire at closest enemy and label them as fired at
				if (uservars.firedat[this_unit_id][tgt.id]==0){
					if (closest_dis<9999)
					{
						target_dir = inlist.point_direction(friendly_units[this_unit_id].pos,tgt.pos)
						fire = true;
						uservars.firedat[this_unit_id][tgt.id] = closest_dis
					}
				}
				else{
					enemy_units.forEach(function(unit,ind){
						if (visibles[ind]==1 && uservars.firedat[this_unit_id][ind]==0){
							tgt = unit
							target_dir = inlist.point_direction(friendly_units[this_unit_id].pos,tgt.pos)
							fire = true;
							uservars.firedat[this_unit_id][tgt.id] = inlist.point_distance(tup,unit.pos)
						}
					})
				}

			//if no one is possible to shoot at, take cover.
				canShootAtSomeone = false;
				takeCover = false
				enemy_units.forEach(function(unit,ind){
					//if it's the case that they're both visible and firedat !=0, THEN take cover.
					if (uservars.firedat[this_unit_id][ind]!=0 && !enemy_units[ind].dead){
						takeCover = true
					}

				})

			if (friendly_units[this_unit_id].ammo==1){
				//take cover no matter what if you're low on ammo
				takeCover = true
			}

			//count alive enemies
				e_alive = 0
				enemy_units.forEach(function(unit,ind){
					if (!unit.dead)
						e_alive += 1
				})

				f_alive = 0
				friendly_units.forEach(function(unit,ind){
					if (!unit.dead)
						f_alive += 1
				})

			if (f_alive == 1){
				//remove the centercon defenses; these are now useless.
				for (var i=0; i<def_pos.length; i++){
					if (def_pos[i].a){
						def_pos.splice(i,1)
						i--
					}
				}
			}

			//take cover if necessary.
			take_defensive_position = false
				if (takeCover){
					uservars.tdp_armed[this_unit_id] = true;
					if (this_unit_id!=2 || (this_unit_id==2 && f_alive==e_alive)){
						//find closest wall
						closest_dis = 10000
						closest_id = 0
						cover_blocks.forEach(function(block,ind){
							dis = inlist.point_distance(block,tup)
							if (dis<closest_dis){
								closest_dis = dis
								closest_id = ind
							}
						})

						//console.log("Closest wall: "+JSON.stringify(cover_blocks[closest_id]))

						//take cover from the nearest enemy using this block.
						dis = 1
						do {
							dir = inlist.point_direction(cover_blocks[closest_id],enemy_units[closest_enemy].pos)
							ld = _lengthdir(dis,dir+180)
							tgtx = cover_blocks[closest_id].x + Math.round(ld.x)
							tgty = cover_blocks[closest_id].y + Math.round(ld.y)
							dis+=1
						}
						while (obj.grid[0][tgtx][tgty][0]==1 && dis<5)
					
						if (obj.grid[0][tgtx][tgty][0]!=1)
						{
							pathfind_mode = true
							dest.x = tgtx
							dest.y = tgty
						}
					}
					else{
						//if unit 0 is ordered to take cover and the team has numberical superiority, he goes for the center instead. This will be superceded by fire orders.
						pathfind_mode = true
						dest.x = 26
						dest.y = 17
					}

					//reload!
					if (friendly_units[this_unit_id].ammo==1){
						safe = true
						visibles.forEach(function(v,ind){
							if (v!=0)
								safe = false
						})
						target_dir = 0 
						if (safe==true)
						fire = true;
					}
				}
				else{
					//only if none of these conditions are met do we hunt an enemy
					// right now we stick with aggro
						tgt = enemy_units[this_unit_id]
						if (!tgt.dead)
						{
							pathfind_mode = true
							dest.x = tgt.pos.x
							dest.y = tgt.pos.y
						}else{
							pathfind_mode = true
							dest.x = 26
							dest.y = 17
						}
						//but if we're ready to, take cover first!
						if (uservars.tdp_armed[this_unit_id])
							take_defensive_position = true;

						if (take_defensive_position){
							//find nearest defensive position
							closest_dis = 10000
							closest_id = 0
							def_pos.forEach(function(block,ind){
								dis = inlist.point_distance(block,tup)
								pos_occ = false
								friendly_units.forEach(function(unit){
									if (unit.pos.x==block.x && unit.pos.y==block.y && unit.id!=this_unit_id)
										pos_occ = true;
								})
								if (dis<closest_dis && !pos_occ){
									closest_dis = dis
									closest_id = ind
								}
							})

							dest.x = def_pos[closest_id].x
							dest.y = def_pos[closest_id].y
						}

				}


			if (Math.random()>.99){
				pathfind_mode = false
				yspd = Math.sign(Math.random()-.5)
			}
		}
	},
	{name:"JBax's Contender 23 May 2020",code:function(){
			if (typeof uservars.initialized == 'undefined')
		    {
		        uservars.initialized = true;
		        uservars.turn = 0;
		        uservars.mode = [1, 1, 1];
		    }
		 
		    this_unit = friendly_units[this_unit_id];
		    pos = this_unit.pos;
		    mode = 0;
		    uservars.turn++;
		 
		    //decide if we should defend or attack
		    if (uservars.turn > 50)
		    {
		        uservars.mode = [0, 0, 0];
		        console.log("match has gone on for too long - changing mode to all-out attack");
		    }
		 
		    //set battle mode
		    mode = uservars.mode[this_unit_id];
		 
		    if (mode == 0)
		    {
		        //search and destroy
		        //find closest enemy and target (if shootable, prefer that)
		        var enemy_distance = -1;
		        var closest_enemy, closest_enemy_shootable, target;
		        for (var i = 0; i < 3; i++)
		        {
		            var check_distance = _point_distance(pos.x, pos.y, enemy_units[i].pos.x, enemy_units[i].pos.y);
		            if (check_distance < enemy_distance || enemy_distance == -1)
		            {
		                enemy_distance = check_distance;
		                closest_enemy = enemy_units[i];
		                if (!raycast(pos, closest_enemy.pos))
		                {
		                    closest_enemy_shootable = closest_enemy;
		                }
		            }
		        }
		        if (closest_enemy_shootable != null)
		            target = closest_enemy_shootable;
		        else
		            target = closest_enemy;
		 
		        //can we shoot our target?
		        if (!raycast(pos, target.pos))
		        {
		            //shoot
		            pathfind_mode = false;
		            target_dir = (Math.atan2(target.pos.y - pos.y, target.pos.x - pos.x) * 180 / Math.PI) * -1;
		            fire = true;
		        }
		        else
		        {
		            //move towards target
		            pathfind_mode = true;
		            dest.x = target.pos.x;
		            dest.y = target.pos.y;
		        }
		    }
		    else
		    {
		        //capture the center
		        //find closest hold point
		        var hold_points =
		        [
		            [22, 11],
		            [22, 23]
		        ];
		        var closest_distance = -1, closest;
		        for (var i = 0; i < hold_points.length; i++)
		        {
		            var check_distance = _point_distance(pos.x, pos.y, hold_points[i][0], hold_points[i][1]);
		            if (check_distance < closest_distance || closest_distance == -1)
		            {
		                closest_distance = check_distance;
		                closest = i;
		            }
		        }
		 
		        //can we shoot anyone? (prefer closest)
		        var enemy_distance = -1, closest_enemy, target;
		        for (var i = 0; i < 3; i++)
		        {
		            var check_distance = _point_distance(pos.x, pos.y, enemy_units[i].pos.x, enemy_units[i].pos.y);
		            if (check_distance < enemy_distance || enemy_distance == -1)
		            {
		                enemy_distance = check_distance;
		                closest_enemy = enemy_units[i];
		                if (!raycast(pos, closest_enemy.pos))
		                {
		                    target = closest_enemy;
		                }
		            }
		        }
		        if (target != null)
		        {
		            pathfind_mode = false;
		            target_dir = (Math.atan2(target.pos.y - pos.y, target.pos.x - pos.x) * 180 / Math.PI) * -1;
		            fire = true;
		        }
		        else
		        {
		            //move
		            if (pos.x != hold_points[closest][0] && pos.y != hold_points[closest][1])
		            {
		                pathfind_mode = true;
		                dest.x = hold_points[closest][0];
		                dest.y = hold_points[closest][1];
		            }
		        }
		    }
		}
	}

]