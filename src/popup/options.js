
/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
document.addEventListener("click", (e) => {
	var optionName = e.target.id;	
	console.debug("[POPUP::onClick]: option = " + optionName);

	function processMenu(tabs) {
		chrome.tabs.sendMessage(tabs[0].id,{ action: optionName });
	}
	
	if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
		chrome.tabs.query({active: true, currentWindow: true}, processMenu );
	}
	else {
		browser.tabs.query({active: true, currentWindow: true} ).then(processMenu);
	}
});


