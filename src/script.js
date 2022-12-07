/* 
Copyleft (c) 2018-2022, Checco Computer Services

Version 0.9.2
- Save & Apply" button will reparse existing feed
- adjusted for LinkedIn new "Feed" container

Version 0.9.1
- refactored for Chrome Manifest v3
- reactivated Twitter, FaceBook, Instagram

Version 0.9.0
- removed Twitter, FaceBook, Instagram due to their code obsfucation
- rewritten to support namespaces
- updated to identify LinkedIn refresh button 
- updated to identify LinkedIn home button (class/action change)

Version 0.8.0
- updated to identify LinkedIn feed (class change)
- upgraded to JQuery-3.5.1-slim

Version 0.7.1
- upgraded to JQuery-3.5.0-slim

Version 0.7.0
- add support for Facebook "Sponsored" tiles

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
var ctx = this;
var LinkedOut = {
	TrackingURL		: document.location.origin,
	TotalAds		: -1,
	TrackingSite	: undefined,
	FeedContainerQ	: undefined,
	HomeButtonQ		: undefined,
	RefreshButtonQ	: undefined,
	FeedURL			: undefined,
	Browser			: (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) ? "chrome" : "mozilla",
	TattooClass		: "-tattoo",
	intervalId 		: undefined,
	opt : {
		Tattoo		: true,
		AutoHide 	: false
	},
	DebugLevel 		: 99
};
LinkedOut.TattooClass = LinkedOut.Browser + "-tattoo";

function debugMsg(minLevel,msg) {
	if (ctx.LinkedOut.DebugLevel >= minLevel) console.debug("(" + minLevel + ")-" + msg);
}

function onError(error) {
	console.error(`Error: ${error}`);
}

function restoreOptions() {
	function loadOptions(result) {
		if ( result ) {
			ctx.LinkedOut.opt = result;
			$("." + ctx.LinkedOut.TattooClass).css("display", ctx.LinkedOut.opt.Tattoo ? "block" : "none" );
			$(".linkedout-class").css("display", ctx.LinkedOut.opt.AutoHide ? "none" : "block");
			debugMsg(49,"[EXT]: restoreOptions = " 
					+ "\n\t hide=" + ctx.LinkedOut.opt.AutoHide 
					+ "\n\t tattoo=" + ctx.LinkedOut.opt.Tattoo);
		}
	}
	if (ctx.LinkedOut.Browser === "chrome") {
		chrome.storage.local.get(null,loadOptions);
	}
	else {
		browser.storage.local.get(null).then(loadOptions, onError);
	}
}

function resetGlobals() {
	disableIcon();
	ctx.LinkedOut.TrackingURL = document.location.origin;
	ctx.LinkedOut.TotalAds = 0;
	ctx.LinkedOut.TrackingSite = undefined;
	ctx.LinkedOut.FeedContainerQ = undefined;
	ctx.LinkedOut.HomeButtonQ = undefined;
	ctx.LinkedOut.RefreshButtonQ = undefined;
	ctx.LinkedOut.FeedURL = undefined;
	restoreOptions();
}

function countAll(element,objectType) {
	var p = $(element).find(objectType).toArray();
	var count = ( p === undefined ) ? 0 : p.length; 
	debugMsg(99,"[EXT::countAll("+objectType+")]: " + count);
	return count;
}

function getMainFeed() {
	var tFeed = $(ctx.LinkedOut.FeedContainerQ)[0];
	return tFeed;
}

function getPromotionList() {
	var result = Array();
	debugMsg(89,"[EXT::getPromotionList]: BEGIN");
	var mainFeed = getMainFeed();
	if ( ctx.LinkedOut.TrackingSite === "LinkedIn" ) {
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
					// old-school "headline"
					var listHeadline = $(item).find("span"+ctx.LinkedOut.headline_class).toArray();
					if ( listHeadline !== undefined ) {
						debugMsg(89,"[EXT::getPromotionList]: parsing ["+listHeadline.length+"] LinkedIn headlines");
						listHeadline.forEach(function(iHeadline) {
							debugMsg(99,"[EXT::getPromotionList]: headline ["+iHeadline.innerText+"] ");
							if ( iHeadline.innerText === ctx.LinkedOut.headline_text ) {
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
	else if ( ctx.LinkedOut.TrackingSite === "Twitter" ) {
		result = $(mainFeed).find("div.promoted-tweet").toArray();
		debugMsg(69,"[EXT::getPromotionList]: found ["+result.length+"] Twitter Ads");
	}
	// not implemented yet
	else if ( ctx.LinkedOut.TrackingSite === "Instagram" ) {
		result = $(mainFeed).find("div.promoted-ZZZ").toArray();
		debugMsg(69,"[EXT::getPromotionList]: found ["+result.length+"] Instagram Ads");
	}
	else if ( ctx.LinkedOut.TrackingSite === "Facebook" ) {
		var items = $(mainFeed).find("div.sponsored_ad").toArray();
		if ( items !== undefined ) {
			debugMsg(79,"[EXT::getPromotionList]: parsing ["+items.length+"] Facebook items");
			items.forEach(function(item) {
				// check for class of "sponsored_ad"
				result.push(item);
				debugMsg(89,"[EXT::getPromotionList]: found Facebook AD");
			});
			debugMsg(69,"[EXT::getPromotionList]: found ["+result.length+"] Facebook Ads");
		}
	}
	debugMsg(99,"[EXT::getPromotionList]: END");
	return result === undefined ? Array() : result;
}

function hasTattoo(element) {
	debugMsg(99,"[EXT::hasTattoo]: BEGIN");
	var branded = (countAll(element,"button." + ctx.LinkedOut.TattooClass) > 0);
	/*
	var children = element.childNodes;
	for (var i = 0; i < children.length; i++) {
		if (children[i].classList !== undefined &&
			children[i].classList.contains(ctx.LinkedOut.TattooClass)) {
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
		element.style.display = ( ctx.LinkedOut.opt.AutoHide ? "none" : "block");
		// apply tattoo
		debugMsg(89,"[EXT::markElement]: Tattoo");
		var btn = document.createElement("button");
		btn.classList.add(ctx.LinkedOut.TattooClass);
		btn.classList.add("button-reset");
		btn.innerText = ctx.LinkedOut.TotalAds.toString(); // "AD";
		btn.addEventListener("click", function () {
			element.style.display = "none";
		});
		btn.style.display = ( ctx.LinkedOut.opt.Tattoo ? "block" : "none");
		element.appendChild(btn);
	}
	debugMsg(99,"[EXT::markElement]: END");
}

function processFeed() {
	debugMsg(89,"[EXT::processFeed]: BEGIN");
	var tPromotionList = getPromotionList();
	var nCountAds = 0;
	// stop delayed testing
	clearInterval(ctx.LinkedOut.intervalId);
	ctx.LinkedOut.intervalId = undefined;
	// start checking data
	debugMsg(79,"[EXT::processFeed]: checking [" + tPromotionList.length + "] ads ");
	tPromotionList.forEach(function (element) {
		if (!isMarked(element)) {
			nCountAds ++;
			ctx.LinkedOut.TotalAds ++;
			markElement(element);
		}
	});
	debugMsg(59,"[EXT::processFeed]: nCountAds=" + nCountAds + ", TotalAds=" +ctx.LinkedOut.TotalAds);
	if ( nCountAds > 0 ) {
		chrome.runtime.sendMessage({
			"action" : "updateCount",
			"value" : ctx.LinkedOut.TotalAds
		});
	}
	debugMsg(99,"[EXT::processFeed]: END");
}

function delayFeedCheck() {
	//debugMsg(99,"[EXT::" + caller + "]: BEGIN");
	clearInterval(ctx.LinkedOut.intervalId);
	ctx.LinkedOut.intervalId = setInterval(checkStatus, 200);
	//debugMsg(99,"[EXT::" + caller + "]: END");
}

function waitForFeed() {
	debugMsg(79,"[EXT::waitForFeed]: BEGIN");

    var observeDOM = (function () {
		debugMsg(89,"[EXT::waitForFeed::observeDOM]: BEGIN");
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        return function (obj, callback) {
            if (!obj || !obj.nodeType === 1) return; // validation

            if (MutationObserver) {
                // define a new observer
                var obs = new MutationObserver(function (mutations, observer) {
					if (ctx.LinkedOut.TrackingURL != document.location.origin) {
						debugMsg(29,"[EXT]: SITE CHANGED");
						determineSite(true);
						if (ctx.LinkedOut.intervalId === undefined) {
							debugMsg(99,"[EXT]: Interval id is undefined, checking status");
							ctx.LinkedOut.intervalId = setInterval(checkStatus, 200);
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
		debugMsg(99,"[EXT::waitForFeed::observeDOM]: END");
    })();
	
    // there is only one mainFeed element on the page
    var mainFeed = getMainFeed();
    // add hide button to elements that already exist in main feed
 	processFeed();
    // start listening for events
    observeDOM(mainFeed, function () {
		debugMsg(89,"[EXT::waitForFeed]: Observing DOM...");
 		processFeed();
    });
	debugMsg(99,"[EXT::waitForFeed]: END");
}

function addListenerForPopState() {
	try {
		window.addEventListener('popstate', delayFeedCheck);
	} catch (e) {
		debugMsg(99,"[EXT::addListenerForPopState]: error: " + e);
	}
}

function addListenerForRefreshButton() {
	if ( ctx.LinkedOut.RefreshButtonQ !== undefined ) {
		try {
            $(ctx.LinkedOut.RefreshButtonQ).bind('click', delayFeedCheck);
			//$(document).on('click', ctx.LinkedOut.RefreshButtonQ, delayFeedCheck);
		} catch (e) {
			debugMsg(99,"[EXT::ClickBind_RefreshButton]: error: " + e);
		}
	}
}

function addListenerForHomeButton() {
	if ( ctx.LinkedOut.HomeButtonQ !== undefined ) {
		try {
            $(ctx.LinkedOut.HomeButtonQ).bind('click', delayFeedCheck);
			//$(document).on('click', ctx.LinkedOut.HomeButtonQ, delayFeedCheck);
		} catch (e) {
			debugMsg(99,"[EXT::ClickBind_HomeButton]: error: " + e);
		}
	}
}

/**
 *  ##################
 *  Script starts here
 *  ##################
 */
