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

const {getCurrentWindow, globalShortcut} = require('electron').remote;
const {dialog} = require('electron').remote;
const fs = require("fs");
$("button[action=import]").on("click",async () =>
{
	var location = await dialog.showOpenDialog({
		filters: [{name:"MIDI Adapter Config", extensions:["mcfg"]}],
		properties: ['openFile'],
		buttonLabel: "Import",
	});
	console.log(location);
	if (!location.canceled)
	{
		var data = fs.readFileSync(location.filePaths[0]);
		localStorage = JSON.parse(data.toString());
		getCurrentWindow().reload()
	}
});
$("button[action=export]").on("click",async () =>
{
	var location = await dialog.showSaveDialog({
		filters: [{name:"MIDI Adapter Config", extensions:["mcfg"]}],
		buttonLabel: "Export",
	});
	console.log(location)
	if (!location.canceled)
		fs.writeFile(location.filePath, JSON.stringify(localStorage,null,"\t"),console.log);
});

var allPackages = [];
var devpackages = [];
Object.entries(require("./../package.json").dependencies || {}).forEach(d => allPackages.push({name:d[0].replace("@",""),version:d[1]}));
Object.entries(require("./../package.json").devDependencies || {}).forEach(d => devpackages.push({name:d[0].replace("@",""),version:d[1]}));
console.log(allPackages,devpackages)
allPackages.forEach((package) => {
	$("[action=OSS_Credits]>ul").append(`
	<li>
		<span type="name"><a href="#" class="external-link" location="https://npmjs.com/package/${package.name}">${package.name}</a></span>
		<span type="version">${package.version}</span>
	</li>`);
});
devpackages.forEach((package) => {
	$("[action=OSS_Credits_Dev]>ul").append(`
	<li>
		<span type="name"><a href="#" class="external-link" location="https://npmjs.com/package/${package.name}">${package.name}</a></span>
		<span type="version">${package.version}</span>
	</li>`);
});
$("#about[role=settingsModalTab]>h4").append(" "+require("./../package.json").version);


$("a.external-link").on('click',(me) =>
{
	require('electron').shell.openExternal(me.delegateTarget.attributes.location.value);
});
