var StorageManager = function(){

	var aKey = 'K-TabCacher#';

	var getKey = function( aName ){
		return aKey + aName;
	};

	this.getString = function( aKey ){
		return localStorage.getItem( getKey( aKey ) );
	};

	this.getJSON = function( aKey ){
		var aString = localStorage.getItem( getKey( aKey ) );
		if( typeof aString == 'string' ){
			return JSON.parse( aString );
		}
		return {};
	};

	this.save = function( aKey , aValue ){
		if( typeof aValue === 'object' ){
			aValue = JSON.stringify( aValue );
		}
		return localStorage.setItem( getKey( aKey ) , aValue );
	};

	this.remove = function( aKey ){
		return localStorage.removeItem( getKey( aKey ) );
	};
	return;
};

var Tabs = function( tabs , aFirstFlag ){

	var data = tabs;
	var aFlag = aFirstFlag;

	this.openTabs = function( aWindow ){
		var parameters = { windowId : aWindow.id };
		for( var anIndex = aFlag ? 0 : 1 ; anIndex < data.length ; anIndex++ ){
			parameters.url = data[anIndex].aURL;
			chrome.tabs.create( parameters );
		}
		return;
	};

	return;
};

var TabManager = function(){

	var aCacheName = 'Tabs';
	var aLastUpdatedName = 'LastUpdated';
	var aManager = new StorageManager();
	var histories = aManager.getJSON( aCacheName );
	var aMaxCache = 20;
	var aWindowType = 'window';
	var aTabType = 'tab';
	var aLastUpdated = aManager.getString( aLastUpdatedName );

	this.windowClose = window.close;

	var getCurrentTime = function(){
		var aDate = new Date();
		var aResult = aDate.getFullYear().toString() + '年'
			+ ( aDate.getMonth() + 1 ).toString() + '月'
			+ aDate.getDate().toString() + '日 '
			+ aDate.getHours().toString() + '時'
			+ aDate.getMinutes().toString() + '分'
			+ aDate.getSeconds().toString() + '秒';
		return aResult;
	};

	var getAllTabs = function( callback ){
		var getWindows = function( windows ){
			var data = { aType : aWindowType , windows : [] , aName : getCurrentTime() , aTime : new Date().toString() };
			for( var aWindowIndex = 0 ; aWindowIndex < windows.length ; aWindowIndex++ ){
				data.windows[aWindowIndex] = { tabs : [] };
				var tabs = windows[aWindowIndex].tabs;
				for( var aTabIndex = 0 ; aTabIndex < tabs.length ; aTabIndex++ ){
					data.windows[aWindowIndex].tabs[aTabIndex] = {
						aType : aTabType ,
						aURL : tabs[aTabIndex].url ,
						aTitle : tabs[aTabIndex].title ,
						aFavicon : tabs[aTabIndex].favIconUrl
					};
				}
			}
			callback( data );
			return;
		};

		chrome.windows.getAll( { populate : true } , getWindows );
		return;
	};

	var getCurrentTabs = function( callback ){

		var getTabs = function( tabs ){
			var data = { tabs : [] };
			for( var anIndex = 0 ; anIndex < tabs.length ; anIndex++ ){
				data.tabs[anIndex] = {
					aType : aTabType ,
					aURL : tabs[anIndex].url ,
					aTitle : tabs[anIndex].title ,
					aFavicon : tabs[anIndex].favIconUrl
				};
			}
			callback( { aType : aWindowType , windows : [ data ] , aName : getCurrentTime() , aTime : new Date().toString() } );
			return;
		};

		chrome.tabs.getAllInWindow( getTabs );
		return;
	};

	var addHistory = function( data , aName ){
		if( aName ){
			data.aName = aName;
		}
		if( typeof histories !== 'object' || ! ( histories instanceof Array ) ){
			histories = [];
		}
		histories.unshift( data );
		for( var aCount = aMaxCache , aLength = histories.length ; aCount < aLength ; aCount++ ){
			histories.pop();
		}
		return;
	};

	var saveAllTabs = function( data , aName ){
		if( typeof aName != 'undefined' && aName.length > 0 ){
			data.aName = aName;
		}
		addHistory( data );
		aManager.save( aCacheName , histories );
		aLastUpdated = getCurrentTime();
		aManager.save( aLastUpdatedName , aLastUpdated );
		return;
	};

	this.saveAllWindows = function( aName ){
		var callback;
		if( typeof aName == 'undefined' || aName.length === 0 ){
			callback = saveAllTabs;
		}
		else{
			callback = function( data ){
				saveAllTabs( data , aName );
				return;
			};
		}
		getAllTabs( callback );
		return;
	};

	this.saveCurrentWindow = function( aName ){
		var callback;
		if( typeof aName == 'undefined' || aName.length === 0 ){
			callback = saveAllTabs;
		}
		else{
			callback = function( data ){
				saveAllTabs( data , aName );
				return;
			};
		}
		getCurrentTabs( callback );
		return;
	};

	this.getHistories = function(){
		return histories;
	};

	this.getHistory = function( anIndex ){
		if( anIndex < histories.length ){
			return histories[anIndex];
		}
		return null;
	};

	this.open = function( data ){
		data = $.extend( true , data instanceof Array ? [] : {} , data );
		if( data.aType && data.aType === aWindowType ){
			var openWindow = function(){
				if( 0 < data.windows.length > 0 ){
					var tabs = data.windows[0].tabs;
					var parameters = { url : [] , focused : false };
					for( var anIndex = 0 ; anIndex < tabs.length ; anIndex++ ){
						parameters.url[anIndex] = tabs[anIndex].aURL;
					}
					data.windows.shift();
					chrome.windows.create( parameters , openWindow );
				}
				else{
					windowClose();
				}
				return;
			};
			openWindow();
		}
		return;
	};

	this.update = function(){
		var anUpdated = aManager.getString( aLastUpdatedName );
		if( aLastUpdated != anUpdated ){
			aLastUpdated = anUpdated;
			histories = aManager.getJSON( aCacheName );
		}
		return;
	};

	this.isLatest = function(){
		return aLastUpdated == aManager.getString( aLastUpdatedName );
	};

	this.clear = function(){
		aManager.remove( aCacheName );
		aManager.remove( aLastUpdatedName );
		histories = [];
		aLastUpdated = null;
		return;
	};

	this.renameHistory = function( anIndex , aName ){
		if( histories[anIndex] ){
			histories[anIndex].aName = aName;
			aManager.save( aCacheName , histories );
			aLastUpdated = getCurrentTime();
			aManager.save( aLastUpdatedName , aLastUpdated );
			return true;
		}
		return false;
	};

	this.deleteHistory = function( anIndex ){
		if( histories[anIndex] ){
			histories.splice( anIndex , 1 );
			aManager.save( aCacheName , histories );
			aLastUpdated = getCurrentTime();
			aManager.save( aLastUpdatedName , aLastUpdated );
			return true;
		}
		return false;
	};

	return;
};