function checkStatus() {
    debugMsg(79,"[EXT::checkStatus]: BEGIN");
    debugMsg(99,"[EXT::checkStatus]: Document ready state = " + document.readyState);
	if ( ctx.LinkedOut.FeedContainerQ === undefined ) {
        debugMsg(89,"[EXT::checkStatus]: Document ready, site not determined...");
	}
	else {
		var mainFeed = getMainFeed();
		if (mainFeed === undefined || mainFeed.children === undefined || mainFeed.children.length <= 2) {
			debugMsg(89,"[EXT::checkStatus]: Main Feed ("+ctx.LinkedOut.FeedContainerQ+") still not ready, waiting...");
		} else {
			debugMsg(89,"[EXT::checkStatus]: Main Feed ("+ctx.LinkedOut.FeedContainerQ+") is ready, it has " + mainFeed.children.length + " elements");
			clearInterval(ctx.LinkedOut.intervalId);
			ctx.LinkedOut.intervalId = undefined;
			waitForFeed();
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
    if (ctx.LinkedOut.TrackingURL !== undefined ) {
		debugMsg(89,"[EXT::determineSite]: URL = " + ctx.LinkedOut.TrackingURL);
		if ( ctx.LinkedOut.TrackingURL.startsWith("https://www.linkedin.com")) {
			ctx.LinkedOut.TrackingSite = "LinkedIn";
			ctx.LinkedOut.FeedContainerQ = ".scaffold-finite-scroll__content"; // DOM class
			ctx.LinkedOut.HomeButtonQ = "a[href*='/feed/']"; // DOM attr 
			ctx.LinkedOut.RefreshButtonQ = "button[data-control-name='new_updates']"; // DOM attr 
			ctx.LinkedOut.FeedURL = "/feed/";
			ctx.LinkedOut.headline_class = ".update-components-actor__sub-description";
			ctx.LinkedOut.headline_text = "Promoted";

		}
		/* removed 2021-Feb-19 due to code obsfucation
		else if ( ctx.LinkedOut.TrackingURL.startsWith("https://twitter.com")) {
			ctx.LinkedOut.TrackingSite = "Twitter";
			ctx.LinkedOut.FeedContainerQ = ".stream-items"; // DOM class
			ctx.LinkedOut.HomeButtonQ = "#global-nav-home"; // DOM id
			ctx.LinkedOut.FeedURL = "/home";
		}
		else if ( ctx.LinkedOut.TrackingURL.startsWith("https://www.facebook.com")) {
			ctx.LinkedOut.TrackingSite = "Facebook";
			ctx.LinkedOut.FeedContainerQ = "#stream_pagelet"; // DOM id
			// this even necessary?
			ctx.LinkedOut.HomeButtonQ = "a[data-gt*='home_chrome']";  
			// div.data-click="home_icon" or a.data-gt="{"chrome_nav_item":"home_chrome"}"
		}
		else if ( ctx.LinkedOut.TrackingURL.startsWith("https://instagram.com")) {
			ctx.LinkedOut.TrackingSite = "Instagram";
			ctx.LinkedOut.FeedContainerQ = ".zzz";
			ctx.LinkedOut.HomeButtonQ = ".zzz";
		}
		-- */
		ctx.LinkedOut.TotalAds = $(".linkedout-class").length;
    }
	enableIcon();
    debugMsg(79,"[EXT::determineSite]: RESULT = " + ctx.LinkedOut.TrackingSite);
}

function initExtension() {
	debugMsg(99,"[EXT]: INITIALIZING ...");
	determineSite(true);
	addListenerForPopState();
	addListenerForHomeButton();
	addListenerForRefreshButton();
	chrome.runtime.onMessage.addListener(onNotify);
	delayFeedCheck();
	debugMsg(99,"[EXT]: INITIALIZAION COMPLETE");
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
			processFeed();
		}
	}
	debugMsg(99,"[EXT::onNotify]: END");
}

function disableIcon() {
	try {
		chrome.runtime.sendMessage({
			"action" : "enableIcon",
			"value" : false
		});
	} catch (e) {
		debugMsg(99,"[EXT::disableIcon]: error: " + e);
	}
	try {
		chrome.runtime.sendMessage({
			"action" : "updateCount",
			"value" : "-"
		});
	} catch (e) {
		debugMsg(99,"[EXT::resetCount]: error: " + e);
	}
}

function enableIcon() {
	try {
		chrome.runtime.sendMessage({
			"action" : "enableIcon",
			"value" : (ctx.LinkedOut.TrackingURL !== undefined)
		});
	} catch (e) {
		debugMsg(99,"[EXT::enableIcon]: error: " + e);
	}
	try {
		chrome.runtime.sendMessage({
			"action" : "updateCount",
			"value" : ctx.LinkedOut.TotalAds
		});
	} catch (e) {
		debugMsg(99,"[EXT::updateCount]: error: " + e);
	}
}

window.addEventListener('focus', function() {
	debugMsg(99,"[EXT]: FOCUS " + ctx.LinkedOut.TrackingURL);
	enableIcon();
});

// STARTUP HERE
initExtension();

