mpos = {x:0,y:0}
var ctx = {};
var clicked_lm = 0;
var viewpos = {x:0,y:0}
var zoom_scale_factor = .05;
var dragging_option={on:false,mode:0,id:1}
dragging_option.mode = 3
var gamecount = 0;
var mainInterval = 0;
var enemyCodeID = 0;
var lastTitle = ""
var title = "Enemy_Code"

mouse_out = true;

var font = new FontFace("test","url(")

var scores = [0,0,0]

const sidesize = 3;
displayed = false;

main_height = 1000;
main_width  = 1000;
bullets = []

sideready = [false,false]
sidecode = []
units = []
bullet_trails = []
const bullet_trail_life = 4;

team1_uservars = {}
team2_uservars = {}

actual_mouse_position = {x:0,y:0}

winweight = 0;
grid = obj.grid
colors = ["blue","red"]
fps = 4

var canvas = document.getElementById('canvas');
if (canvas.getContext) 
{
	ctx = canvas.getContext('2d');
}

var body = document.body
document.body.addEventListener('mousedown', function(){
		if (clicked_lm==0)
		{
			clicked_lm=1;
		}
	}, true); 

	document.body.addEventListener('mouseup', function(){
		if (clicked_lm == 2)
			clicked_lm = 3;
		else
			clicked_lm = 0;
	}, true); 

	var body = document.body
	if (body.addEventListener) {
		// IE9, Chrome, Safari, Opera
		body.addEventListener("mousewheel", MouseWheelHandler, false);
		// Firefox
		body.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
	}


function main(){
	//get sidecodes
	//sidecode[0] = //your sidecode
	readTextFileEnemy("enemy_code.js")
	readTextFileFriend("your_code.js")
	//sidecode[1] = //enemy sidecode

	$("canvas").mousemove(function(e) {
		mouse_out = false;
	    mpos.x = e.pageX - $('canvas').offset().left;
	   	mpos.y = e.pageY - $('canvas').offset().top;

	   	actual_mouse_position = {
	   		x: (mpos.x*zoom_scale_factor)-viewpos.x*zoom_scale_factor,
	   		y: (mpos.y*zoom_scale_factor)-viewpos.y*zoom_scale_factor
	   	}
		})

	$('canvas').mouseout(function(){
		mouse_out = true;
		setTimeout(function(){mouse_out = true;},2)
	})

	document.body.addEventListener('mouseup', function(){
		clicked_lm=3;
	}, true); 

	$("canvas").mousemove(function(e) {
		mpos.x = e.pageX - $('canvas').offset().left;
		mpos.y = e.pageY - $('canvas').offset().top;
	})

	start_game()

	draw();
	//for now, process at 2 fps
	//mainInterval = setInterval(process,1000/fps)

	//Set buttons up
	str = "<div class='button selectAI' id=0><p>Use enemy_code.js</p></div>"
	str += "<div class='button selectAI' id=1><p>Use Random code</p></div>"
	medley.forEach(function(item,ind){
		str+="<div class='button selectAI' id="+(ind+2)+"><p>"+item.name+"</p></div>"
	})

	$('.buttonshere').append(str)
	$('.selectAI').click(function(){
		enemyCodeID = parseInt($(this).attr("id"))
		$('.selected').removeClass("selected")
		$(this).addClass("selected")
	})
}

function makeGridFromObj(obj){
	//guess this isn't needed?
}

