var ID_COMMANDS = '#commands';
var ID_OPTIONS = '#options';
var ID_SAVE_AS = '#saveAs';
var ID_ALL_SAVE = '#allSave';
var ID_CURRENT_SAVE = '#currentSave';
var ID_ALL_SAVE_AS = '#allSaveAs';
var ID_CURRENT_SAVE_AS = '#currentSaveAs';
var ID_RESTORE = '#restore';
var ID_DATE = '#date';
var ID_LINE = '#line';
var ID_BACK_BUTTON = '#backButton';
var ID_SAVE_BUTTON = '#saveButton';
var NAME_TYPE = '[name=type]';
var NAME_NAME = '[name=name]';

var TYPE_NONE = '0';
var TYPE_ALL_SAVE = '1';
var TYPE_CURRENT_SAVE = '2';

var VALUE_ENTER = 13;

var OPTIONS_FILE = 'options.html';

var aManager = new TabManager();
var aHistory = null;

var windowClose = window.close;

window.close = function(){ return; };

var openOptions = function(){
	var parameters = { url : chrome.extension.getURL( OPTIONS_FILE ) };
	chrome.tabs.create( parameters );
	windowClose();
	return;
};

var updateHistory = function(){
	aManager.update();
	aHistory = aManager.getHistory( 0 );
	if( aHistory ){
		$(ID_LINE).show();
		$(ID_RESTORE).show();
		$(ID_DATE).text( aHistory.aName );
	}
	return;
};

var initialize = function(){
	updateHistory();
	return;
};

var saveAll = function(){
	aManager.saveAllWindows();
	updateHistory();
	windowClose();
	return;
};

var saveCurrent = function(){
	aManager.saveCurrentWindow();
	updateHistory();
	windowClose();
	return;
};

var showSaveDisplay = function(){
	$(ID_COMMANDS).hide();
	$(ID_SAVE_AS).show();
	return;
};

var showSaveAsAllWindows = function(){
	$(NAME_TYPE).val( TYPE_ALL_SAVE );
	showSaveDisplay();
	return;
};

var showSaveAsCurrentWindows = function(){
	$(NAME_TYPE).val( TYPE_CURRENT_SAVE );
	showSaveDisplay();
	return;
};

var restore = function(){
	aManager.open( aHistory );
	return;
};

var back = function(){
	$(NAME_TYPE).val( TYPE_NONE );
	$(NAME_NAME).val( '' );
	$(ID_SAVE_AS).hide();
	$(ID_COMMANDS).show();
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
		updateHistory();
		windowClose();
	}
	return;
};

var enterSaveAs = function( anEvent ){
	if( anEvent.which == VALUE_ENTER ){
		saveAs();
	}
	return;
};

$(document).ready(function(){
	initialize();
	$(ID_OPTIONS).click(openOptions);
	$(ID_ALL_SAVE).click(saveAll);
	$(ID_CURRENT_SAVE).click(saveCurrent);
	$(ID_RESTORE).click(restore);
	$(ID_ALL_SAVE_AS).click(showSaveAsAllWindows);
	$(ID_CURRENT_SAVE_AS).click(showSaveAsCurrentWindows);
	$(ID_BACK_BUTTON).click(back);
	$(ID_SAVE_BUTTON).click(saveAs);
	$(NAME_NAME).keypress(enterSaveAs);
	return;
});