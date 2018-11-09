

chrome.runtime.onMessage.addListener(function(message, sender) {
	//console.debug("[BACKGROUND::onMessage]: BEGIN");
	if ( message ) {
		console.debug("[BACKGROUND::onMessage]: action = " + message.action);
		if ( message.action === "enableIcon" ) {
			if ( message.value === true ) chrome.browserAction.enable();
			else chrome.browserAction.disable();
		}
		else if ( message.action === "updateCount" ) {
			chrome.browserAction.setBadgeText({text: message.value.toString()});
		}
	}
	//console.debug("[BACKGROUND::onMessage]: END");
});
