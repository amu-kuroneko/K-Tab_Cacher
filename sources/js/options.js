var ID_HISTORIES = '#histories';
var ID_UPDATE = '#update';
var ID_CLEAR = '#clear';
var ID_DETAIL_AREA = '#detailArea';
var ID_ALL_SAVE = '#allSave';
var ID_CURRENT_SAVE = '#currentSave';
var ID_ALL_SAVE_AS = '#allSaveAs';
var ID_CURRENT_SAVE_AS = '#currentSaveAs';
var ID_SAVE_AREA = '#saveArea';
var ID_SAVE_TITLE = '#saveTitle';
var ID_SAVE_BUTTON = '#saveButton';
var ID_WINDOWS = '#windows';
var ID_RESTORE_BUTTON = '#restoreButton';
var ID_UPDATE_BUTTON = '#updateButton';
var ID_DELETE_BUTTON = '#deleteButton';

var CLASS_HISTORY = '.history';
var CLASS_ACTIVE = '.active';

var NAME_TYPE = '[name=type]';
var NAME_NAME = '[name=name]';
var NAME_RENAME = '[name=rename]';
var NAME_WINDOW = '[name=window]';

var ATTRIBUTE_INDEX = 'index';

var EVENT_CLICK = 'click';

var VALUE_ACTIVE = 'active';
var VALUE_ENTER = 13;

var TYPE_NONE = '0';
var TYPE_ALL_SAVE = '1';
var TYPE_CURRENT_SAVE = '2';

var DEFAULT_WINDOW = '-1';
var INTERVAL_TIME = 200;

var aManager = new TabManager();
var histories = null;

