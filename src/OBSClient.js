const OBSWebSocket = require('obs-websocket-js');
class OBSEvent {
	DropdownHandler() {
		$("select[action=OBSOutputEventAction]").on('change',()=>{
			var SelectedOption = $("select[action=OBSOutputEventAction] option:selected").val()
			if (SelectedOption.includes("Scene")) {
				this.HTMLObjectSelect("scene");
			}
			else if (SelectedOption.includes("Source") || SelectedOption.includes("Mute")) {
				this.HTMLObjectSelect("source");
			} else {
				this.HTMLObjectSelect("none");
			}


			if (SelectedOption == "TransitionToProgram") {
				this.HTMLDataSelect("transition")
			} else {
				this.HTMLDataSelect("none")
			}
		})
	}

	HTMLPopulateEventTable() {
		$("table[use=GlobalEventList] tbody").html("<!-- -->")
		this.Events.forEach((EObject)=>{
			// Initial MIDI
			if (EObject == null) return;
			if (EObject.on.doMIDI) {
				$("table[use=GlobalEventList] tbody").append(`
				<tr UUID="${EObject.UUID}" class="EventStart">
					<td>MIDI</td>
					<td colspan="2">Ready/Release<br>${EObject.on.midi.controller}</td>
					<td>MIDI</td>
					<td>${EObject.then.midi.controller}</td>
					<td>N: ${EObject.on.midi.note}, V: ${EObject.on.midi.velocity}, C: ${EObject.on.midi.channel}</td>
					<td rowspan="${(() => {let index = 0;if(EObject.on.doMIDI){index++}; if(EObject.on.doOBS){index++}; if(EObject.then.doMIDI){index++}; if(EObject.then.doOBS){index++}; return index})()}">
						<button class="btn btn-danger" action="DeleteEvent" UUID="${EObject.UUID}">Delete</button>
					</td>
				</tr>
				`)
				if (EObject.then.doMIDI) {
					$("table[use=GlobalEventList] tbody").append(`
					<tr UUID="${EObject.UUID}">
						<td>MIDI</td>
						<td>Press<br>${EObject.on.midi.controller}</td>
						<td>N: ${EObject.on.midi.note}, C: ${EObject.on.midi.channel}</td>
						<td>MIDI</td>
						<td>${EObject.then.midi.controller}</td>
						<td>N: ${EObject.then.midi.note}, V: ${EObject.then.midi.velocity}, C: ${EObject.then.midi.channel}</td>
					</tr>
					`);
				}
				if (EObject.then.doOBS) {
					$("table[use=GlobalEventList] tbody").append(`
					<tr UUID="${EObject.UUID}">
						<td>MIDI</td>
						<td>Press<br>${EObject.on.midi.controller}</td>
						<td>N: ${EObject.on.midi.note}, C: ${EObject.on.midi.channel}</td>
						<td>OBS</tD>
						<td>${EObject.then.obs.event}</td>
						<td>${EObject.then.obs.data || ""}</td>
					</tr>
					`)
				}
			}
			$("button[action=DeleteEvent][UUID="+EObject.UUID+"]").on('click',()=>{
				var NewEvents = this.Events.filter(e => e.UUID != EObject.UUID);
				this.Events = NewEvents;
				$("table[use=GlobalEventList] tbody div[UUID="+EObject.UUID+"]").remove();
				localStorage.OBSEvents = JSON.stringify(NewEvents);
				console.log(`[OBS.DeleteEvent] Deleted Event '${EObject.UUID}'`);
				$("button[action=disconnect]").trigger('click');
				setTimeout(()=>{
					$("button[action=connect]").trigger('click');
				})
			})
		})
	}

	HTMLObjectSelect(ObjectType) {
		switch (ObjectType) {
			case "scene":
				var DuhArray = [];
				this.Cache.scenes.forEach((SceneObject)=>{
					DuhArray.push(`<option value="${SceneObject.name}">${SceneObject.name}</option>`)
				})
				$("select[action=OBSOutputEventObject]").html(`<option default selected disabled>Scene</option>\n${DuhArray.join('\n')}`)
				break;
			case "source":
				var SourceArray = [];
				this.Cache.sources.forEach((SourceObj)=>{
					SourceArray.push(`<option value="${SourceObj.name}">${SourceObj.name}</option>`)
				})
				$("select[action=OBSOutputEventObject]").html(`<option default selected disabled>Source</option>\n${SourceArray.join('\n')}`)
				break;
			default:
				$("select[action=OBSOutputEventObject]").html(`<option default disabled selected>Object</option>`)
		}
	}
	HTMLDataSelect(DataType) {
		switch (DataType) {
			case "transition":
				var uggghhh = [];
				this.Cache.transitions.forEach((TransitionObject)=>{
					uggghhh.push(`<option value="${TransitionObject.name}">${TransitionObject.name}</option>`)
				})
				$("select[action=OBSOutputEventObject]").html(`<option default selected disabled>Transition</option>\n${uggghhh.join('\n')}`)
				break;
			default:
				$("select[action=OBSOutputEventData]").html(`<option default disabled selected>Data</option>`)
				break;
		}
	}

