
var linkedout_Browser = (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) ? "chrome" : "mozilla";

// options
var opt = {
	Tattoo : true,
	AutoHide : false
};
restoreOptions();

function onError(error) {
	console.debug(`Error: ${error}`);
}

function saveOptions() {
	opt.AutoHide = document.getElementsByName("hideAds")[0].checked;
	opt.Tattoo = document.getElementsByName("showTattoo")[0].checked;
	console.debug("[POPUP::onClick]: saveOptions = " 
				+ "\n\t hide=" + opt.AutoHide 
				+ "\n\t tattoo=" + opt.Tattoo);
	if (linkedout_Browser === "chrome") {
		chrome.storage.local.set(opt);
	}
	else {
		browser.storage.local.set(opt);
	}
}

function restoreOptions() {
	function loadOptions(result) {
		if ( result ) {
			opt = result;
			console.debug("[POPUP::onClick]: loadOptions = " 
					+ "\n\t hide=" + opt.AutoHide 
					+ "\n\t tattoo=" + opt.Tattoo);
			document.getElementsByName("hideAds")[0].checked = opt.AutoHide;
			document.getElementsByName("showTattoo")[0].checked = opt.Tattoo;
		}
	}
	if (linkedout_Browser === "chrome") {
		chrome.storage.local.get(null,loadOptions);
	}
	else {
		browser.storage.local.get(null).then(loadOptions, onError);
	}
}

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
document.addEventListener("click", (e) => {
	var menuID = e.target.id;
	
	function notifyMain(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { action: menuID });
	}
	
	if ( menuID ) { 
		// save options
		saveOptions();
		// notify content
		if (linkedout_Browser === "chrome") {
			chrome.tabs.query({active: true, currentWindow: true}, notifyMain );
		}
		else {
			browser.tabs.query({active: true, currentWindow: true} ).then(notifyMain);
		}
		window.close();
	}
});


