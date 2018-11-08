# ![Linkedin hide promotional ads logo](src/icons/icon48x48.png) LinkedIn hide promotional ads

Adds a button for automatic hiding of promotional ads on LinkedIn's homepage. 

## Supported browsers
![Firefox](https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Firefox_Logo%2C_2017.svg/64px-Firefox_Logo%2C_2017.svg.png)
![Google Chrome](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Chrome_icon_%28September_2014%29.svg/64px-Google_Chrome_icon_%28September_2014%29.svg.png)

## Installation
### Latest release
* Firefox
  * go to homepage of the extension on [Firefox Addons](https://github.com/CodeChex/LinkedOut-Promo-Ads) and click **Add to Firefox**
* Chrome
  * go to homepage of the extension on 
[Chrome Web Store](https://chrome.google.com/webstore/detail/LinkedOut-Promo-Ads/TBD) 
and click **Add to Chrome**

### Development
* Firefox
  * Open menu -> Add-ons (or `Ctrl` + `Shift` + `A`) -> Settings -> Install add-on from file -> Select source directory
* Chrome
  * Type `chrome://extensions/` in the address bar and hit `Enter` -> Load unpacked -> Select source directory

## Building the plugin from source

### Pre-requisites

The following dependencies with their versions are required to build the plugin.
Prior versions of these dependencies will likely work as well:
* node v8.10.0
* npm v3.5.2

To install `node` and all the `npm` modules, 
run the following in terminal (required only the first time):

#### Linux
```
apt-get install node
npm install
```
#### OS X
```
brew install node
npm install
```
To build the plugin, run:
```
gulp
```
This will create a **dist** directory which contains all the plugin content
with minified code, along with a .zip archive required for web stores.

## Based on the "linkedin-hide-article-button" from:
* [Anja Stanojevic](https://www.linkedin.com/in/anja-stanojevic-459a5631/)
* [Tomo Radenovic](https://www.linkedin.com/in/tomo-radenovic-a59a4971/)
* [Danilo Radenovic](https://www.daniloradenovic.com)