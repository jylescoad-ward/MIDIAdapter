const easymidi = require("easymidi");
var RemoveLast = (input)=>{
	var ti = input.split(' ');
	ti[ti.length-1] = undefined;
	return ti.join(' ');
}
class MIDIWrapper {
	Storage = {};
	OnEventListens = [];
	DeviceNames = {
		Input: easymidi.getInputs(),
		Output: easymidi.getOutputs()
	}
	Listeners = {
		Input: [],
		Output: [],
	}

	Startup() {
		this.DeviceNames = {
			Input: easymidi.getInputs(),
			Output: easymidi.getOutputs()
		}
		this.Listeners.Input = [];
		this.Listeners.Output = [];
		this.DeviceNames.Input.forEach((dev)=>{
			var idev = new easymidi.Input(dev);
			this.Listeners.Input.push({
				controller:dev,
				event:idev
			})
		})
		this.DeviceNames.Output.forEach((dev)=>{
			var odev = new easymidi.Output(dev);
			this.Listeners.Output.push({
				controller:dev,
				event:odev
			})
		})

		this.Listeners.Output.forEach((Device)=>{
			this.Storage.ColorEvents.forEach((DeviceLookup)=>{
				if (DeviceLookup == null) return;
				if (!DeviceLookup.on.doMIDI) return;
				if (Device.controller != DeviceLookup.then.midi.controller) return;
				//console.log(`[MIDI.Startup:InitialNoteEvent] Send Default Data from '${ColorEvent.Controller}' to '${DeviceLookup.default.controller}'\n(N:${DeviceLookup.default.note},C:${DeviceLookup.default.channel},V:${DeviceLookup.default.velocity})\n`,DeviceLookup)
				var EventData = {
					note: parseInt(DeviceLookup.on.midi.note),
					channel: parseInt(DeviceLookup.on.midi.channel || 0),
					velocity: parseInt(DeviceLookup.on.midi.velocity || 127)
				}
				Device.event.send('noteon',EventData)
			})

		})
	}
	Cleanup() {
		this.Listeners.Input.forEach(dev => dev.event.close())
		this.Listeners.Output.forEach((dev)=>{
			for(let i = 0; i <= 127; i++) {
				dev.event.send('noteon',{
					note: i,
					velocity: 0,
					channel: 0,
				})
			}
			console.log(`[MIDI.Cleanup:output] Closed Listener for '${dev.controller}'`)
			dev.event.close()
		})
	}

	on(EventType,Callback) {
		this.OnEventListens.push({type:EventType,callback:Callback})
	}

	SendNoteResponse (InputController,MIDIMessage) {
		if (this.Storage.ColorEvents.find(c => c.on.midi.controller == InputController) == undefined) return;
		var TargetColorEvent = this.Storage.ColorEvents.find(c => c.on.midi.controller == InputController);
		if (!TargetColorEvent.then.doMIDI) return;
		var TargetNote = TargetColorEvent.then.midi.note;
		var TargetEvent = TargetColorEvent.then.midi;

		// Do this so it only sends the MIDI Data to
		// the controller we want instead of every
		// controller that the program is attached to.
		if (this.Listeners.Output.find(OD => OD.controller == TargetEvent.controller) == undefined) return;

		var OutputDevice = this.Listeners.Output.find(OD => OD.controller == TargetEvent.controller);
		try {
			// Send Default Data for that note so there is no confusion (:
			OutputDevice.event.send('noteon',{
				velocity: 0,
				note: parseInt(TargetEvent.note || TargetNote),
				channel: parseInt(TargetEvent.channel || MIDIMessage.channel || 0)
			})

			// Send the actual data to our target MIDI Device
			var SendData = {
				type: 'noteon',
				velocity: parseInt(TargetEvent.velocity || MIDIMessage.velocity),
				note: parseInt(TargetEvent.note || TargetNote),
				channel: parseInt(TargetEvent.channel || MIDIMessage.channel || 0)
			}
			OutputDevice.event.send(SendData.type,SendData);
		} catch(e) {
			console.error(e);
		} 
	}
	InputEventHandle(Message,Device) {
		// Force type to noteoff if
		// there is piss all velocity.
		if (Message.velocity == 0) {
			Message._type = "noteoff";
		}

		//this.SendNoteResponse(Device.controller,Message);
		this.OnEventListens.forEach((EventListen)=>{
			Message._controller = Device.controller;
			if (typeof EventListen.type == "function") {
				EventListen.type(Message);
			}
			else if (typeof EventListen.type == "string" && EventListen.type == Message._type) {
				EventListen.callback(Message);
			}
		})
	}
	InputEventListener() {
		this.Listeners.Input.forEach((Device)=>{
			Device.event.on('noteon',(msg)=>{this.InputEventHandle(msg,Device)})
			Device.event.on('noteoff',(msg)=>{this.InputEventHandle(msg,Device)})
		})
	}
	send(DataToSend) {
		this.Listeners.Output.find(l => l.controller == DataToSend.controller).event.send('noteon',{note:DataToSend.note,velocity:0,channel:DataToSend.channel})
		this.Listeners.Output.find(l => l.controller == DataToSend.controller).event.send('noteon',DataToSend)
	}
	constructor(LaunchpadColorScheme) {
		this.Storage.ColorEvents = LaunchpadColorScheme || {};
		this.Startup();
		this.InputEventListener();

		var outputcontrollertext = [];
		this.DeviceNames.Output.forEach((d)=>{
			outputcontrollertext.push(`<option value="${d}">${d}</option>`)
		})
		var inputcontrollertext = [];
		this.DeviceNames.Input.forEach((d)=>{
			inputcontrollertext.push(`<option value="${d}">${d}</option>`)
		})
		$("select[action=MIDIOutputControllers]").html(outputcontrollertext.join("\n"))
		$("select[action=MIDIInputControllers]").html(inputcontrollertext.join("\n"))
	}
}
module.exports = MIDIWrapper;