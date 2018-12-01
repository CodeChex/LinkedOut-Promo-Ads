
chrome.runtime.onMessage.addListener(function(message, sender) {
	if ( message ) {
		//console.debug("[BACKGROUND::onMessage]: action = " + message.action);
		if ( message.action === "enableIcon" ) {
			if ( message.value === true ) chrome.browserAction.enable();
			else chrome.browserAction.disable();
		}
		else if ( message.action === "updateCount" ) {
			chrome.browserAction.setBadgeText({text: message.value.toString()});
		}
	}
});

// always disable when changing tabs, inline script will enable it
chrome.tabs.onActivated.addListener( (activeInfo) => {
	//console.debug("[BACKGROUND::tabs.onActivated]: " + activeInfo.tabId);
	chrome.browserAction.disable();
	chrome.browserAction.setBadgeText({text: ""});
});
