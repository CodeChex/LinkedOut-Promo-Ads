/* 
Copyleft (c) 2018, Checco Computer Services

Version [FUTURE]
- add support for Instagram/Facebook 

Version 0.6.3
- adjusted for LinkedIn new "Promoted" format

Version 0.6.1
- changed tattoo verbiage from "AD" to a counter

Version 0.6.0
- allow saving/loading of options 
- changed tattoo from stop-sign to cluster marker

Version 0.5.1
- fixed icon enabled status 

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
var linkedout_Browser = (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) ? "chrome" : "mozilla";
var linkedout_TattooClass = linkedout_Browser + "-tattoo";

// options
var opt = {
	Tattoo : true,
	AutoHide : false,
	Debug : 999
};

function debugMsg(minLevel,msg) {
	if (opt.Debug >= minLevel) console.debug("(" + minLevel + ")-" + msg);
}

function onError(error) {
	console.error(`Error: ${error}`);
}

function restoreOptions() {
	function loadOptions(result) {
		if ( result ) {
			opt = result;
			$("." + linkedout_TattooClass).css("display", opt.Tattoo ? "block" : "none" );
			$(".linkedout-class").css("display", opt.AutoHide ? "none" : "block");
			debugMsg(49,"[EXT]: restoreOptions = " 
					+ "\n\t hide=" + opt.AutoHide 
					+ "\n\t tattoo=" + opt.Tattoo
					+ "\n\t debug=" + opt.Debug);
		}
	}
	if (linkedout_Browser === "chrome") {
		chrome.storage.local.get(null,loadOptions);
	}
	else {
		browser.storage.local.get(null).then(loadOptions, onError);
	}
}

function resetGlobals() {
	disableIcon();
	linkedout_TrackingURL = document.location.origin;
	linkedout_TotalAds = 0;
	linkedout_TrackingSite = undefined;
	linkedout_FeedContainer = undefined;
	linkedout_HomeButton = undefined;
	restoreOptions();
}

function countAll(element,objectType) {
	var p = $(element).find(objectType).toArray();
	var count = ( p === undefined ) ? 0 : p.length; 
	debugMsg(99,"[EXT::countAll("+objectType+")]: " + count);
	return count;
}

function getPromotionList() {
	var result = Array();
	debugMsg(89,"[EXT::getPromotionList]: BEGIN");
	var mainFeed = document.getElementsByClassName(linkedout_FeedContainer)[0];
	if ( linkedout_TrackingSite === "LinkedIn" ) {
		var items = $(mainFeed).find("div[data-id]").toArray();
		if ( items !== undefined ) {
			debugMsg(79,"[EXT::getPromotionList]: parsing ["+items.length+"] LinkedIn items");
			items.forEach(function(item) {
				// check for drop down selections pointing to ad_choices
				if ( countAll(item,"li.option-ad_choice") > 0 || countAll(item,"button.option-button__ad_choice") > 0 ) {
					result.push(item);
					debugMsg(89,"[EXT::getPromotionList]: found LinkedIn AD");
				}
				// check for other types of promoted ads
				else {
					// old style "headline"
					var listHeadline = $(item).find("span.feed-shared-post-meta__headline").toArray();
					if ( listHeadline !== undefined ) {
						debugMsg(89,"[EXT::getPromotionList]: parsing ["+listHeadline.length+"] LinkedIn headlines");
						listHeadline.forEach(function(iHeadline) {
							debugMsg(99,"[EXT::getPromotionList]: headline ["+iHeadline.innerText+"] ");
							if ( iHeadline.innerText === "Promoted" ) {
								result.push(item);
								debugMsg(89,"[EXT::getPromotionList]: found LinkedIn PROMOTED headline");
								return;
							}
						});
					}
					// newer style "sub-description"
					var listSubDesc = $(item).find("span.feed-shared-actor__sub-description").toArray();
					if ( listSubDesc !== undefined ) {
						debugMsg(89,"[EXT::getPromotionList]: parsing ["+listSubDesc.length+"] LinkedIn sub-descriptions");
						listSubDesc.forEach(function(iSubDesc) {
							debugMsg(99,"[EXT::getPromotionList]: sub-description ["+iSubDesc.innerText+"] ");
							if ( iSubDesc.innerText === "Promoted" ) {
								result.push(item);
								debugMsg(89,"[EXT::getPromotionList]: found LinkedIn PROMOTED sub-description");
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
	// not implemented yet
	else if ( linkedout_TrackingSite === "Instagram" ) {
		result = $(mainFeed).find("div.promoted-ZZZ").toArray();
		debugMsg(69,"[EXT::getPromotionList]: found ["+result.length+"] Instagram Ads");
	}
	else if ( linkedout_TrackingSite === "Facebook" ) {
		result = $(mainFeed).find("div.promoted-ZZZ").toArray();
		debugMsg(69,"[EXT::getPromotionList]: found ["+result.length+"] Facebook Ads");
	}
	debugMsg(99,"[EXT::getPromotionList]: END");
	return result === undefined ? Array() : result;
}

function hasTattoo(element) {
	debugMsg(99,"[EXT::hasTattoo]: BEGIN");
	var branded = (countAll(element,"button." + linkedout_TattooClass) > 0);
	/*
	var children = element.childNodes;
	for (var i = 0; i < children.length; i++) {
		if (children[i].classList !== undefined &&
			children[i].classList.contains(linkedout_TattooClass)) {
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
		element.style.display = ( opt.AutoHide ? "none" : "block");
		// apply tattoo
		debugMsg(89,"[EXT::markElement]: Tattoo");
		var btn = document.createElement("button");
		btn.classList.add(linkedout_TattooClass);
		btn.classList.add("button-reset");
		btn.innerText = linkedout_TotalAds.toString(); // "AD";
		btn.addEventListener("click", function () {
			element.style.display = "none";
		});
		btn.style.display = ( opt.Tattoo ? "block" : "none");
		element.appendChild(btn);
	}
	debugMsg(99,"[EXT::markElement]: END");
}

function processFeed() {
	debugMsg(89,"[EXT::processFeed]: BEGIN");
	var tPromotionList = getPromotionList();
	var nCountAds = 0;
	debugMsg(79,"[EXT::processFeed]: checking [" + tPromotionList.length + "] ads ");
	tPromotionList.forEach(function (element) {
		if (!isMarked(element)) {
			nCountAds ++;
			linkedout_TotalAds ++;
			markElement(element);
		}
	});
	debugMsg(59,"[EXT::processFeed]: nCountAds=" + nCountAds + ", TotalAds=" +linkedout_TotalAds);
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
						debugMsg(29,"[EXT]: SITE CHANGED");
						determineSite(true);
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
			chrome.runtime.onMessage.addListener(onNotify);
		}
	}	
    debugMsg(99,"[EXT::checkStatus]: END");
}

function determineSite(doReset) {
    debugMsg(79,"[EXT::determineSite]: BEGIN");
	if ( doReset ) { 	
		resetGlobals();
	}
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
		else if ( linkedout_TrackingURL.startsWith("https://instagram.com")) {
			linkedout_TrackingSite = "Instagram";
			linkedout_FeedContainer = "zzz";
			linkedout_HomeButton = "zzz";
		}
		else if ( linkedout_TrackingURL.startsWith("https://facebook.com")) {
			linkedout_TrackingSite = "Facebook";
			linkedout_FeedContainer = "zzz";
			// this even necessary?
			linkedout_HomeButton = "zzz";  
			// div.data-click="home_icon" or a.data-gt="{"chrome_nav_item":"home_chrome"}"
		}
		linkedout_TotalAds = document.getElementsByClassName("linkedout-class").length;
    }
	enableIcon();
    debugMsg(79,"[EXT::determineSite]: RESULT = " + linkedout_TrackingSite);
}

var listener = function() {
    debugMsg(79,"[EXT::listener]: BEGIN");
	determineSite(false);
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
	determineSite(true);
	window.addEventListener('popstate', listener);
	if (intervalId === undefined) {
		debugMsg(89,"[EXT]: Interval id is undefined, checking status");
		intervalId = setInterval(checkStatus, 200);
	} else {
		debugMsg(89,"[EXT]: Interval id is not undefined");
	}
}

function onNotify(message, sender, sendResponse) {
	debugMsg(99,"[EXT::onNotify]: BEGIN");
	if ( message ) {
		debugMsg(59,"[EXT::onNotify]: action = " + message.action);
		if (message.action === "reset" ) {
			initExtension();
		}
		else if (message.action === "parsePage" ) {
			processFeed();
		}
		else if (message.action === "applyOptions" ) {
			restoreOptions();
		}
	}
	debugMsg(99,"[EXT::onNotify]: END");
}

function disableIcon() {
	chrome.runtime.sendMessage({
		"action" : "enableIcon",
		"value" : false
	});
	chrome.runtime.sendMessage({
		"action" : "updateCount",
		"value" : "-"
	});
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

window.addEventListener('focus', function() {
	debugMsg(99,"[EXT]: FOCUS " + linkedout_TrackingURL);
	enableIcon();
});

// STARTUP HERE
debugMsg(99,"[EXT]: INITIALIZING ...");
initExtension();
debugMsg(99,"[EXT]: INITIALIZAION COMPLETE");
