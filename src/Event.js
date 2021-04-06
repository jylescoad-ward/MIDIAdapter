module.exports = () => {
	module.exports.updateList.MIDI();
	$("button[action=AppendEvent]").on('click',()=>{
		module.exports.append()
	})

	$("input[type=checkbox][use=MIDIInputEventEnable]").on('click',()=>{
		$("input[type=checkbox][use=MIDIInputEventEnable]").prop("checked",true)
		$("input[type=checkbox][use=OBSInputEventEnable]").prop( "checked",false)
		
		$("input[type=checkbox][use=MIDIOutputEventEnable]").prop( "checked",true)
		$("input[type=checkbox][use=OBSOutputEventEnable]").prop( "checked",true)
	})
	$("input[type=checkbox][use=OBSInputEventEnable]").on('click',()=>{
		$("input[type=checkbox][use=OBSInputEventEnable]").prop("checked",true)
		$("input[type=checkbox][use=MIDIInputEventEnable]").prop( "checked",false)
		
		$("input[type=checkbox][use=MIDIOutputEventEnable]").prop( "checked",this.checked)
		$("input[type=checkbox][use=OBSOutputEventEnable]").prop( "checked",false)
	})
}
module.exports.updateList = {
	MIDI: () => {
		var ColorConfig = JSON.parse(localStorage.MIDIColor) || [];
		$("tbody[use=MIDI_IO_EventList]").html("<!-- -->");
		ColorConfig.forEach((IDevice)=>{
			IDevice.Note.forEach((INote)=>{
				if (INote == null) return;
				$("tbody[use=MIDI_IO_EventList]").append(`
				<tr>
					<td><button action="DeleteMIDIEvent" data='["${IDevice.Controller}",${IDevice.Note.indexOf(INote)}]'>Delete Note</button></td>
					<td>${INote.default.controller}</td>
					<td>OnReady</td>
					<td>${INote.default.controller}</td>
					<td>N: ${INote.default.note},V: ${INote.default.velocity},C: ${INote.default.channel}</td>
				</tr>
				<tr>
					<td></td>
					<td>${IDevice.Controller}</td>
					<td>N: ${IDevice.Note.indexOf(INote)}</td>
					<td>${INote.noteon.controller}</td>
					<td>N: ${INote.noteon.note},V: ${INote.noteon.velocity},C: ${INote.noteon.channel}</td>
				</tr>
				`)
			})
		})
		$("button[action=DeleteMIDIEvent]").on('click',(me)=>{
			var DeleteData = JSON.parse(me.target.attributes.data.value);
	
			var ColorConfig = JSON.parse(localStorage.MIDIColor);
	
			ColorConfig.find(d => d.Controller == DeleteData[0]).Note[DeleteData[1]] = null;
			localStorage.MIDIColor = JSON.stringify(ColorConfig);
			module.exports.updateList.MIDI();
		})
	}
}
module.exports.append = () => {
	var TargetNote = $("input[type=number][action=MIDIInputEventNote]").val() || 11;
	var TargetController = $("select[action=MIDIInputControllers] option:selected").text() || $("select[action=MIDIInputControllers] option")[0].text();
	var Values = {
		'noteon': {
			velocity: $("input[type=number][action=MIDIOutputEventVelocity]").val() || 127,
			note: $("input[type=number][action=MIDIOutputEventNote]").val() || 11,
			channel: $("input[type=number][action=MIDIOutputEventChannel]").val() || 0,
			controller: $("select[action=MIDIOutputControllers] option:selected").text(),
		},
		default: {
			velocity: $("input[type=number][action=MIDIInputEventVelocity]").val() || 127,
			note: $("input[type=number][action=MIDIInputEventNote]").val() || 11,
			channel: $("input[type=number][action=MIDIInputEventChannel]").val() || 0,
			controller: $("select[action=MIDIOutputControllers] option:selected").text(),
		}
	};
	var ColorConfig = JSON.parse(localStorage.MIDIColor) || [];
	if (ColorConfig.find(c => c.Controller == TargetController) == undefined) {
		console.log(`[AppendEvent] Controller '${TargetController}' is undefined, Creating Device`)
		ColorConfig.push({
			Controller: TargetController,
			Note: []
		})
	}
	console.log(`[AppendEvent] Setting Note '${TargetNote}' for '${TargetController}' with data of;`,Values)
	ColorConfig.find(c => c.Controller == TargetController).Note[TargetNote] = Values;
	localStorage.MIDIColor = JSON.stringify(ColorConfig);
	module.exports.updateList.MIDI();
}