function process(){
	//process units
		if (sideready[0] && sideready[1])
		units.forEach(function(unit,ind){
			if (!unit.dead)
			{
				uc = parseCode(sidecode[unit.team],unit.id,unit.team)
				//follow unit commands
				if (unit.ammo==0)
				{
					uc.fire = false
					uc.xspd = 0
					uc.yspd = 0
					unit.reloadtime -= 1
					if (unit.reloadtime==0){
						unit.reloadtime = -1
						unit.ammo = 5
					}
				}
		
				if (uc.fire){
					uc.xspd = 0
					uc.yspd = 0
					//spawn a bullet
					bullets.push({side:unit.team,dir:uc.target_dir,pos:{x:unit.pos.x,y:unit.pos.y},firer:ind,lastpos:{x:unit.pos.x,y:unit.pos.y}})
					unit.ammo -= 1;
					if (unit.ammo ==0){
						unit.reloadtime = 5
					}
				}

				ccstatus = collision_check_grid(unit.pos.x+Math.sign(uc.xspd),unit.pos.y+Math.sign(uc.yspd),ind)
				//console.log("Ccstatus: "+ccstatus)
				if (ccstatus=="true"){
					unit.pos.x+= Math.sign(uc.xspd) 
					unit.pos.y+= Math.sign(uc.yspd) 
				}
				else
				{
				}
			}
			else
			{
				unit.pos.x = 0
				unit.pos.y = 0
			}
		}) 

	//process bullets
		bullets.forEach(function(bullet){
			ld = lengthdir(.3,bullet.dir)
			bullet.lastpos.x=bullet.pos.x
			bullet.lastpos.y=bullet.pos.y


			for (var i=0; i<3; i+=.3){
				newRounded = {x:Math.round(ld.x+bullet.pos.x),y:Math.round(ld.y+bullet.pos.y)}
				cb = collision_for_bullet(newRounded.x,newRounded.y)
				if (cb!=0 && bullet.firer!= (cb-2))
				{
					bullet.destroythis = true;
					if (cb!=1)
					if (units[cb-2].team != bullet.side){
						units[cb-2].dead = true;
					}
				}
				
				if (!bullet.destroythis)
				{
					bullet.pos.x+=ld.x;
					bullet.pos.y+=ld.y;
				}

			}

			bullet_trails.push({start:copy(bullet.lastpos),end:copy(bullet.pos),life:bullet_trail_life,dir:bullet.dir})
		})
	//process bullet trails
		bullet_trails.forEach(function(trail){
			trail.life-=1;
		})

		for(var i=0; i<bullet_trails.length; i++){
			if (bullet_trails[i].life<1){
				bullet_trails.splice(i,1)
				i--;
			}
		}

	//process bullets
		for (var i=0; i<bullets.length; i++){
			if (bullets[i].destroythis){
				bullets.splice(i,1);
				i--
			}
		}

	//process win conditions
		f_sidealive = 0;
		e_sidealive = 0;
		timer += 1;
		if (units.length)
		units.forEach(function(unit){
			if (unit.team==0)
			{
				if (!unit.dead)
				f_sidealive+=1
			}
			else{
				if (!unit.dead)
				e_sidealive+=1
			}
		})

		if (f_sidealive == 0 && e_sidealive == 0 && units.length){
			scores[2]+=1
			displayed = true
			last_wincon = 0
			last_sidewon = 2
			start_game()
		}

		if (f_sidealive==0 && units.length){
			if (displayed == false)
			{	
				displayed = true
				scores[1]+=1
				last_wincon = 0
				last_sidewon = 1
				start_game()
			}
		}
		if (e_sidealive==0 && units.length){
			if (displayed == false)
			{
				last_wincon = 0
				last_sidewon = 0
				scores[0]+=1
				displayed = true
				start_game()
			}
		}

		//tie wincons
			if (timer > 149){
				last_wincon = 1
				last_sidewon = 2
				scores[2]+=1
				displayed = true
				start_game()
			}

		//Domination weights
			units_on_f = 0;
			units_on_e = 0;
			units.forEach(function(unit){
				if (obj.grid[0][unit.pos.x][unit.pos.y][0]==2)
				{
					if (unit.team==0){
						units_on_f +=1
					}
					if (unit.team==1){
						units_on_e -=1
					}
				}
			})


			if (units_on_e!=0 && units_on_f==0)
			{
				winweight +=1
			}

			if (units_on_e==0 && units_on_f!=0)
			{
				winweight -=1
			}


			if (winweight == -10){
				if (displayed == false)
				{
					last_wincon = 1
					last_sidewon = 0
					scores[0]+=1
					displayed = true
					start_game()
				}	
				
			}

			if (winweight == 10){
				if (displayed == false)
				{
					last_wincon = 1
					last_sidewon = 1
					scores[1]+=1
					displayed = true
					start_game()
				}	
			}
}

function collision_check_grid(x,y,id){
	status = true
	units.forEach(function(unit,ind2){
		if (ind2!=id)
		{
			if (unit.pos.x==x && unit.pos.y == y)
			{
				status = false
			}
		}
	})

	if (obj.grid[0][x][y][0]==1){
		status = false;
		
	}
	//console.log("status:"+status)
	return status;
}

function collision_for_bullet(x,y){
	var stat_bul = 0
	units.forEach(function(unit,ind){
		if (unit.pos.x==x && unit.pos.y == y)
		{
			stat_bul = ind+2
		}
	})

	if (obj.grid[0][x][y][0]==1){
		stat_bul = 1;
	}
	return parseInt(stat_bul);
}

