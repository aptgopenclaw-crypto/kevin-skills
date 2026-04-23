function makeDlg(dlgName) {
	var dlgName = "#" + dlgName;
	var __popWidth = $(dlgName).width() + 25;
	var __popHeight = $(dlgName).height() + 25;
	var __widowWidth = $(window).width();
	var __left = (__widowWidth - __popWidth) / 2 + 'px';
	var __windowHeight = $(window).height();
	var __top = (__windowHeight - __popHeight) / 4 + 'px';
	//$('body').css('overflow', 'hidden'); // 讓本體的捲軸消失避免讓blockUI滾動滑鼠還收到訊號。
	$.blockUI({
		message : $(dlgName),
		css : {
			cursor : '',
			left : __left,
			width : __popWidth + 'px',
			height : __popHeight + 'px',
			top : __top,
			overflow : 'auto', // 捲軸的顯示 【註1】
			// position:'absolute',
			position : 'fixed', // 居中
			// backgroundColor: '#f00',
			color : '#2f0000'
		},
		overlayCSS : {
			cursor : ''
		}
	});
	$('.blockOverlay').click(function(){
		closeNowDlg(); 
	});
}

function makeAlert(msg) {
	// 計算字串長度
	var len = msg.length;
	var line = Math.trunc(len / 26) + 1;
	var high = 100 + (line * 12);

	var htmlstr = '<br><label id="lblmsg">' + msg + '</label> <br />' + ' <div class="bt_cen2"> <a href="#" onclick="closeNowDlg();" onkeypress="closeNowDlg()">關閉 </a> </div> ';

	//$('body').css('overflow', 'hidden'); // 讓本體的捲軸消失避免讓blockUI滾動滑鼠還收到訊號。
	$.blockUI({		
		message : $(htmlstr),		
		css : {
			cursor : '',
			padding : 0,
			margin : 0,
			width : '30%',
			height : high,
			overflow : 'auto', // 捲軸的顯示 【註1】
			position : 'fixed', // 居中
			// backgroundColor: '#f00',
			color : '#2f0000'
		},
		overlayCSS : {
			cursor : ''
		}
	});
	$('.blockOverlay').click(function(){
		closeNowDlg(); 
	});
}

function makeConfirmDlg(msg, callok, callno) {

	// 計算字串長度
	var len = msg.length;
	var line = Math.trunc(len / 26) + 1;
	var high = 100 + (line * 12);

	var htmlstr = '<br><label id="lblmsg">' + msg + '</label> <br />' + '<input type="button" class="btn" onclick=' + callok + ' onkeypress=' + callok + ' id="ok" value="確定" />'
			+ ' <input type="button" class="btn" onclick=' + callno + ' onkeypress=' + callno + ' id="no" value="取消"  />'

	//$('body').css('overflow', 'hidden'); // 讓本體的捲軸消失避免讓blockUI滾動滑鼠還收到訊號。
	$.blockUI({
		message : $(htmlstr),
		css : {
			cursor : '',
			padding : 0,
			margin : 0,
			width : '30%',
			height : high,
			overflow : 'auto', // 捲軸的顯示 【註1】
			position : 'fixed', // 居中
			// backgroundColor: '#f00',
			color : '#2f0000'
		},
		overlayCSS : {
			cursor : ''
		}
	});
	$('.blockOverlay').click(function(){
		closeNowDlg(); 
	});
}

function closeNowDlg() {
	$.unblockUI();
	$('body').css('overflow', 'auto'); // 讓本體的捲軸恢復。
}

function makeProcMsg(msg) {
	var img = '<img src="/tps/images/loading.gif"/>';
	var showMsg = '<div><br><h2>' + img + msg + ', 請稍候...</h2><br></div>';
	$.blockUI({
		message : $(showMsg),
		applyPlatformOpacityRules : false,
		css : {
			opacity : .9
		}
	});
}
