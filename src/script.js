/* 
Copyleft (c) 2018, Checco Computer Services
Version 0.5.0
- total rewrite 
- added toggling of ads/tattoos
- added support for Twitter/LinkedIn 
- added compatibility between Chrome/Firefox
- added icon popup menu

 - Inspired by "linkedin-hide-article-button" : Danilo Radenovic, Anja Stanojevic, Tomo Radenovic
*/

// globals
var linkedout_TrackingURL = document.location.origin;
var linkedout_TotalAds = -1;
var linkedout_TrackingSite = undefined;
var linkedout_FeedContainer = undefined;
var linkedout_HomeButton = undefined;
// options
var linkedout_opt = {
	Tattoo : true,
	AutoHide : false,
	Debug : 69
};

function debugMsg(minLevel,msg) {
	if (linkedout_opt.Debug >= minLevel) console.debug("(" + minLevel + ")-" + msg);
}

function onError(error) {
	console.debug(`Error: ${error}`);
}

function saveOptions() {
	// chrome.storage.sync.set(linkedout_opt);
}

function restoreOptions() {

	function loadOptions(result) {
		if ( result ) linkedout_opt = result;
	}
	// chrome.storage.sync.get(null).then(loadOptions, onError);
}

function resetGlobals() {
	linkedout_TrackingURL = document.location.origin;
	linkedout_TotalAds = 0;
	linkedout_TrackingSite = undefined;
	linkedout_FeedContainer = undefined;
	linkedout_HomeButton = undefined;
	disableIcon();
	//restoreOptions();
}

function countAll(element,objectType) {
	var p = $(element).find(objectType).toArray();
	var count = ( p === undefined ) ? 0 : p.length; 
	debugMsg(99,"[EXT::countAll("+objectType+")]: " + count);
	return count;
}

function getPromotionList() {
	var result = Array();
	debugMsg(79,"[EXT::getPromotionList]: BEGIN");
	var mainFeed = document.getElementsByClassName(linkedout_FeedContainer)[0];
	if ( linkedout_TrackingSite === "LinkedIn" ) {
		var items = $(mainFeed).find("div[data-id]").toArray();
		if ( items !== undefined ) {
			debugMsg(69,"[EXT::getPromotionList]: parsing ["+items.length+"] LinkedIn items");
			items.forEach(function(item) {
				// check for drop down selections pointing to ad_choices
				if ( countAll(item,"li.option-ad_choice") > 0 || countAll(item,"button.option-button__ad_choice") > 0 ) {
					result.push(item);
					debugMsg(89,"[EXT::getPromotionList]: found LinkedIn AD");
				}
				// check headlines for other types of ads
				else {
					var headlines = $(item).find("span.feed-shared-post-meta__headline").toArray();
					if ( headlines !== undefined ) {
						debugMsg(89,"[EXT::getPromotionList]: parsing ["+headlines.length+"] LinkedIn headlines");
						headlines.forEach(function(headline) {
							debugMsg(99,"[EXT::getPromotionList]: headline ["+headline.innerText+"] ");
							if ( headline.innerText === "Promoted" ) {
								result.push(item);
								debugMsg(89,"[EXT::getPromotionList]: found LinkedIn PROMOTED headline");
								return;
							}
						});
					}
				}
			});
			debugMsg(69,"[EXT::getPromotionList]: found ["+result.length+"] LinkedIn Ads");
		}
	}
	else if ( linkedout_TrackingSite === "Twitter" ) {
		result = $(mainFeed).find("div.promoted-tweet").toArray();
		debugMsg(69,"[EXT::getPromotionList]: found ["+result.length+"] Twitter Ads");
	}
	debugMsg(99,"[EXT::getPromotionList]: END");
	return result === undefined ? Array() : result;
}

function hasTattoo(element) {
	debugMsg(99,"[EXT::hasTattoo]: BEGIN");
	var branded = (countAll(element,"button.linkedout-tattoo") > 0);
	/*
	var children = element.childNodes;
	for (var i = 0; i < children.length; i++) {
		if (children[i].classList !== undefined &&
			children[i].classList.contains("linkedout-tattoo")) {
			branded = true;
			break;
		}
	}
	*/
	debugMsg(89,"[EXT::hasTattoo]: RESULT = " + branded);
	return branded;
}

function isMarked(element) {
	debugMsg(99,"[EXT::isMarked]: BEGIN");
	var branded = element.classList.contains("linkedout-class");
	debugMsg(89,"[EXT::isMarked]: RESULT = " + branded);
	return branded;
}

function markElement(element) {
	debugMsg(79,"[EXT::markElement]: BEGIN");
	if ( !isMarked(element) ) {
		debugMsg(89,"[EXT::markElement]: Marking");
		// mark the element
		element.classList.add("linkedout-class");
		element.style.display = ( linkedout_opt.AutoHide ? "none" : "block");
		// apply tattoo
		debugMsg(89,"[EXT::markElement]: Tattoo");
		var btn = document.createElement("button");
		btn.classList.add("linkedout-tattoo");
		btn.classList.add("button-reset");
		btn.innerText = "AD";
		btn.addEventListener("click", function () {
			element.style.display = "none";
		});
		btn.style.display = ( linkedout_opt.Tattoo ? "block" : "none");
		element.appendChild(btn);
	}
	debugMsg(99,"[EXT::markElement]: END");
}

