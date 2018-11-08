
chrome.runtime.onMessage.addListener(function(message, sender) {
	//console.debug("[BACKGROUND::onMessage]: BEGIN");
	if ( message ) {
		if ( message.action === "updateCount" ) {
			chrome.browserAction.setBadgeText({text: message.value.toString()});
		}
	}
	//console.debug("[BACKGROUND::onMessage]: END");
});