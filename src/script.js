/* 
Branched from "linkedin-hide-article-button"
by: Danilo Radenovic, Anja Stanojevic, Tomo Radenovic
*/

var totalAds = 0;
var currentAds = 0;

//console.debug("[EXT]: BEGIN");

function listenForEvents() {
	//console.debug("[EXT::listenForEvents]: BEGIN");

    var observeDOM = (function () {
		//console.debug("[EXT::listenForEvents::observeDOM]: BEGIN");
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        return function (obj, callback) {
            if (!obj || !obj.nodeType === 1) return; // validation

            if (MutationObserver) {
                // define a new observer
                var obs = new MutationObserver(function (mutations, observer) {
                    if (mutations[0].addedNodes.length || mutations[0].removedNodes.length)
                        callback(mutations[0]);
                });
                // have the observer observe foo for changes in children
                obs.observe(obj, {childList: true, subtree: true});
            }

            else if (window.addEventListener) {
                obj.addEventListener('DOMNodeInserted', callback, false);
            }
        }
		//console.debug("[EXT::listenForEvents::observeDOM]: END");
    })();

    function getDivsWithDataIdAttribute() {
		//console.debug("[EXT::listenForEvents::getDivsWithDataIdAttribute]: BEGIN");

        var coreRail = document.getElementsByClassName("core-rail")[0];
        var result = $(coreRail).find("div[data-id]").toArray();

		//console.debug("[EXT::listenForEvents::getDivsWithDataIdAttribute]: RESULT = " + result);
        return result === undefined ? Array() : result;
    }
	
	function countAll(element,objectType) {
		//console.debug("[EXT::listenForEvents::countAll("+objectType+")]: BEGIN");
		var p = $(element).find(objectType).toArray();
		//console.debug("[EXT::listenForEvents::countAll("+objectType+")]: END = " + p);
		return ( p === undefined ) ? 0 : p.length; 
	}

	function isPromotionalAd(element) {
		//console.debug("[EXT::listenForEvents::isPromotionalAd("+element["data-id"]+")]: BEGIN");
		var found = countAll(element,"li.option-ad_choice")
			+ countAll(element,"button.option-button__ad_choice");
		//console.debug("[EXT::listenForEvents::isPromotionalAd("+element["data-id"]+")]: RESULT = " + found);
		return found > 0;
	}

    function addHideButton(element) {
		//console.debug("[EXT::listenForEvents::addHideButton("+element["data-id"]+")]: BEGIN");
        var btn = document.createElement("INPUT");
        btn.setAttribute("type", "button");
        btn.setAttribute("value", "hide");
        btn.classList.add("hide-article-button");
        btn.classList.add("button-reset");
        btn.addEventListener("click", function () {
            if (element !== undefined) {
                // find the original button for hiding and click on it
                var liOption = element.querySelector("li.option-hide-update");
                var artdecoButtonItem = liOption.querySelector("artdeco-dropdown-item");
                artdecoButtonItem.click();
                // hide the custom button
                btn.style.display = "none";
            }
        });
        element.appendChild(btn);
		//console.debug("[EXT::listenForEvents::addHideButton("+element["data-id"]+")]: END");
    }
	
	function processFeed() {
		//console.debug("[EXT::listenForEvents::processFeed]: BEGIN");
        var elementsWithDataIdAttribute = getDivsWithDataIdAttribute("div", "data-id");
    	currentAds = 0;
		elementsWithDataIdAttribute.forEach(function (element) {
			if ( isPromotionalAd(element) ) {
				var containsButton = false; //countAll(element,"input.hide-article-button") > 0;
				
				var children = element.childNodes;
				for (var i = 0; i < children.length; i++) {
					if (children[i].classList !== undefined &&
						children[i].classList.contains("hide-article-button")) {
						containsButton = true;
						break;
					}
				}
				
				if (!containsButton) {
					currentAds ++;
					totalAds ++;
					addHideButton(element);
					console.debug("[EXT::listenForEvents::processFeed]: updateBadgeCount("+totalAds+")");
					chrome.runtime.sendMessage({
						"action" : "updateCount",
						"value" : totalAds
					});
					element.style.display = "none";
				}
			}
        });
		if ( currentAds > 0 ) {
			console.debug("[EXT::listenForEvents::processFeed]: currentAds="+currentAds+", totalAds="+totalAds);
		}
		//console.debug("[EXT::listenForEvents::processFeed]: END");
	}
	
    // there is only one coreRail element on the page
    var coreRail = document.getElementsByClassName("core-rail")[0];
    // add hide button to elements that already exist in core-rail
 	processFeed();
    // start listening for events
    //console.debug("[EXT::listenForEvents]: Observing DOM...");
    observeDOM(coreRail, function () {
		//console.debug("[EXT::listenForEvents::observeDOM]: BEGIN");
		processFeed();
		//console.debug("[EXT::listenForEvents::observeDOM]: END");
    });

	//console.debug("[EXT::listenForEvents]: END");
}