	constructor() {
		this.MIDIHandle = global.MIDIAdapter.MIDIHandle;
		this.Credentials = {
			address: localStorage.OBSAddress || "127.0.0.1:4444",
			password: localStorage.OBSPassword || "",
		}

		if (localStorage.OBSEvents == undefined) {
			localStorage.OBSEvents = JSON.stringify([]);
		}

		this.OBS = new OBSWebSocket();

		this.Events = JSON.parse(localStorage.OBSEvents);
		this.AppendEventListener();
		this.OBS.on('ConnectionOpened',()=>{
			this.MIDI_Interperter();
			this.OBS.sendCallback("GetSceneList",{},console.log)
			$("[use=ManagementOBSStatusConnection]").html("Connected")
		})
		this.OBS.on('AuthenticationSuccess', (data)=>{
			console.log(`[OBS] Connected!`,data)
		});
		this.OBS.on('AuthenticationFailure', (data)=>{
			console.log(`[OBS] Connection Failed`,data)
		});
		this.OBS.on('error', err => {
			console.error('socket error:', err);
		});
		this.Cache = {};
	}

	OBSEventSend(GivenData) {
		// Send OBS Data, refer to the function "AppendEventListener" to see how shit's done/formatted (:
		switch(GivenData.event) {
			case "SetPreviewScene":
				this.OBS.send("EnableStudioMode");
			case "SetCurrentScene":
				this.OBS.send(GivenData.event,{
					"scene-name": GivenData.data
				})
				break;
			case "TransitionToProgram":
				this.OBS.send("EnableStudioMode");
				this.OBS.send("TransitionToProgram");
				break;
		}

		if (GivenData.event.includes("Streaming") || GivenData.event.includes("Recording")) {
			this.OBS.send(GivenData.event);
		}

		if (GivenData.event.includes("Mute")) {
			switch (GivenData.event) {
				case "SetMute=true":
					this.OBS.send("SetMute",{
						source:GivenData.data,
						mute: true,
					})
					break;
				case "SetMute=false":
					this.OBS.send("SetMute",{
						source:GivenData.data,
						mute: false,
					})
					break;
				case "ToggleMute":
					this.OBS.send("ToggleMute",{
						source: GivenData.data
					})
					break;
			}
		}

		if (GivenData.event.includes("SetSourceVisibility")) {
			switch(GivenData.event) {
				case "SetSourceVisibility=true":
					// Show Source
					this.OBS.send("SetSceneItemRender",{
						item:this.Cache.CollectionSoucres.find(s => s != undefined && s.name == GivenData.data).id,
						"scene-name":this.Cache.CollectionSoucres.find(s => s != undefined && s.name == GivenData.data).SceneName,
						source:GivenData.data,
						render:true
					})
					break;
				case "SetSourceVisibility=false":
					// Hide Source
					this.OBS.send("SetSceneItemRender",{
						item:this.Cache.CollectionSoucres.find(s => s != undefined && s.name == GivenData.data).id,
						"scene-name":this.Cache.CollectionSoucres.find(s => s != undefined && s.name == GivenData.data).SceneName,
						source:GivenData.data,
						render:false
					})
					break;
				case "SetSourceVisibility=toggle":
					// Get visibility
					this.OBS.sendCallback("GetSceneItemProperties",{
						item: {
							name: GivenData.data,
							id: this.Cache.CollectionSoucres.find(s => s != undefined && s.name == GivenData.data).id
						},
						"scene-name":this.Cache.CollectionSoucres.find(s => s != undefined && s.name == GivenData.data).SceneName,
					},(e,SceneItem)=>{
						this.OBS.sendCallback("SetSceneItemRender",{
							item:this.Cache.CollectionSoucres.find(s => s != undefined && s.name == GivenData.data).id,
							"scene-name":this.Cache.CollectionSoucres.find(s => s != undefined && s.name == GivenData.data).SceneName,
							source:GivenData.data,
							render:!SceneItem.visible
						},console.log)
					})
					break;
			}
		}
	}
	
	MIDI_Interperter() {
		this.MIDIHandle.on('noteon',(Message)=>{
			if (Message.velocity < 1) return;
			this.Events.forEach((TargetMIDIEvent)=>{
				if (!TargetMIDIEvent.on.doMIDI) return;
				if (TargetMIDIEvent.on.midi.controller == Message._controller && TargetMIDIEvent.on.midi.note == Message.note && TargetMIDIEvent.on.midi.channel == Message.channel) {
					if (TargetMIDIEvent.then.doMIDI) {
						this.MIDIHandle.send(TargetMIDIEvent.then.midi)
					}
					if (TargetMIDIEvent.then.doOBS) {
						this.OBSEventSend(TargetMIDIEvent.then.obs)
					}
				}
			})
		})
		this.MIDIHandle.on('noteoff',(Message)=>{
			var TargetMIDIEvents = this.Events.find(e => e.on.midi.controller == Message._controller && e.on.midi.note == Message.note && e.on.midi.channel == Message.channel);
			if (TargetMIDIEvents == undefined || TargetMIDIEvents.length < 1) return;

			if (TargetMIDIEvents[0] == undefined) {
				if (TargetMIDIEvents.on.doMIDI) {
					this.MIDIHandle.send({note:TargetMIDIEvents.on.midi.note,velocity:TargetMIDIEvents.on.midi.velocity,channel:TargetMIDIEvents.on.midi.channel,controller:TargetMIDIEvents.then.midi.controller})
				}
			} else {
				TargetMIDIEvents.forEach((TargetEvent)=>{
					if (TargetEvent.on.doMIDI) {
						this.MIDIHandle.send({note:TargetEvent.on.midi.note,velocity:TargetEvent.on.midi.velocity,channel:TargetEvent.on.midi.channel,controller:TargetEvent.then.midi.controller})
					}
				})
			}
		})
	}

