const MIDIWrapper = require("./MIDI");

const Visualizer = require("./Visualizer");
const Event = require("./Event");
const OBS = require("./OBS");

global.$ = require("jquery");
module.exports = async () => {
	module.exports.collapse()
	if (localStorage.OBSEvents == undefined) {
		localStorage.OBSEvents = JSON.stringify([]);
	}

	global.MIDIAdapter = {
		MIDIHandle: {}
	}

	global.MIDIAdapter.MIDIHandle = new MIDIWrapper(JSON.parse(localStorage.OBSEvents))

	$("button[action=connect]").on('click',()=>{
		var remote = require('electron').remote;
		remote.getCurrentWindow().reload();
	})
	$("button[action=disconnect]").on('click',()=>{
		global.MIDIAdapter.MIDIHandle.Cleanup();
	});

	$("input[use=ManagementOBSAddress]").on('keyup',()=>{
		localStorage.OBSAddress = $("input[use=ManagementOBSAddress]").val()
	})
	$("input[use=ManagementOBSPassword]").on('keyup',()=>{
		localStorage.OBSPassword = $("input[use=ManagementOBSPassword]").val()
	})

	Visualizer();
	Event();
	OBS();
}

module.exports.collapse = () => {
	var coll = document.getElementsByClassName("collapsible");
	var i;

	for (i = 0; i < coll.length; i++) {
		coll[i].addEventListener("click", function() {
			this.classList.toggle("active");
			var content = this.nextElementSibling;
			if (content.style.display === "block") {
				content.style.display = "none";
			} else {
				content.style.display = "block";
			}
		});
	}
}
