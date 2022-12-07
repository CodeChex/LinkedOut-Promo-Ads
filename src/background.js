
chrome.runtime.onMessage.addListener(function(message, sender) {
	if ( message ) {
		//console.debug("[BACKGROUND::onMessage]: action = " + message.action);
		if ( message.action === "enableIcon" ) {
			if ( message.value === true ) chrome.action.enable();
			else chrome.action.disable();
		}
		else if ( message.action === "updateCount" ) {
			chrome.action.setBadgeText({text: message.value.toString()});
		}
	}
});

// always disable when changing tabs, inline script will enable it
chrome.tabs.onActivated.addListener( (activeInfo) => {
	//console.debug("[BACKGROUND::tabs.onActivated]: " + activeInfo.tabId);
	chrome.action.disable();
	chrome.action.setBadgeText({text: ""});
});
