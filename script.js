var config = {
	apiKey: "AIzaSyDnxTnQ58lD1Lc9sUWZBHrB6oOArl4TCYA",
	authDomain: "screen-pong.firebaseapp.com",
	databaseURL: "https://screen-pong.firebaseio.com",
	projectId: "screen-pong",
	storageBucket: "",
	messagingSenderId: "813057726714"
};
firebase.initializeApp(config);

const SPEED = 0.03;

var code;
var database;
var offset = 0;
var cm;
var width;
var height;
var bx = 0, by = 0, bd = 0;
var sizes;
window.onload = function(){
	var mobile = navigator.userAgent.match("Mobile")!=null||navigator.userAgent.match("Linux;")!=null;
	if(!mobile){	
		var b = document.getElementById("ballbg");
		var p1 = document.getElementsByClassName("paddle")[0];
		var p2 = document.getElementsByClassName("paddle")[1];
		var x = 50;
		var y = 50;
		var xv = -1;
		var yv = -.5;
		function update(){
			if(xv < 0){
				p1.style.top = Math.abs(y + yv * (-x / xv)) + "vh";
			}else{
				p2.style.top = Math.abs(y + yv * ((100 - x) / xv)) + "vh";
			}
			if(Math.abs(y + yv * (-x / xv)) > 90)
				p1.style.top = "90vh";
			if(Math.abs(y + yv * (-x / xv)) < 10)
				p1.style.top = "10vh";
			if(Math.abs(y + yv * ((100 - x) / xv)) > 90)
				p2.style.top = "90vh";
			if(Math.abs(y + yv * ((100 - x) / xv)) < 10)
				p2.style.top = "10vh";
			x += xv;
			y += yv;
			if(x<12.5){
				x = 12.5;
				xv *= -1;
			}
			if(x>87.5){
				x = 87.5;
				xv *= -1;
			}
			if(y<2.5){
				y = 2.5;
				yv *= -1;
			}
			if(y>97.5){
				y = 97.5;
				yv *= -1;
			}
			b.style.top = y + "vh";
			b.style.left = x + "vw";
			requestAnimationFrame(update);
		}
		update();
	}else{
		document.getElementById("bgpong").style.display = "none";
	}
}
function left(){
	var f = document.getElementById("fade");
	f.style.opacity = "0";
	setTimeout(function(){
		code = "";
		var letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
		var numbers = "123456789"
		database = firebase.database();
		function generate(){
			code = "";
			for(var i = 0; i < 6; i++)
				code += Math.random()<0.5?letters[Math.floor(Math.random()*letters.length)]:numbers[Math.floor(Math.random()*numbers.length)];
			database.ref(code).once("value", function(e){
				e = e.val();
				if(e == null){
					f.innerHTML = "<div class='subtitle'>Enter this code in the right screen.</div><div class='header'>" + code + "</div>";
					f.style.opacity = "1";
					database.ref(code + "/status").on("value", function(e){
						e = e.val();
						if(e == 1)
							database.ref(code + "/status").set(2);
						if(e == 2){
							var c = document.getElementById("content");
							c.style.opacity = "0";
							var bg = document.getElementById("bgpong");
							bg.style.opacity = "0";
							var size = document.getElementById("sizechecker");
							cm = size.clientHeight;
							height = c.clientHeight / cm;
							width = c.clientWidth / cm;
							database.ref(code + "/p1").set({
								height: height,
								width: width,
								offset: 0,
								x: 0,
								y: 0,
								d: -90
							});
							setTimeout(function(){
								bg.innerHTML = "";
								c.style.opacity = "1";
								c.innerHTML = "<div class='subtitle'>Drag the bar so they line up across the screens.</div><div id='alignment'></div><div id='start' class='header' onclick='start()'>Go!</div>";
								var a = document.getElementById("alignment");
								var sy = 0;
								var mouse = false;
								var atop = 0;
								a.onmousedown = function(e){
									sy = e.clientY / cm;
									mouse = true;
								}
								window.onmousemove = function(e){
									if(mouse)
										a.style.top = atop + (e.clientY / cm - sy) + "cm";
								}
								window.onmouseup = function(e){
									atop = parseFloat(a.style.top.substring(0, a.style.top.length - 2));
									mouse = false;
								}
								database.ref(code).once("value", function(e){
									e = e.val();
									if(e.p1.height < e.p2.height)
										atop = e.p1.height / 2 + e.p2.height - e.p1.height - 0.5;
									else
										atop = e.p2.height / 2 - 0.5;
									offset = atop;
									a.style.top = atop + "cm";
								});
							},500);
						}
						if(e == 4){
							bd = -90;
							var b = document.getElementById("ball");
							database.ref(code + "/p1").on("value", function(e){
								e = e.val();
								if(e.x >= sizes.p1.width){
									bx = e.x;
									by = e.y;
									bd = e.d;
								}
							});
							database.ref(code + "/p1/score").on("value", function(e){
								e = e.val();
								document.getElementById("score").innerHTML = e;
							});
							var paddle = document.getElementById("gpaddle");
							var my = 0;
							window.onmousemove = function(e){
								paddle.style.top = 100 * e.clientY / document.body.clientHeight + "vh";
								my = e.clientY / cm;
							}
							bx = width / 2;
							by = height / 2;
							database.ref(code + "/p1/x").set(width / 2);
							database.ref(code + "/p1/y").set(height / 2);
							var again = false;
							var lastTime = window.performance.now();
							function updateGame(e){
								if(overlap(b, paddle) && bd < 0){
									bd = 90 + Math.random() * 60 - 30;
									database.ref(code + "/p1/d").set(bd);
									bx = 3;
								}
								if(bx < 0.5){
									bd *= -1;
									database.ref(code + "/p1/d").set(bd);
									database.ref(code + "/p2/score").once("value", function(e){
										database.ref(code + "/p2/score").set(e.val() + 1);
									});
								}
								bx += SPEED * (e - lastTime) * Math.sin(bd / 180 * Math.PI);
								by += SPEED * (e - lastTime) * Math.cos(bd / 180 * Math.PI);
								
								if(bx <= sizes.p1.width){
									database.ref(code + "/p1/x").set(bx);
									database.ref(code + "/p1/y").set(by);
									if(bx > sizes.p1.width)
										again = true;
									if(bd > 180)
										bd -= 360;
									if(bd < -180)
										bd += 360;
									if(by < 0.5 && (bd > 90 || bd < -90) && bx < width + 0.5){
										by = 0.5;
										bd = 90 + (90 - bd);
										database.ref(code + "/p1/d").set(bd);
									}
									if(by + 0.5 > sizes.p1.height){
										by = sizes.p1.height - 0.5;
										bd = 90 + (90 - bd);
										database.ref(code + "/p1/d").set(bd);
									}
									if(bx > sizes.p1.width - 0.5 && (by < 0.5 + (sizes.p1.offset - sizes.p2.offset) || by > sizes.p2.height + sizes.p1.offset - sizes.p2.offset - 0.5) && bd > 0){
										bd *= -1;
										database.ref(code + "/p1/d").set(bd);
									}
								}
								
								b.style.top = by + "cm";
								b.style.left = bx + "cm";
/* 								if(again){
									bx += SPEED * (e - lastTime) * Math.sin(bd / 180 * Math.PI);
									by += SPEED * (e - lastTime) * Math.cos(bd / 180 * Math.PI);
									database.ref(code + "/p1/x").set(bx);
									database.ref(code + "/p1/y").set(by);
									again = false;
								} */
								lastTime = e;
								requestAnimationFrame(updateGame);
							}
							requestAnimationFrame(updateGame);
						}
					});
				}else
					generate();
			});
		}
		generate();
	},500);
}
function right(){
	var f = document.getElementById("fade");
	f.style.opacity = "0";
	setTimeout(function(){
		code = "";
		var letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
		var numbers = "123456789"
		database = firebase.database();
		f.innerHTML = "<div class='subtitle'>Enter the code from the left screen here.</div><input class='header' autocapitalize='none' autocorrect='none' autocomplete='none' spellcheck='false'></input>";
		f.style.opacity = "1";
		var i = document.getElementsByTagName("input")[0];
		i.onkeyup = function(){
			if(i.value.length == 6){
				var code = i.value.toUpperCase();
				database.ref(code + "/status").set(1);
				database.ref(code + "/status").on("value", function(e){
					e = e.val();
					if(e == 2){
						var c = document.getElementById("content");
						c.style.opacity = "0";
						var bg = document.getElementById("bgpong");
						bg.style.opacity = "0";
						var size = document.getElementById("sizechecker");
						cm = size.clientHeight;
						height = c.clientHeight / cm;
						width = c.clientWidth / cm;
						database.ref(code + "/p2").set({
							height: height,
							width: width,
							offset: 0
						});
						setTimeout(function(){
							bg.innerHTML = "";
							c.style.opacity = "1";
							c.innerHTML = "<div class='subtitle'>Drag the bar so they line up across the screens.</div><div id='alignment'></div>";
							var a = document.getElementById("alignment");
							var sy = 0;
							var mouse = false;
							var atop = 0;
							a.onmousedown = function(e){
								sy = e.clientY / cm;
								mouse = true;
							}
							var paddle = document.getElementById("gpaddle");
							window.onmousemove = function(e){
								if(mouse)
									a.style.top = atop + (e.clientY / cm - sy) + "cm";
							}
							window.onmouseup = function(e){
								atop = parseFloat(a.style.top.substring(0, a.style.top.length - 2));
								mouse = false;
							}
							database.ref(code).once("value", function(e){
								e = e.val();
								if(e.p1.height < e.p2.height)
									atop = e.p1.height / 2 + e.p2.height - e.p1.height - 0.5;
								else
									atop = e.p2.height / 2 - 0.5;
								offset = atop;
								a.style.top = atop + "cm";
							});
						},500);
					}
					if(e == 3){
						var c = document.getElementById("content");
						c.style.opacity = "0";
						database.ref(code + "/p2/offset").set(parseFloat(document.getElementById("alignment").style.top) - offset);
						sizes = {
							p1: {
								height: 0,
								width: 0
							},
							p2: {
								height: 0,
								width: 0
							}
						}
						setTimeout(function(){
							database.ref(code).once("value",function(e){
								e = e.val();
								sizes.p1 = e.p1;
								sizes.p2 = e.p2;
								c.innerHTML = "<div id='leftscreen' style='height: " + e.p1.height + "cm; width: " + e.p1.width + "cm; bottom: " + (e.p1.offset - e.p2.offset) + "cm; left: " + (-e.p1.width) + "cm' class='screen'></div><div id='midscreen' class='screen'></div><div id='ball'></div><div id='gpaddle' style='right: 2cm'></div><div id='score' class='header' style='left: 1cm'></div>";
								c.style.opacity = "1";
							});
						},500);
					}
					if(e == 4){
						bd = -90;
						var b = document.getElementById("ball");
						database.ref(code + "/p1").on("value", function(e){
							e = e.val();
							if(e.x <= sizes.p1.width){
								bx = e.x;
								by = e.y;
								bd = e.d;
							}
						});
						database.ref(code + "/p2/score").on("value", function(e){
							e = e.val();
							document.getElementById("score").innerHTML = e;
						});
						var paddle = document.getElementById("gpaddle");
						var my = 0;
						window.onmousemove = function(e){
							paddle.style.top = 100 * e.clientY / document.body.clientHeight + "vh";
							my = e.clientY / cm;
						}
						var again = false;
						var lastTime = window.performance.now();
						function updateGame(e){
							if(overlap(b, paddle) && bd > 0){
								bd = -90 + Math.random() * 60 - 30;
								database.ref(code + "/p1/d").set(bd);
								bx = sizes.p1.width + sizes.p1.width - 3;
							}
							if(bx + .5 > sizes.p1.width + sizes.p2.width && bd > 0){
								bd *= -1;
								database.ref(code + "/p1/d").set(bd);
								database.ref(code + "/p1/score").once("value", function(e){
									database.ref(code + "/p1/score").set(e.val() + 1);
								});
							}
							bx += SPEED / 2* (e - lastTime) * Math.sin(bd / 180 * Math.PI);
							by += SPEED / 2 * (e - lastTime) * Math.cos(bd / 180 * Math.PI);
							
							if(bx >= sizes.p1.width){
								database.ref(code + "/p1/x").set(bx);
								database.ref(code + "/p1/y").set(by);
								if(bx < sizes.p1.width)
									again = true;
								if(by < (sizes.p1.offset - sizes.p2.offset) + 0.5 && (bd > 90 || bd < -90) && bx > width - 0.5){
									bd = 90 + (90 - bd);
									database.ref(code + "/p1/d").set(bd);
								}
								if(by + 0.5 > sizes.p2.height + (sizes.p1.offset - sizes.p2.offset)){
									bd = 90 + (90 - bd);
									database.ref(code + "/p1/d").set(bd);
								}
								if(bx < sizes.p1.width + 0.5 && (by < 0.5 + (sizes.p1.offset - sizes.p2.offset) || by > sizes.p2.height + sizes.p1.offset - sizes.p2.offset - 0.5) && bd < 0){
									bd *= -1;
									database.ref(code + "/p1/d").set(bd);
								}
							}
							
							b.style.top = (by - (sizes.p1.offset - sizes.p2.offset)) + "cm";
							b.style.left = (bx - sizes.p1.width) + "cm";
/* 							if(again){
								bx += SPEED * (e - lastTime) * Math.sin(bd / 180 * Math.PI);
								by += SPEED * (e - lastTime) * Math.cos(bd / 180 * Math.PI);
								database.ref(code + "/p1/x").set(bx);
								database.ref(code + "/p1/y").set(by);
								again = false;
							} */
							lastTime = e;
							requestAnimationFrame(updateGame);
						}
						requestAnimationFrame(updateGame);
					}
				});
			}
		}
	},500);
}
function start(){
	var c = document.getElementById("content");
	c.style.opacity = "0";
	database.ref(code + "/status").set(3);
	database.ref(code + "/p1/offset").set(parseFloat(document.getElementById("alignment").style.top) - offset);
	sizes = {
		p1: {
			height: 0,
			width: 0
		},
		p2: {
			height: 0,
			width: 0,
		}
	}
	setTimeout(function(){
		database.ref(code).once("value",function(e){
			e = e.val();
			sizes.p1 = e.p1;
			sizes.p2 = e.p2;
			c.innerHTML = "<div id='midscreen' class='screen'></div><div id='rightscreen' style='height: " + e.p2.height + "cm; width: " + e.p2.width + "cm; bottom: " + (e.p2.offset - e.p1.offset) + "cm' class='screen'></div><div id='ball'></div></div><div id='gpaddle' style='left: 2cm'></div><div id='score' class='header' style='right: 1cm'></div>";
			c.style.opacity = "1";
			database.ref(code + "/status").set(4);
		});
	},1000);
}

function overlap(a, b){
	//Stolen from StackOverflow... ):
	//https://stackoverflow.com/questions/12066870/how-to-check-if-an-element-is-overlapping-other-elements
	rect1 = a.getBoundingClientRect();
	rect2 = b.getBoundingClientRect();
	return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
}