function start_game(){
	timer = 0
	if (mainInterval){
		clearInterval(mainInterval)
		mainInterval = setInterval(process,1000/fps)
	}
	else{
		mainInterval = setInterval(process,1000/fps)
	}
	units = []
	bullets = []
	bullet_trails = []
	winweight = 0
	f_sidealive = sidesize
	e_sidealive = sidesize
	displayed = false;
	team1_uservars = {}
	team2_uservars = {}
	for (var i=0; i<(sidesize*2); i++){
		var newunit = {}
		if (i<sidesize){
			newunit.team = 0
		}
		else{
			newunit.team = 1
		}
		newunit.pos = {x:0,y:0}
		newunit.ammo = 5
		newunit.id = i%sidesize
		newunit.dead = false;
		units.push(newunit)
	}

	//position units correctly
	units.forEach(function(unit){
		coords = JSON.parse(obj.idObj[3][unit.id+1+unit.team*3][0])
		unit.pos.x = coords[0]
		unit.pos.y = coords[1]
	})
	gamecount +=1
	if (Math.random()>.9)
	fps += 1

	//load selected enemy code into enemycode
		lastTitle = title;
		if (enemyCodeID==0){
			readTextFileEnemy("enemy_code.js")
			title = "Enemy_Code"
		}
		if (enemyCodeID!=0){
			//use an enemyCode from the Medley.js file
			if (enemyCodeID==1){
				tc = Math.floor(Math.random()*medley.length);
				startingCode = medley[tc].code;
				title = medley[tc].name

				$('.selected-random').removeClass('selected-random')

				$(".selectAI").each(function(){
					tt = parseInt($(this).attr("id"))-2

					if (tt == tc){
						$(this).addClass("selected-random")
					}
				})
			}
			else{
				startingCode = medley[enemyCodeID-2].code;
				title = medley[enemyCodeID-2].name
			}
			var frontTrimmed = startingCode.toString().split("function(){")[1]
			sidecode[1] = frontTrimmed.slice(0, -1)
			sideready[1] = true;
		}
}

