var cnsRegex = new RegExp("<\\s*page\\s*>\\s*([0-9a-fA-F]{1,2})\\s*<\\s*/\\s*page\\s*>\\s*<\\s*code\\s*>\\s*([0-9a-fA-F]{1,4})\\s*<\\s*/\\s*code\\s*>","i");
function triggerHardwordKeyBoardOnStartup(idSelector, hardwordTriggerBtnId) {
	if(cnsRegex.test($(idSelector).val())) {
		if($(hardwordTriggerBtnId).attr('src') === '/tps/images/hard_1.jpg') {
			$(hardwordTriggerBtnId).click();
		}
	}
}

function triggerHardwordKeyBoardOnStartupWithTimer(idSelector, hardwordTriggerBtnId) {
	waitForHardwordElementInit(idSelector, function() {
		if(cnsRegex.test($(idSelector).val())) {
			if($(hardwordTriggerBtnId).attr('src') === '/tps/images/hard_1.jpg') {
				$(hardwordTriggerBtnId).click();
			}
		}
		// 回復css
		if($(document.body).css('overflowY') === 'hidden') {
			$(document.body).css('overflowY', 'scroll')
		}
	});
}

function waitForHardwordElementInit(selector, callback) {
	var intervalId = setInterval(function() {
		var jQueryObj = $(selector);
		if(jQueryObj.length < 1) {
			return;
		}
		clearInterval(intervalId);
		callback(jQueryObj);
	}, 100);
}

function getCns(name) {
	let target = $(name);
	let targetKeyBoardName = 'hw_' + target.attr('id');
    if($('#' + targetKeyBoardName).length > 0) $('#' + targetKeyBoardName).remove();
	let targetKeyBoard = target.clone();
	targetKeyBoard.attr('name', targetKeyBoardName);
	targetKeyBoard.attr('id', targetKeyBoardName);
	targetKeyBoard.removeAttr('maxlength');
	targetKeyBoard.insertAfter(target.parent());
	targetKeyBoard.attr('type', 'hidden');
	target.parent().find('img[src="/WebIme/images/keyboard.png"]').remove();
    target.off('change');
	Geps3.CNS.changeCNS({
		jelm : target,
        defaultValue: target.val(),
		loadFinish : function(){
			Geps3.CNS.bindChangeEvent(target, function(e){
				let cnsVal = Geps3.CNS.getCNSVal(target);
				targetKeyBoard.trigger("change");
				console.log(cnsVal);
				targetKeyBoard.val(cnsVal);
				//$('#demo_msg').html(Geps3.CNS.pageCode2Img(cnsVal));
			});
		}
	});
}

function closeHardWordKeyBoard(name) {
	var keyboardName = 'hw_' + $(name).attr('id');
	var keyboardValue = $('#' + keyboardName).val();
	$(name).val(keyboardValue);
}

/**
	e.g. replaceTableContentWithHardWordImg('#table1, #table2', 'tbody tr', 'td', 'a', 'html')
	detailSelectors can be null
	isHtml can be null, if null, will use default setting(use .text() for replacePageCodeWithHardWordImg(elem))
 */
function replaceTableContentWithHardWordImg(tableIdSelectors, rowSelectors, cellSelector) {
	var detailSelectors = null;
	var isHtml = null;
	if(arguments.length > 3) detailSelectors = arguments[3];
	if(arguments.length > 4) isHtml = arguments[4];
	$(tableIdSelectors).find(rowSelectors).each(function() {
		var rowCells = $(this).find(cellSelector);
		for(var i = 0; i < rowCells.length; i++) {
			if(detailSelectors !== null) {
				var cellContents = rowCells.find(detailSelectors);
				for(var j = 0; j < cellContents.length; j++) {
					replacePageCodeWithHardWordImg(cellContents[j], isHtml || null);
				}
			} else {
				replacePageCodeWithHardWordImg(rowCells[i], isHtml || null);
			}
		}
	});
}

function replaceSelectedContentWithHardWordImg(selector) {
	var isHtml = null;
	if(arguments.length > 1) isHtml = arguments[1];
	$(selector).each(function() {
		replacePageCodeWithHardWordImg($(this), isHtml || null);
	});
}

function replacePageCodeWithHardWordImg(elem) {
	var cnsRegex = new RegExp("<\\s*page\\s*>\\s*([0-9a-fA-F]{1,2})\\s*<\\s*/\\s*page\\s*>\\s*<\\s*code\\s*>\\s*([0-9a-fA-F]{1,4})\\s*<\\s*/\\s*code\\s*>","ig");
	var htmlContent = $(elem).text();
	if(arguments.length > 1 && arguments[1] === 'html') {
		htmlContent = $(elem).html();
		htmlContent = replaceHtmlEntitiesWithProperAnglesBrackets(htmlContent);
	}
	htmlContent = replaceHtmlEntitiesWithProperAnglesBrackets(htmlContent);
	htmlContent = replacePageCodeTagWithProperFormat(htmlContent);
	if(cnsRegex.test(htmlContent)) {
		var convertedMessage = Geps3.CNS.pageCode2Img(htmlContent);
		var htmlRegex = new RegExp("<.*?>", "gi");
		if(htmlRegex.test(convertedMessage)){
			var match = convertedMessage.match(htmlRegex);
			for(var i = 0 ; i < match.length ; i++){
				if(match[i].indexOf("img") < 0){
					var matchText = match[i];
					match[i] = match[i].replaceAll("<", "&lt;").replaceAll(">", "&gt;");
					convertedMessage = convertedMessage.replace(matchText, match[i]);
				}
			}
		}
		$(elem).html(convertedMessage);
	}
}

function getStringWithHardWordImg(str) {
	if(cnsRegex.test(str)) {
		var convertedMessage = Geps3.CNS.pageCode2Img(str);
		return convertedMessage;
	}
	return str;
}

function replacePageCodeWithSubstitude(elem) {
	var pageCodeTags = new RegExp('<page>.*?<\/page><code>.*?<\/code>', 'gi');
	elem.text(elem.text().replace(pageCodeTags, '口'));
}

function triggerCloseHardWordKeyboard() {
	var toggleOn = null;
	if(arguments.length > 0) toggleOn = arguments[0];
	$('img[id^=hardword]').each(function() {
		var src = $(this).attr('src');
		if(src === (toggleOn === 'on' ? '/tps/images/hard_1.jpg' : '/tps/images/hard_1_onclick.jpg')) {
			$(this).click();
		}
	});
}

function replaceHtmlEntitiesWithProperAnglesBrackets(text) {
	var result = text.slice();
	result = result.replace(/&(amp;)?lt;/g, '<');
	result = result.replace(/&(amp;)?gt;/g, '>');
	return result;
}

function replacePageCodeTagWithProperFormat(text) {
	var result = text.slice();
	result = result.replace(/<page.*?>/g, '<page>');
	result = result.replace(/<code.*?>/g, '<code>');
	return result;
}