function addListenerForHomeButton() {
    //console.debug("[EXT::addListenerForHomeButton]: BEGIN");
    var homeButton = document.getElementById("feed-nav-item");
    homeButton.addEventListener("click", function () {

        var intervalId = undefined;

        function checkStatus() {
			//console.debug("[EXT::addListenerForHomeButton::checkStatus]: BEGIN");
            var coreRail = document.getElementsByClassName("core-rail")[0];
            if (coreRail !== undefined &&
                coreRail.children !== undefined &&
                coreRail.children.length <= 2) {
                console.debug("[EXT::ListenerForHomeButton::checkStatus]: Core rail still not ready, waiting...");
            } else {
                console.debug("[EXT::ListenerForHomeButton::checkStatus]: Core rail is ready, it has " + coreRail.children.length + " elements");
                clearInterval(intervalId);
                listenForEvents();
            }
			//console.debug("[EXT::addListenerForHomeButton::checkStatus]: END");
        }

        intervalId = setInterval(checkStatus, 200);
    });
    //console.debug("[EXT::addListenerForHomeButton]: END");
}

/**
 *  ##################
 *  Script starts here
 *  ##################
 */
var intervalId = undefined;

function checkStatus() {
    //console.debug("[EXT::checkStatus]: BEGIN");

    /*
     Although the document.readyState should be 'complete' at this point,
     or in other words, page should be ready, we check for readiness in case
     a document takes a lot of time to load
     (see https://developer.chrome.com/extensions/content_scripts#run_time)
     */
    if (document.readyState !== "complete") {
        console.debug("[EXT::checkStatus]: Document not yet ready, waiting...");
        return;
    }
    var coreRail = document.getElementsByClassName("core-rail")[0];

    if (coreRail !== undefined &&
        coreRail.children !== undefined
        && coreRail.children.length <= 2) {
        console.debug("[EXT::checkStatus]: Core rail still not ready, waiting...");
    } else {
        console.debug("[EXT::checkStatus]: Corerail is ready, it has " + coreRail.children.length + " elements");
        clearInterval(intervalId);
        intervalId = undefined;
        addListenerForHomeButton();
        listenForEvents();
    }
    //console.debug("[EXT::checkStatus]: END");
}

var listener = function() {
    //console.debug("[EXT::listener]: BEGIN");
    var newUrl = window.location.href;
    if (newUrl !== undefined && newUrl.startsWith("https://www.linkedin.com/feed")) {
        console.debug("[EXT::listener]: Starting to listen for events");
        if (intervalId === undefined) {
            console.debug("Interval id is undefined, checking status");
            intervalId = setInterval(checkStatus, 200);
        } else {
            console.debug("[EXT::listener]: Interval id is defined");
        }
    }
    //console.debug("[EXT::listener]: END");
};

window.addEventListener('popstate', listener);

if (intervalId === undefined) {
    console.debug("[EXT]: Interval id is undefined, checking status");
    intervalId = setInterval(checkStatus, 200);
} else {
    console.debug("[EXT]: Interval id is not undefined");
}