	UpdateCache() {
		console.log("[OBSClient.UpdateCache] Polling OBS for Latest Data.")
		this.Cache = {};
		this.OBS.send('GetSourcesList').then(d => this.Cache.sources = d.sources)
		this.OBS.send('GetSceneItemList').then(d => this.Cache.sceneItems = d)
		this.OBS.send('GetSceneList').then(d => this.Cache.scenes = d.scenes)
		this.OBS.send('GetTransitionList').then(d => this.Cache.transitions = d.transitions)
		this.OBS.sendCallback("GetSceneList",{},(e,tmpsc)=>{
			var Scenes = tmpsc.scenes;
			this.Cache.CollectionSoucres = [];
			Scenes.forEach((SceneObject)=>{
				SceneObject.sources.forEach((SourceObject)=>{
					SourceObject.SceneName = SceneObject.name
					this.Cache.CollectionSoucres[SourceObject.id] = SourceObject
				})
			})
		})
	}

	AppendEventListener() {
		this.HTMLPopulateEventTable();
		$("button[action=AppendEvent]").on('click',()=>{
			var FinalData = {
				UUID: require("tinytoolbox").stringGen(16),
				on: {
					doMIDI: $("input[type=checkbox][use=MIDIInputEventEnable]").is(':checked'),
					doOBS: $("input[type=checkbox][use=OBSInputEventEnable]").is(':checked'),
					midi: {},
					obs: {},
				},
				then: {
					doMIDI: $("input[type=checkbox][use=MIDIOutputEventEnable]").is(':checked'),
					doOBS: $("input[type=checkbox][use=OBSOutputEventEnable]").is(':checked'),
					midi: {},
					obs: {},
				},
			};

			if ($("input[type=checkbox][use=MIDIInputEventEnable]").prop('checked')) {
				FinalData.on.midi = {
					controller: $("select[action=MIDIInputControllers] option:selected").val(),
					note: parseInt($("input[action=MIDIInputEventNote]").val()),
					velocity: parseInt($("input[action=MIDIInputEventVelocity]").val()),
					channel: parseInt($("input[action=MIDIInputEventChannel]").val()),
					type: $("select[action=MIDIInputEventType] option:selected").val()
				}
			}
			if ($("input[type=checkbox][use=OBSInputEventEnable]").is(':checked')) {
				FinalData.on.obs = {
					event: $("select[action=OBSInputEventAction] option:selected").val(),
					data: $("select[action=OBSInputEventObject] option:selected").val(),
				}
			}
			if ($("input[type=checkbox][use=MIDIOutputEventEnable]").is(':checked')) {
				FinalData.then.midi = {
					controller: $("select[action=MIDIOutputControllers] option:selected").val(),
					note: parseInt($("input[action=MIDIOutputEventNote]").val()),
					velocity: parseInt($("input[action=MIDIOutputEventVelocity]").val()),
					channel: parseInt($("input[action=MIDIOutputEventChannel]").val()),
					type: $("select[action=MIDIOutputEventType] option:selected").val()
				}
			}
			if ($("input[type=checkbox][use=OBSOutputEventEnable]").is(':checked')) {
				FinalData.then.obs = {
					event: $("select[action=OBSOutputEventAction] option:selected").val(),
					data: $("select[action=OBSOutputEventObject] option:selected").val(),
				}
			}
			if ($("select[action=OBSOutputEventData] option").length > 1) {
				FinalData.then.obs.extraData = $("select[action=OBSOutputEventData] option:selected").val()
			}
			this.Events.push(FinalData)
			console.log(this.Events)
			localStorage.OBSEvents = JSON.stringify(this.Events);
		})
	}

	connect() {
		this.OBS.on('ConnectionOpened',()=>{
			this.DropdownHandler();
			this.UpdateCache();
		})

		this.OBS.on('error', err => {
			console.error('socket error:', err);
		});

		$(".loadingoverlay").attr("action","show");
		this.OBS.connect(this.Credentials).then(() =>{
			$(".loadingoverlay").attr("action","hide");
		}).catch((error)=>{
			alert((error.description == undefined ? "" : error.description+"\n")+ "Try checking if OBS is open.");
			$(".loadingoverlay").attr("action","hide");
		})
	}
	disconnect() {
		this.OBS.disconnect()
	}
}
module.exports = OBSEvent;