function draw(){
	//draw canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle="white"
	ctx.fillRect(0,0,canvas.width,canvas.height)

	//console.log(dragging_option.on)
	if (dragging_option.mode==3 && dragging_option.on){
		viewpos.x=dragging_option.vpos_start.x-((dragging_option.drag_start.x-mpos.x)*(Math.pow(zoom_scale_factor,1/2)))
		viewpos.y=dragging_option.vpos_start.y-((dragging_option.drag_start.y-mpos.y)*(Math.pow(zoom_scale_factor,1/2)))

		limit_viewpos();
	}

	//move the view
		if (clicked_lm == 1 && !mouse_out){
			if (dragging_option.on==false)
			{
				dragging_option.on=true;
				//dragging_option.mode=3;
				dragging_option.drag_start 		= JSON.parse(JSON.stringify(mpos))
				dragging_option.vpos_start 		= JSON.parse(JSON.stringify(viewpos))
				dragging_option.actual_start	= JSON.parse(JSON.stringify(actual_mouse_position))
			}

			clicked_lm = 2;
		}

	if (clicked_lm == 3){
		clicked_lm = 0
		dragging_option.on = false;
	}

	//draw positions of walls
		ctx.fillStyle = "black"
		obj.grid[0].forEach(function(gridX,xx){
			gridX.forEach(function(gridCell,yy){
				if (gridCell[0]==1)
				ctx.fillRect(
					(xx/zoom_scale_factor)+viewpos.x,
					(yy/zoom_scale_factor)+viewpos.y,
					1/zoom_scale_factor,
					1/zoom_scale_factor
				)
			})
		})
	//draw positions of bullets
		bullets.forEach(function(bullet){
			ld = lengthdir(1/zoom_scale_factor,bullet.dir)
			ld2 = lengthdir(0.2,bullet.dir+90)
			ld_w = lengthdir(.1,bullet.dir+90)
			ld_h = lengthdir(.3,bullet.dir)
			ctx.beginPath();
			ctx.moveTo(((bullet.pos.x+0.5+ld2.x)/zoom_scale_factor)+viewpos.x,((bullet.pos.y+0.5+ld2.y)/zoom_scale_factor)+viewpos.y)
			ctx.lineTo((((bullet.lastpos.x+0.5+ld2.x))/zoom_scale_factor)+viewpos.x,(((bullet.lastpos.y+0.5+ld2.y))/zoom_scale_factor)+viewpos.y)
			ctx.strokeStyle = "orange"
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(((bullet.pos.x+0.5+ld2.x+ld_w.x+ld_h.x)/zoom_scale_factor)+viewpos.x,((bullet.pos.y+0.5+ld2.y+ld_w.y+ld_h.y)/zoom_scale_factor)+viewpos.y)
			ctx.lineTo(((bullet.pos.x+0.5+ld2.x-ld_w.x+ld_h.x)/zoom_scale_factor)+viewpos.x,((bullet.pos.y+0.5+ld2.y-ld_w.y+ld_h.y)/zoom_scale_factor)+viewpos.y)
			ctx.lineTo(((bullet.pos.x+0.5+ld2.x-ld_w.x-ld_h.x)/zoom_scale_factor)+viewpos.x,((bullet.pos.y+0.5+ld2.y-ld_w.y-ld_h.y)/zoom_scale_factor)+viewpos.y)
			ctx.lineTo(((bullet.pos.x+0.5+ld2.x+ld_w.x-ld_h.x)/zoom_scale_factor)+viewpos.x,((bullet.pos.y+0.5+ld2.y+ld_w.y-ld_h.y)/zoom_scale_factor)+viewpos.y)
			ctx.closePath();
			ctx.fillStyle = "orange"
			ctx.fill();
		})
	//draw positions of units
		if (units.length)
		units.forEach(function(unit){
			if (!unit.dead)
			{	
				ctx.fillStyle = "black"
				ctx.fillStyle = colors[unit.team]
				ctx.beginPath()
				ctx.arc(((unit.pos.x+0.5)/zoom_scale_factor)+viewpos.x,((unit.pos.y+0.5)/zoom_scale_factor)+viewpos.y,0.5/zoom_scale_factor,0,2*Math.PI)
				ctx.fill();
			}
		})

	//draw bullet trails
		bullet_trails.forEach(function(trail){
			rmap = (trail.life/bullet_trail_life)
			amapped = lerp(0.1,1,rmap)
			ld2 = lengthdir(0.2,trail.dir+90)
			ctx.strokeStyle = "rgba(0,90,255,"+((Math.floor(amapped)*100)/100)+")"
			ctx.beginPath();
			ctx.moveTo((trail.start.x+0.5+ld2.x)/zoom_scale_factor+viewpos.x,(trail.start.y+0.5+ld2.y)/zoom_scale_factor+viewpos.y)
			ctx.lineTo((trail.end.x+0.5+ld2.x)/zoom_scale_factor+viewpos.x,(trail.end.y+0.5+ld2.y)/zoom_scale_factor+viewpos.y)
			ctx.stroke()
		})

	//draw mouse position
	// ctx.fillStyle = "black"
	// 	ctx.fillText("X: "+Math.floor(actual_mouse_position.x)+","+Math.floor(actual_mouse_position.y),mpos.x,mpos.y)

	//draw win sheet
		ctx.font = "32px RobotoSlab"
		ctx.textAlign = "end"
		ctx.fillStyle = "blue"
		ctx.fillText(scores[0],canvas.width/2 - 32,65)
		ctx.fillStyle = "black"
		ctx.textAlign = "center"
		ctx.fillText("|",canvas.width/2 - 20,65)
		ctx.textAlign = "center"
		ctx.fillStyle = "green"
		ctx.fillText(scores[2],canvas.width/2,65)
		ctx.fillStyle = "black"
		ctx.textAlign = "center"
		ctx.fillText("|",canvas.width/2 + 20,65)
		ctx.textAlign = "start"
		ctx.fillStyle = "red"
		ctx.fillText(scores[1],canvas.width/2 + 32,65)

		ctx.fillStyle = "black"
		ctx.textAlign = "center"
		ctx.fillText("Scores:",canvas.width/2,30)

		str = "Last game: "
		if (gamecount!=1){
			if (last_sidewon==0){
				str+= "You "
			}
			if (last_sidewon==1){
				str += lastTitle+" "
			}
			if (last_sidewon==2){
				str += "No one "
			}

			if (last_wincon == 0){
				str += "won by slaughter"
			}
			else
			{
				str += "won by domination"
			}
		}

		ctx.font = "16pt RobotoSlab"
		ctx.fillText(str,canvas.width/2,90)


	requestAnimationFrame(draw);
}

