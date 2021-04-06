const OBSListener = require("./OBSClient")

module.exports = (MIDIListener) => {
	var OBSEvent = new OBSListener(MIDIListener);
	OBSEvent.connect();
	$("button[action=connect]").on('click',()=>{
		OBSEvent.connect()
		$("span[use=ManagementOBSStatusConnection]").html("Connected");
	})

	$("button[action=disconnect]").on('click',()=>{
		OBSEvent.disconnect();
		$("span[use=ManagementOBSStatusConnection]").html("Disconnected");
	})
}