function processFeed() {
	debugMsg(79,"[EXT::processFeed]: BEGIN");
	var tPromotionList = getPromotionList();
	var nCountAds = 0;
	debugMsg(69,"[EXT::processFeed]: checking [" + tPromotionList.length + "] ads ");
	tPromotionList.forEach(function (element) {
		if (!isMarked(element)) {
			nCountAds ++;
			linkedout_TotalAds ++;
			markElement(element);
		}
	});
	debugMsg(89,"[EXT::processFeed]: nCountAds=" + nCountAds + ", TotalAds=" +linkedout_TotalAds);
	if ( nCountAds > 0 ) {
		chrome.runtime.sendMessage({
			"action" : "updateCount",
			"value" : linkedout_TotalAds
		});
	}
	debugMsg(99,"[EXT::processFeed]: END");
}

function listenForEvents() {
	debugMsg(79,"[EXT::listenForEvents]: BEGIN");

    var observeDOM = (function () {
		debugMsg(89,"[EXT::listenForEvents::observeDOM]: BEGIN");
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        return function (obj, callback) {
            if (!obj || !obj.nodeType === 1) return; // validation

            if (MutationObserver) {
                // define a new observer
                var obs = new MutationObserver(function (mutations, observer) {
					if (linkedout_TrackingURL != document.location.origin) {
						linkedout_TrackingURL = document.location.origin;
						debugMsg(29,"[EXT]: SITE CHANGED");
						determineSite();
						if (intervalId === undefined) {
							debugMsg(99,"[EXT]: Interval id is undefined, checking status");
							intervalId = setInterval(checkStatus, 200);
						} else {
							debugMsg(99,"[EXT]: Interval id is not undefined");
						}
					}	
                    if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
                        callback(mutations[0]);
					}
				});
                // have the observer observe foo for changes in children
                obs.observe(obj, {childList: true, subtree: true});
            }
            else if (window.addEventListener) {
                obj.addEventListener('DOMNodeInserted', callback, false);
            }
        }
		debugMsg(99,"[EXT::listenForEvents::observeDOM]: END");
    })();
	
    // there is only one mainFeed element on the page
    var mainFeed = document.getElementsByClassName(linkedout_FeedContainer)[0];
    // add hide button to elements that already exist in main feed
 	processFeed();
    // start listening for events
    observeDOM(mainFeed, function () {
		debugMsg(89,"[EXT::listenForEvents]: Observing DOM...");
 		processFeed();
    });
	debugMsg(99,"[EXT::listenForEvents]: END");
}

function addListenerForHomeButton() {
    debugMsg(79,"[EXT::addListenerForHomeButton]: BEGIN");
    var homeButton = document.getElementById(linkedout_HomeButton);
	if ( homeButton !== undefined ) {
		debugMsg(99,"[EXT::addListenerForHomeButton]: FOUND");
		homeButton.addEventListener("click", function () {
			var intervalId = undefined;
			function checkStatus() {
				debugMsg(99,"[EXT::addListenerForHomeButton::checkStatus]: BEGIN");
				var mainFeed = document.getElementsByClassName(linkedout_FeedContainer)[0];
				if (mainFeed === undefined || mainFeed.children === undefined || mainFeed.children.length <= 2) {
					debugMsg(89,"[EXT::ListenerForHomeButton::checkStatus]: Main Feed ("+linkedout_FeedContainer+") still not ready, waiting...");
				} else {
					debugMsg(89,"[EXT::ListenerForHomeButton::checkStatus]: Main Feed ("+linkedout_FeedContainer+") is ready, it has " + mainFeed.children.length + " elements");
					clearInterval(intervalId);
					listenForEvents();
				}
				debugMsg(99,"[EXT::addListenerForHomeButton::checkStatus]: END");
			}
			intervalId = setInterval(checkStatus, 200);
		});
	}
    debugMsg(99,"[EXT::addListenerForHomeButton]: END");
}

/**
 *  ##################
 *  Script starts here
 *  ##################
 */
var intervalId = undefined;