function limit_viewpos(){
	viewpos.x = -Math.max(-viewpos.x,0);
	viewpos.y = -Math.max(-viewpos.y,0);
	viewpos.x = -Math.min((-viewpos.x),(main_width/zoom_scale_factor)-(canvas.width))
	viewpos.y = -Math.min((-viewpos.y),(main_height/zoom_scale_factor)-(canvas.height))

	has_moved = true;
}

function detectmob() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}
window.onresize = function(event) {
resizeDiv();
}

function resizeDiv() {

	vpw = $(window).width();
	vph = $(window).height();

	var m=detectmob()

	canvas.width = 1066
	canvas.height = vph*.8
}

function MouseWheelHandler(e) {
	//disable
	return 
	// cross-browser wheel delta
	var e = window.event || e; // old IE support
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

	delta = -delta;

	if (zoom_scale_factor<.3)
		moving = false
	else
		moving = true;

	console.log("moving: "+moving)

	if (moving)
	{
		viewpos.x -= mpos.x;
		viewpos.y -= mpos.y;
	
		viewpos.x *= zoom_scale_factor;
		viewpos.y *= zoom_scale_factor;
	}

	zoom_scale_factor += delta/10

	if (moving)
	{
		viewpos.x /= zoom_scale_factor;
		viewpos.y /= zoom_scale_factor;
	}

	zoom_scale_factor = Math.min(zoom_scale_factor,1)
	zoom_scale_factor = Math.max(zoom_scale_factor,.001);


	if (moving)
	{
		viewpos.x += mpos.x;
		viewpos.y += mpos.y;
	}

	limit_viewpos()
}

function parseCode(code,id,team){
	var friendly_units = []
	var enemy_units = []
	var in_varlist = {}
	in_varlist.friendly_units = []
	in_varlist.enemy_units = []
	units.forEach(function(unit){
		if (unit.team == team){
			in_varlist.friendly_units.push(unit)
		}
		if (unit.team !=team){
			in_varlist.enemy_units.push(unit)
		}
	})
	
	in_varlist.field = obj;
	in_varlist.id = id;
	in_varlist.point_distance = point_distance;
	in_varlist.point_direction = point_direction;
	in_varlist.bullets = bullets;
	in_varlist.raycast = raycast_for_game;
	in_varlist.gametime = timer;
	if (team==0)
		in_varlist.uservars = team1_uservars;	
	else
		in_varlist.uservars = team2_uservars;

	in_varlist.dtr = dtr;
	in_varlist.rtd = rtd;
	in_varlist.angledif = angle_difference;
	in_varlist.lengthdir = lengthdir;
	in_varlist.total_units = copy(units)
	var out_varlist = {}
	var er = false
	var erstr = "";
	try {
	var newf = new Function('inlist',"\
		var target_dir = 0;\
		var xspd = 0;\
		var yspd = 0;\
		var total_units = inlist.total_units;\
		var uservars = inlist.uservars;\
		var field = inlist.field;\
		var friendly_units = inlist.friendly_units;\
		var enemy_units = inlist.enemy_units;\
		var this_unit_id = inlist.id;\
		var bullets = inlist.bullets;\
		var _point_distance = function(x1,y1,x2,y2){return inlist.point_distance({x:x1,y:y1},{x:x2,y:y2});};\
		var _point_direction = function(x1,y1,x2,y2){return -inlist.rtd(inlist.point_direction({x:x1,y:y1},{x:x2,y:y2}));};\
		var _angledif = inlist.angledif;\
		var _lengthdir = inlist.lengthdir;\
		var pathfind_mode = false;\
		var match_time = inlist.gametime;\
		var dest = {x:0,y:0};\
		var fire = false;\
		var raycast = inlist.raycast;\
		var teams = [friendly_units,enemy_units];\
				"+code+";\n return JSON.parse(JSON.stringify({target_dir:target_dir,fire:fire,xspd:xspd,yspd:yspd,uservars:uservars,dest:dest,pfmode:pathfind_mode}))")

		out_varlist = newf(in_varlist)

		if (team == 0)
		{
			team1_uservars = out_varlist.uservars;
		}
		if (team == 1)
		{
			team2_uservars = out_varlist.uservars;
		}

		if (out_varlist.pfmode){
			spds = pathfind(units[id+(team*sidesize)].pos,out_varlist.dest)
			out_varlist.xspd = spds.x;
			out_varlist.yspd = spds.y;
		}

		return out_varlist;
	} catch(error)
	{
		er = true; 
		er_Ret = function(vv){return vv.error}
		erstr = er_Ret({error:error+" "})
		console.error(error)
	}
}
$(document).ready(resizeDiv)
$(document).ready(main)

