var config = {
	apiKey: "AIzaSyDnxTnQ58lD1Lc9sUWZBHrB6oOArl4TCYA",
	authDomain: "screen-pong.firebaseapp.com",
	databaseURL: "https://screen-pong.firebaseio.com",
	projectId: "screen-pong",
	storageBucket: "",
	messagingSenderId: "813057726714"
};
firebase.initializeApp(config);

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
		var code = "";
		var letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
		var numbers = "123456789"
		var database = firebase.database();
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
							var height = c.clientHeight / size.clientHeight;
							var width = c.clientWidth / size.clientWidth;
							database.ref(code + "/p1").set({
								height: height,
								width: width,
								offset: 0
							});
							setTimeout(function(){
								bg.outerHTML = "";
								c.style.opacity = "1";
								c.innerHTML = "<div id='alignment'></div>";
								var a = document.getElementById("alignment");
								database.ref(code).once("value", function(e){
									e = e.val();
									if(e.p2.height < e.p1.height)
										a.style.top = e.p2.height / 2 + e.p1.height - e.p2.height - 0.5 + "cm";
									else
										a.style.top = e.p1.height / 2 - 0.5 + "cm";
								});
							},500);
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
		var code = "";
		var letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
		var numbers = "123456789"
		var database = firebase.database();
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
						var height = c.clientHeight / size.clientHeight;
						var width = c.clientWidth / size.clientWidth;
						database.ref(code + "/p2").set({
							height: height,
							width: width,
							offset: 0
						});
						setTimeout(function(){
							bg.outerHTML = "";
							c.style.opacity = "1";
							c.innerHTML = "<div id='alignment'></div>";
							var a = document.getElementById("alignment");
							database.ref(code).once("value", function(e){
								e = e.val();
								if(e.p1.height < e.p2.height)
									a.style.top = e.p1.height / 2 + e.p2.height - e.p1.height - 0.5 + "cm";
								else
									a.style.top = e.p2.height / 2 - 0.5 + "cm";
							});
						},500);
					}
				});
			}
		}
	},500);
}