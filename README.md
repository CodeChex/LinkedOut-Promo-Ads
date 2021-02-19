# ![LinkedOut hide promotional ads logo](src/icons/icon48x48.png) LinkedOut - Hide "Promoted Ads" in social meda feeds

Adds a button for automatic hiding of promotional ads on various social media feeds (LinkedIn/Twitter). 

## Supported browsers
![Firefox](https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Firefox_Logo%2C_2017.svg/64px-Firefox_Logo%2C_2017.svg.png)
![Google Chrome](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Chrome_icon_%28September_2014%29.svg/64px-Google_Chrome_icon_%28September_2014%29.svg.png)

## Installation
### Latest release
* Firefox
  * go to homepage of the extension on [Firefox Addons](https://addons.mozilla.org/en-US/firefox/addon/linkedout-auto-hide-promos) and click **Add to Firefox**
* Chrome
  * go to homepage of the extension on 
[Chrome Web Store](https://chrome.google.com/webstore/detail/ggpfkaknfckpihiphiilfhkpoocijgei) 
and click **Add to Chrome**

## History
### Version 0.9.0
- removed Twitter, FaceBook, Instagram due to their code obsfucation
- rewritten to support namespaces
- updated to identify LinkedIn refresh button 
- updated to identify LinkedIn home button (class/action change)

### Version 0.8.1
- minor fix to manifest (to allow saving options)

### Version 0.8.0
- updated to identify new LinkedIn feed class
- upgraded to JQuery-3.5.1-slim

### Version 0.7.1
- upgraded to JQuery-3.5.0-slim

### Version 0.7.0
- added support for Facebook "Sponsored Ad"

### Version 0.6.3
- updated to find LinkedIn alternate "Promoted" format

### Version 0.6.2
- wrap ads with dotted outline

### Version 0.6.1
- changed tattoo verbiage from "AD" to a counter

### Version 0.6.0
- allow saving/loading of options 
- changed tattoo from stop-sign to cluster marker

### Version 0.5.1
- fixed icon enabled status 

### Version 0.5.0
- total rewrite 
- added toggling of ads/tattoos
- added support for Twitter/LinkedIn 
- added compatibility between Chrome/Firefox
- added icon popup menu

### Development
* Firefox
  * Open menu -> Add-ons (or `Ctrl` + `Shift` + `A`) -> Settings -> Install add-on from file -> Select source directory
* Chrome
  * Type `chrome://extensions/` in the address bar and hit `Enter` -> Load unpacked -> Select source directory

Based on the [LinkedIn-Hide-Article-Button](https://github.com/daniloradenovic/linkedin-hide-article-button) 