function checkStatus() {
    debugMsg(79,"[EXT::checkStatus]: BEGIN");

    /*
     Although the document.readyState should be 'complete' at this point,
     or in other words, page should be ready, we check for readiness in case
     a document takes a lot of time to load
     (see https://developer.chrome.com/extensions/content_scripts#run_time)
     */
    debugMsg(99,"[EXT::checkStatus]: Document ready state = " + document.readyState);
	/*
    if (document.readyState !== "complete") {
        debugMsg(89,"[EXT::checkStatus]: Document not yet ready, waiting...");
    }
	else 
	*/
	if ( linkedout_FeedContainer === undefined ) {
        debugMsg(89,"[EXT::checkStatus]: Document ready, site not determined...");
	}
	else {
		var mainFeed = document.getElementsByClassName(linkedout_FeedContainer)[0];
		if (mainFeed === undefined || mainFeed.children === undefined || mainFeed.children.length <= 2) {
			debugMsg(89,"[EXT::checkStatus]: Main Feed ("+linkedout_FeedContainer+") still not ready, waiting...");
		} else {
			debugMsg(89,"[EXT::checkStatus]: Main Feed ("+linkedout_FeedContainer+") is ready, it has " + mainFeed.children.length + " elements");
			clearInterval(intervalId);
			intervalId = undefined;
			addListenerForHomeButton();
			listenForEvents();
		}
	}	
    debugMsg(99,"[EXT::checkStatus]: END");
}

function determineSite() {
    debugMsg(79,"[EXT::determineSite]: BEGIN");
	// check for new site
    if (linkedout_TrackingURL !== undefined ) {
		debugMsg(89,"[EXT::determineSite]: URL = " + linkedout_TrackingURL);
		if ( linkedout_TrackingURL.startsWith("https://www.linkedin.com")) {
			linkedout_TrackingSite = "LinkedIn";
			linkedout_FeedContainer = "core-rail";
			linkedout_HomeButton = "feed-nav-item";
		}
		else if ( linkedout_TrackingURL.startsWith("https://twitter.com")) {
			linkedout_TrackingSite = "Twitter";
			linkedout_FeedContainer = "stream-items";
			linkedout_HomeButton = "global-nav-home";
		}
    }
	enableIcon();
    debugMsg(69,"[EXT::determineSite]: RESULT = " + linkedout_TrackingSite);
}

var listener = function() {
    debugMsg(79,"[EXT::listener]: BEGIN");
	determineSite();
	if ( linkedout_TrackingSite ) {
		if (intervalId === undefined) {
			debugMsg(89,"[EXT::listener]: Interval id is undefined, checking status");
			intervalId = setInterval(checkStatus, 200);
		} else {
			debugMsg(89,"[EXT::listener]: Interval id is defined");
		}
	}
    debugMsg(99,"[EXT::listener]: END");
};

function initExtension() {
	resetGlobals();
	determineSite();
	window.addEventListener('popstate', listener);
	if (intervalId === undefined) {
		debugMsg(89,"[EXT]: Interval id is undefined, checking status");
		intervalId = setInterval(checkStatus, 200);
	} else {
		debugMsg(89,"[EXT]: Interval id is not undefined");
	}
}

function onNotify(message) {
	debugMsg(99,"[EXT::onNotify]: BEGIN");
	if ( message ) {
		debugMsg(69,"[EXT::onNotify]: action = " + message.action);
		if (message.action === "reset" ) {
			initExtension();
		}
		else if (message.action === "parsePage" ) {
			processFeed();
		}
		else if (message.action === "showTattoo" ) {
			linkedout_opt.Tattoo = true;
			$(".linkedout-tattoo").css("display", linkedout_opt.Tattoo ? "block" : "none" );
			saveOptions();
		}
		else if (message.action === "showAds" ) {
			linkedout_opt.AutoHide = false;
			$(".linkedout-class").css("display", linkedout_opt.AutoHide ? "none" : "block");
			saveOptions();
		}
		else if (message.action === "hideTattoo" ) {
			linkedout_opt.Tattoo = false;
			$(".linkedout-tattoo").css("display", linkedout_opt.Tattoo ? "block" : "none" );
			saveOptions();
		}
		else if (message.action === "hideAds" ) {
			linkedout_opt.AutoHide = true;
			$(".linkedout-class").css("display", linkedout_opt.AutoHide ? "none" : "block");
			saveOptions();
		}
	}
	debugMsg(99,"[EXT::onNotify]: END");
}

function enableIcon() {
	chrome.runtime.sendMessage({
		"action" : "enableIcon",
		"value" : (linkedout_TrackingURL !== undefined)
	});
	chrome.runtime.sendMessage({
		"action" : "updateCount",
		"value" : linkedout_TotalAds
	});
}

function disableIcon() {
	// update icon
	chrome.runtime.sendMessage({
		"action" : "updateCount",
		"value" : ""
	});
	chrome.runtime.sendMessage({
		"action" : "enableIcon",
		"value" : false
	});
}

window.addEventListener('focus', function() {
	debugMsg(999,"[EXT]: FOCUS " + linkedout_TrackingURL);
	// slightly delay to ensure old window's blur function has completed
	if ( document.hasFocus() ) setTimeout(enableIcon,250);
});

window.addEventListener('blur', function() {
	debugMsg(999,"[EXT]: BLUR " + linkedout_TrackingURL);
	//disableIcon();
});

// STARTUP HERE
debugMsg(99,"[EXT]: INITIALIZING ...");
chrome.runtime.onMessage.addListener(onNotify);
initExtension();
debugMsg(99,"[EXT]: INITIALIZAION COMPLETE");