var escape = function( aString ){
	if( aString ){
		return aString.replace( /&/g , '&amp;' )
			.replace( /"/g , '&quot;' )
			.replace( /'/g , '&#039;')
			.replace( /</g , '&lt;' )
			.replace( />/g , '&gt;' );
	}
	else{
		return '';
	}
};

var updateHistory = function(){
	aManager.update();
	histories = aManager.getHistories();
	if( histories ){
		var anElement = $(ID_HISTORIES);
		anElement.text( '' );
		for( var anIndex in histories ){
			var aName = escape( histories[anIndex].aName );
			anElement.append(
				"<li class='command history' index='" + anIndex + "' title='" + aName + "' >\n" +
					aName + "\n" +
				"</li>\n"
			);
		}
		hideDetail();
	}
	return;
};

var initialize = function(){
	updateHistory();
	return;
};

var hideDetail = function(){
	$(ID_DETAIL_AREA).hide();
	$(NAME_RENAME).val( '' );
	$(NAME_WINDOW).val( DEFAULT_WINDOW );
	nonActive();
	return;
};

var hideSaveArea = function(){
	$(ID_SAVE_AREA).hide();
	$(NAME_NAME).val( '' );
	$(NAME_TYPE).val( TYPE_NONE );
	nonActive();
	return;
};

var clear = function(){
	aManager.clear();
	updateHistory();
	hideDetail();
	return;
};

var saveAll = function(){
	aManager.saveAllWindows();
	setTimeout( updateHistory , INTERVAL_TIME );
	return;
};

var saveCurrent = function(){
	aManager.saveCurrentWindow();
	setTimeout( updateHistory , INTERVAL_TIME );
	return;
};

var showSaveDisplay = function( aTitle ){
	$(ID_DETAIL_AREA).hide();
	$(ID_SAVE_AREA).show();
	$(ID_SAVE_TITLE).text( aTitle );
	return;
};

var showSaveAsAllWindows = function(){
	nonActive();
	$(this).addClass( VALUE_ACTIVE );
	$(NAME_TYPE).val( TYPE_ALL_SAVE );
	showSaveDisplay( $(this).text() );
	return;
};

var showSaveAsCurrentWindows = function(){
	nonActive();
	$(this).addClass( VALUE_ACTIVE );
	$(NAME_TYPE).val( TYPE_CURRENT_SAVE );
	showSaveDisplay( $(this).text() );
	return;
};

var saveAs = function(){
	var aName = $(NAME_NAME).val();
	if( aName.length > 0 ){
		switch( $(NAME_TYPE).val() ){
			case TYPE_ALL_SAVE :
				aManager.saveAllWindows( aName );
				break;

			case TYPE_CURRENT_SAVE :
				aManager.saveCurrentWindow( aName );
				break;

			default :
				return;
		}
		setTimeout( updateHistory , INTERVAL_TIME );
		$(NAME_NAME).val( '' );
	}
	return;
};

var enterSaveAs = function( anEvent ){
	if( anEvent.which == VALUE_ENTER ){
		saveAs();
	}
	return;
};

var nonActive = function(){
	$(CLASS_ACTIVE).removeClass( VALUE_ACTIVE );
	return;
};

var showHistory = function(){
	var anIndex = $(this).attr( ATTRIBUTE_INDEX );
	if( histories[anIndex] ){
		$(NAME_WINDOW).val( anIndex );
		$(NAME_RENAME).val( histories[anIndex].aName );
		var anElement = $(ID_WINDOWS);
		anElement.text( '' );
		for( var aWindowIndex in histories[anIndex].windows ){
			anElement.append(
				"<li class='window' >\n" +
					"<div class='windowTitle' >Window " + ( parseInt( aWindowIndex ) + 1 ) + "</div>\n" +
					"<ul class='tabs' >\n"
			);
			var aWindow = histories[anIndex].windows[aWindowIndex];
			for( var aTabIndex in aWindow.tabs ){
				var aTab = aWindow.tabs[aTabIndex];
				anElement.append(
					"<li class='tab' >\n" +
						"<a class='tabAnchor' href='" + escape( aTab.aURL ) + "' target='_blank' >\n" +
							"<img class='favicon' src='" + escape( aTab.aFavicon ) + "' />\n" +
							"<span class='tabTitle' >" + escape( aTab.aTitle ) + "</span>\n" +
							"<span class='tabURL' >" + escape( aTab.aURL ) + "</span>\n" +
						"</a>\n" +
					"</li>\n"
				);
			}
			anElement.append(
					"</ul>\n" +
				"</li>\n"
			);
		}
		hideSaveArea();
		$(this).addClass( VALUE_ACTIVE );
		$(ID_DETAIL_AREA).show();
	}
	return;
};

var restore = function(){
	var anIndex = $(NAME_WINDOW).val();
	if( anIndex != DEFAULT_WINDOW ){
		aManager.open( histories[anIndex] );
	}
	return;
};

var rename = function(){
	if( aManager.isLatest() ){
		var aName = $(NAME_RENAME).val();
		var anIndex = $(NAME_WINDOW).val();
		if( typeof aName != 'undefined' && 0 < aName.length && anIndex != DEFAULT_WINDOW ){
			if( aManager.renameHistory( anIndex , aName ) ){
				$('[' + ATTRIBUTE_INDEX + '=' + anIndex + ']').text( aName );
			}
		}
	}
	else{
		alert( '最新の状態に更新してください。' );
	}
	return;
};

var enterRename = function( anEvent ){
	if( anEvent.which == VALUE_ENTER ){
		rename();
	}
	return;
};

var deleteHistory = function(){
	if( aManager.isLatest() ){
		var anIndex = $(NAME_WINDOW).val();
		if( anIndex != DEFAULT_WINDOW ){
			if( aManager.deleteHistory( anIndex ) ){
				updateHistory();
			}
		}
	}
	return;
};

$(document).ready(function(){
	initialize();
	$(ID_UPDATE).click(updateHistory);
	$(ID_CLEAR).click(clear);
	$(ID_ALL_SAVE).click(saveAll);
	$(ID_CURRENT_SAVE).click(saveCurrent);
	$(ID_ALL_SAVE_AS).click(showSaveAsAllWindows);
	$(ID_CURRENT_SAVE_AS).click(showSaveAsCurrentWindows);
	$(ID_SAVE_BUTTON).click(saveAs);
	$(NAME_NAME).keypress(enterSaveAs);
	$(document).on( EVENT_CLICK , CLASS_HISTORY , showHistory );
	$(ID_RESTORE_BUTTON).click(restore);
	$(ID_UPDATE_BUTTON).click(rename);
	$(NAME_RENAME).keypress(enterRename);
	$(ID_DELETE_BUTTON).click(deleteHistory);
	return;
});