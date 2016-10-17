var number;

function myFunction(number){
	if (number == "1"){
		document.getElementById('container').style.background = "white";
	}
	if (number == "2"){
		document.getElementById('container').style.background = "red";
	}
	if (number == "3"){
		document.getElementById('container').style.background = "black";
	}
	if (number == "4"){
		document.getElementById('container').style.background = "violet";
	}
	if (number == "5"){
		document.getElementById('container').style.background = "blue";
	}
	if (number == "6"){
		document.getElementById('container').style.background = "orange";
	}
	if (number == "7"){
		document.getElementById('container').style.background = "pink";
	}
	if (number == "8"){
		document.getElementById('container').style.background = "green";
	}
	if (number == "9"){
		document.getElementById('container').style.background = "gray";
	}
	
}


function showPanel(){
			document.getElementById('nav').style.margin = 0;
			document.getElementById('blackbg').innerHTML = "&nbsp";
			document.getElementById('blackbg').style.height = "100%";
		}
function hidePanel(){
			document.getElementById('nav').style.margin = "-240px";
			document.getElementById('blackbg').innerHTML = "";
			document.getElementById('blackbg').style.height = 0;
		}











