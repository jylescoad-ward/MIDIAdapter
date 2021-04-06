module.exports = () => {
	$("div.VisualController").html(require("./cfgs/launchpad_mk2").html);
	global.MIDIAdapter.MIDIHandle.on((Event)=>{
		console.log(`${Event._type}:${Event.note}`)
		$(`td[note=${Event.note}]`).html(`<span>C: ${Event.channel}</span><br><span>N: ${Event.note}</span><br><span>V: ${Event.velocity}</span>`);
	})
}