function readTextFileFriend(file)
{
	start = yourcode.toString().split("//#$%")[1]
    var allText = start.split("%$#")[0]
    sidecode[0] = allText
    sideready[0] = true;

}

function readTextFileEnemy(file)
{
    start = enemycode.toString().split("//#$%")[1]
    var allText = start.split("%$#")[0]
    sidecode[1] = allText
    sideready[1] = true;

}

function pathfind(start,end){
	var cells = grid[0]
	end.cost = 0
	to_eval = [copy(end)]
	has_eval = []
	i=0;
	//build flood
		do{
			i+=1
			old_to_eval = copy(to_eval)
			to_eval = []
			old_to_eval.forEach(function(cell){
				has_eval.push(copy(cell))

				var nextCell = {x:cell.x-1,y:cell.y}
				if (!cellArrayContains(has_eval,nextCell) && !cellArrayContains(to_eval,nextCell) && gridCellClear(nextCell))
				{
					nextCell.cost = cell.cost+1
					to_eval.push(copy(nextCell))
				}

				nextCell = {x:cell.x+1,y:cell.y}
				if (!cellArrayContains(has_eval,nextCell) && !cellArrayContains(to_eval,nextCell) && gridCellClear(nextCell))
				{
					nextCell.cost = cell.cost+1
					to_eval.push(copy(nextCell))
				}

				nextCell = {x:cell.x,y:cell.y-1}
				if (!cellArrayContains(has_eval,nextCell) && !cellArrayContains(to_eval,nextCell) && gridCellClear(nextCell))
				{
					nextCell.cost = cell.cost+1
					to_eval.push(copy(nextCell))
				}

				nextCell = {x:cell.x,y:cell.y+1}
				if (!cellArrayContains(has_eval,nextCell) && !cellArrayContains(to_eval,nextCell) && gridCellClear(nextCell))
				{
					nextCell.cost = cell.cost+1
					to_eval.push(copy(nextCell))
				}
			})
		}
		while (i<1000 && !cellArrayContains(has_eval,start))
	//create gradient
		grad = []
		for (i=0; i<grid[0].length; i++){
			grad[i] = []
			for (ii=0; ii<grid[0][0].length; ii++){
				grad[i][ii] = 1000000
			}
		}
		has_eval.forEach(function(cell){
			grad[cell.x][cell.y] = cell.cost
		})

	//follow gradient
		inSpds = {x:0,y:0}
		cheapest = 1000
		if (grad[start.x+1][start.y] < cheapest){
			cheapest = grad[start.x+1][start.y]
			inSpds = {x:1,y:0}
		}
		if (grad[start.x][start.y+1] < cheapest){
			cheapest = grad[start.x][start.y+1]
			inSpds = {x:0,y:1}
		}
		if (grad[start.x-1][start.y] < cheapest){
			cheapest = grad[start.x-1][start.y]
			inSpds = {x:-1,y:0}
		}
		if (grad[start.x][start.y-1] < cheapest){
			cheapest = grad[start.x][start.y-1]
			inSpds = {x:0,y:-1}
		}	
	return inSpds
}

function cellArrayContains(cellarray,tgt){
	status = 0
	cellarray.forEach(function(cell){
		if (cell.x==tgt.x && cell.y==tgt.y){
			status = 1;
		}
	})

	return parseInt(status)
}

function manhattan(start,end){
	return Math.abs(start.x-end.x)+Math.abs(start.y-end.y);
}

function gridCellClear(cell){
	cell.x = Math.max(1,cell.x)
	cell.y = Math.max(1,cell.y)

	if (grid[0][cell.x][cell.y][0]!=1)
		return true

	return false
}

function raycast_for_game(start,end){
	dir = point_direction(start,end)
	dis = point_distance(start,end)

	ld = lengthdir(.3,dir)
	xx = start.x;
	yy = start.y;

	var sta = 0

	for (var i=0; i<dis; i+=.3){
		var newRounded = {x:Math.round(ld.x+xx),y:Math.round(ld.y+yy)}
		var cb = col_for_rc(obj,newRounded.x,newRounded.y)
		if (cb!=0)
		{
			sta = cb
		}

		xx += ld.x
		yy += ld.y
	}
	return sta

	function col_for_rc(ar,x,y){
		status = 0
		if (obj.grid[0][x][y][0]==1){
			status = 1;
		}
		return parseInt(status);
	}
}