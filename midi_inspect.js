const easymidi = require("easymidi")

// Setup
var Devices = {
	Input: easymidi.getInputs(),
	Output: easymidi.getOutputs()
}

var InputDeviceListeners = [];

Devices.Input.forEach((dev)=>{
	var inputdevice = new easymidi.Input(dev);
	InputDeviceListeners.push({controller:dev,event:inputdevice});
})

InputDeviceListeners.forEach((dev)=>{
	dev.event.on('noteon',(message)=>{
		console.log(`(${dev.controller}:noteon})`,message)
	})
	dev.event.on('noteoff',(message)=>{
		console.log(`(${dev.controller}:noteoff})`,message)
	})
})

const CleanupCrew = () => {
	InputDeviceListeners.forEach(dev => dev.event.close())
}

process.on('exit',CleanupCrew)
process.on('SIGINT',CleanupCrew)