var htmlEncode = function (value){
    // 建立一個暫存的div元素，並使用text()將內容存成html編碼文字後再用html()取出
	if(value .constructor === String || value .constructor === Number  ){
		return $('<div/>').text(value).html().replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;" ).replaceAll("'", "&#39;" ).replaceAll('"', '&quot;');
	}
}

var printWin = function () {
	
//		更改友善列印title
		var originalTitleS = $("div .title_1s").text();
		if(originalTitleS == "查詢結果"){
			$("div .title_1s").text("標案查詢");
		}else if(originalTitleS == "外國政府採購商情"){
			if($("div .title_1s_country").text() == "US")
				$("div .title_1s").text("美國標案資料");
			else
				$("div .title_1s").text("加拿大標案資料");
		}else if(originalTitleS == "災區重建工程標案查詢結果"){
			$("div .title_1s").text("災區重建工程標案查詢");
		}
		
//		列印時間
		var myDate = new Date();
//convert DC to CC and if month and date < 10, give it a '0';
		var localDate = myDate.toLocaleDateString().split('/')
							  .map((item, index) => {
									var timeInt = parseInt(item);
									switch (index) {
									
											case 0 :
													return (timeInt -1911).toString();
													break;
											case 1 :
													var monthInt = (timeInt < 10 ? "0"+ timeInt : "" + timeInt);
													return monthInt;
													break;
											case 2 :
													var dateInt = (timeInt < 10 ? "0"+ timeInt : "" + timeInt);
													return dateInt;
													break;
									}
							});
		localDate = localDate.join('/');
		var timeStr = myDate.toTimeString();
		var hourAndMin = timeStr.substr(0, timeStr.lastIndexOf(":"));

		var popupWindow =
		    window.open('','_blank','status=yes,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,width=880,height=500',true);
		/** write css style **/
		popupWindow.document.write('<html><head><title>友善列印</title>');
		popupWindow.document.write("<link rel='stylesheet' type='text/css' href='/prkms/css/all.css' />");
		popupWindow.document.write("<link rel='stylesheet' type='text/css' href='/prkms/css/bootstrap.css' />");
		popupWindow.document.write("<link rel='stylesheet' type='text/css' href='/prkms/css/tab_menu.css' />");
		popupWindow.document.write("<link rel='stylesheet' type='text/css' href='/prkms/css/tab.css' />");
		popupWindow.document.write("<link href='/prkms/css/g.css' rel='stylesheet' type='text/css' />");
		popupWindow.document.write("<link href='/prkms/css/tps.css' rel='stylesheet' type='text/css' />");
		popupWindow.document.write("<script src='/prkms/js/jquery-3.5.0.min.js'></script>");
		popupWindow.document.write('<style>');
		popupWindow.document.write('body{font-size:12px;}');
		popupWindow.document.write('.search_print{display:none;}');
		popupWindow.document.write('.page{display:none;}');
		popupWindow.document.write('.search_note{display:none;}');
		popupWindow.document.write('.dontBringToNewWin{display:none;}');
		popupWindow.document.write('.noBtn{display:none;}');
		/** 不列印按鈕的設定 **/
		popupWindow.document.write('@media print{');
		popupWindow.document.write('div.noPrint { display:none; }');
		popupWindow.document.write('.table_block{ border:1px solid #000000;font-size:12px;}');
		popupWindow.document.write('}');
		popupWindow.document.write('</style>');
		popupWindow.document.write('</head><body>');
		popupWindow.document.write('<div class="R"><div class="R2">列印時間：' + localDate + ' ' + hourAndMin + '</div></div>');
		popupWindow.document.write(jQuery("#printArea").html());
		popupWindow.document.write('<div class="noPrint"><br>');
		popupWindow.document.write('<center><div class="bt_cen2" style="display:inline-block;"><a href="##" onclick="JavaScript:window.print();">列印</a></div>');
		popupWindow.document.write('&nbsp;<div class="bt_cen2" style="display:inline-block;"><a href="##" onclick="window.close();">取消</a></div></center>');
		popupWindow.document.write('<br></div>');
		popupWindow.document.write('</body></html>');
		
			// 移除 查詢區塊切換 div
		popupWindow.document.write('<script type="text/javascript">');
		popupWindow.document.write('$("#tpam").find("th:last").remove();'); // 移除。
		popupWindow.document.write('$("#tpam tr").find("td:last").remove();'); // 移除。
		
		popupWindow.document.write('$("#r_btn_id").empty();'); // tag 移除 
		popupWindow.document.write('$("a").removeAttr("href");'); // 除了列印 & 取消之外的 a tag 移除 href 屬性
		
		popupWindow.document.write('$("u").attr("style", "text-decoration:none");'); //移除底線的顯示
		popupWindow.document.write('$("span[class*=\'order\']").remove();'); // 移除排序圖示
		
		popupWindow.document.write('$("select").unbind("change");'); // 解綁 change 事件
		popupWindow.document.write('$(".search_print").remove();'); // 友善列印按鈕移除
		popupWindow.document.write('$("div.page").remove();'); // 筆數、分頁移除	
		popupWindow.document.write('</script>');
		
		popupWindow.document.close();
		
//		還原title
		$("div .title_1s").text(originalTitleS);
		
	}
	
var printWinBlock = function (printAreaId) {
	
//		更改友善列印title
		var originalTitleS = $("div .title_1s").text();
		if(originalTitleS == "查詢結果"){
			$("div .title_1s").text("標案查詢");
		}else if(originalTitleS == "外國政府採購商情"){
			if($("div .title_1s_country").text() == "US")
				$("div .title_1s").text("美國標案資料");
			else
				$("div .title_1s").text("加拿大標案資料");
		}
		
//		列印時間
		var myDate = new Date();
//convert DC to CC and if month and date < 10, give it a '0';
		var localDate = myDate.toLocaleDateString().split('/')
							  .map((item, index) => {
									var timeInt = parseInt(item);
									switch (index) {
									
											case 0 :
													return (timeInt -1911).toString();
													break;
											case 1 :
													var monthInt = (timeInt < 10 ? "0"+ timeInt : "" + timeInt);
													return monthInt;
													break;
											case 2 :
													var dateInt = (timeInt < 10 ? "0"+ timeInt : "" + timeInt);
													return dateInt;
													break;
									}
							});
		localDate = localDate.join('/');
		var timeStr = myDate.toTimeString();
		var hourAndMin = timeStr.substr(0, timeStr.lastIndexOf(":"));

		var popupWindow =
		    window.open('','_blank','status=yes,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,width=880,height=500',true);
		/** write css style **/
		popupWindow.document.write('<html><head><title>友善列印</title>');
		popupWindow.document.write("<link rel='stylesheet' type='text/css' href='/prkms/css/all.css' />");
		popupWindow.document.write("<link rel='stylesheet' type='text/css' href='/prkms/css/bootstrap.css' />");
		popupWindow.document.write("<link rel='stylesheet' type='text/css' href='/prkms/css/tab_menu.css' />");
		popupWindow.document.write("<link rel='stylesheet' type='text/css' href='/prkms/css/tab.css' />");
		popupWindow.document.write("<link href='/prkms/css/g.css' rel='stylesheet' type='text/css' />");
		popupWindow.document.write("<link href='/prkms/css/tps.css' rel='stylesheet' type='text/css' />");
		popupWindow.document.write('<style>');
		/** 不列印按鈕的設定 **/
		popupWindow.document.write('@media print{');
		popupWindow.document.write('div.noPrint { display:none; }');
		popupWindow.document.write('.table_block{ border:1px solid #000000;font-size:12px;}');
		popupWindow.document.write('}');
		popupWindow.document.write('</style>');
		popupWindow.document.write('</head><body>');
		popupWindow.document.write('<div class="R"><div class="R2">列印時間：' + localDate + ' ' + hourAndMin + '</div></div>');
		popupWindow.document.write(jQuery("#" + printAreaId ).html());
		popupWindow.document.write('<div class="noPrint"><br>');
		popupWindow.document.write('<center><div class="bt_cen2" style="display:inline-block;"><a href="##" onclick="JavaScript:window.print();">列印</a></div>');
		popupWindow.document.write('&nbsp;<div class="bt_cen2" style="display:inline-block;"><a href="##" onclick="window.close();">取消</a></div></center>');
		popupWindow.document.write('<br></div>');
		popupWindow.document.write('</body></html>');
		popupWindow.document.close();
		
//		還原title
		$("div .title_1s").text(originalTitleS);
		
	}
	



var showCheckFailure = function (e) {

	var message = e;

	var spanMessage = document.getElementById("failureMessage");
	spanMessage["innerHTML"] = message.replaceAll('\\r', '\r');
	
	var height = Math.floor(jQuery(window).height() * 0.4);
	var width = Math.floor(jQuery(window).width() * 0.4);
	var top = Math.floor(jQuery(window).height() * 0.3);
	var left = Math.floor(jQuery(window).width() * 0.3);
		
	$.blockUI(
		{
			message: $('#checkSearchFailure'),
			css:
				{
					left : left,
					top : top,
					width : width,
					height : height,
					padding : "10px"
				}
		}
	);
	
	return false;
}

//標案案查詢使用以下
var changeType = function (event, url){
	resetName();
	var $form = $(event.target).parents('form:first');
	$form.attr('action', url);
	var staticFilePath = "/"+url.split('/')[1];
	var searchMethod = "/" + url.split('/')[4];
	var authType = "/"+url.split('/')[3];
	var returnTo = '/returnToBasic';
	switch ($("#tenderTypeSelect").val()) {
	  case 'TENDER_DECLARATION':
		$("#dateTypeTitle").html("公告日期");
		$("#tenderWayTitle").html("招標方式");
		$("#declarationSelect").removeAttr("disabled");
		$("#declarationSelect option:eq(0)").html("各式招標方式");
		$("#declarationSelect option").show();
		$("#declarationSelect option").removeAttr('selected');
		$("#declarationSelect option:first").attr('selected', 'selected');
		
		showForAdvanced();
		spdtShow();
		break;
	  case 'SEARCH_APPEAL':
		$("#dateTypeTitle").html("公告日期");
		$("#tenderWayTitle").html("招標方式");
		$("#declarationSelect").attr("disabled",true);
		$("#declarationSelect option").removeAttr('selected');
		$("#declarationSelect").val(""); 

		$form.attr('action',staticFilePath+'/tpAppeal'+authType+'/readTpAppeal' + searchMethod + returnTo);
		$('#tenderStartDate').attr('name','startDate');
		$('#tenderEndDate').attr('name','endDate');
		
		showForAdvanced();
		spdtShow();
		break;
	  case 'PUBLIC_READ':
		$("#dateTypeTitle").html("公告日期");
		$("#tenderWayTitle").html("招標方式");
		$("#declarationSelect").attr("disabled",true);
		$("#declarationSelect option").removeAttr('selected');
		$("#declarationSelect").val("");  

		$form.attr('action',staticFilePath+'/tpRead'+authType+'/readTpRead' + searchMethod + returnTo);
		$('#tenderStartDate').attr('name','queryStartDate');
		$('#tenderEndDate').attr('name','queryEndDate');
		
		showForAdvanced();
		spdtShow();
	    break;
	  case 'PREDICT':
		$("#dateTypeTitle").html("預定公告<br>日期");
		$("#tenderWayTitle").html("預定招標<br>方式");
		$("#declarationSelect").removeAttr("disabled");  
		$("#declarationSelect option:eq(0)").html("各式預定招標方式");
		$('#declarationSelect option[value="TENDER_WAY_12"]').hide();
		$('#declarationSelect option[value="TENDER_WAY_10"]').hide();
		$('#declarationSelect option[value="TENDER_WAY_6"]').hide();
		$("#declarationSelect option").removeAttr('selected');
		$("#declarationSelect option:first").attr('selected', 'selected');

		$form.attr('action',staticFilePath+'/gpaPredict'+authType+'/readGpaPredict' + searchMethod + returnTo);
		$('#tenderName').attr('name','tenderCaseName');
		$('#tenderId').attr('name','tenderCaseNo');
		$('#tenderStartDate').attr('name','predictNoticeDateStart');
		$('#tenderEndDate').attr('name','predictNoticeDateEnd');
		
		hideForAdvanced();
		spdtShow();
		break;
	}
	component1.rePosition();
	component2.rePosition();
}

//標案案查詢使用以下
var changeFormUrlBySelected = function ($tenderType, url){
	resetName();
	var $form = $tenderType.parents('form:first');
	$form.attr('action', url);
	var staticFilePath = "/"+url.split('/')[1];
	var searchMethod = "/" + url.split('/')[4];
	var authType = "/"+url.split('/')[3];
	var returnTo = '/returnToBasic';
	switch ($("#tenderTypeSelect").val()) {
	  case 'TENDER_DECLARATION':
		$("#dateTypeTitle").html("公告日期");
		$("#tenderWayTitle").html("招標方式");
		$("#declarationSelect").removeAttr("disabled");
		$("#declarationSelect option:eq(0)").html("各式招標方式");
		$("#declarationSelect option").show();
// 後端導回這頁才會選到上一次的選項
//		$("#declarationSelect option").removeAttr('selected');
//		$("#declarationSelect option:first").attr('selected', 'selected');
		
		showForAdvanced();
		spdtShow();
		break;
	  case 'SEARCH_APPEAL':
		$("#dateTypeTitle").html("公告日期");
		$("#tenderWayTitle").html("招標方式");
		$("#declarationSelect").attr("disabled",true);
		$("#declarationSelect option").removeAttr('selected');
		$("#declarationSelect").val(""); 

		$form.attr('action',staticFilePath+'/tpAppeal'+authType+'/readTpAppeal' + searchMethod + returnTo);
		$('#tenderStartDate').attr('name','startDate');
		$('#tenderEndDate').attr('name','endDate');
		
		showForAdvanced();
		spdtHide();
		break;
	  case 'PUBLIC_READ':
		$("#dateTypeTitle").html("公告日期");
		$("#tenderWayTitle").html("招標方式");
		$("#declarationSelect").attr("disabled",true);
		$("#declarationSelect option").removeAttr('selected');
		$("#declarationSelect").val("");  

		$form.attr('action',staticFilePath+'/tpRead'+authType+'/readTpRead' + searchMethod + returnTo);
		$('#tenderStartDate').attr('name','queryStartDate');
		$('#tenderEndDate').attr('name','queryEndDate');
		
		showForAdvanced();
		spdtHide();
	    break;
	  case 'PREDICT':
		$("#dateTypeTitle").html("預定公告<br>日期");
		$("#tenderWayTitle").html("預定招標<br>方式");
		$("#declarationSelect").removeAttr("disabled");  
		$("#declarationSelect option:eq(0)").html("各式預定招標方式");
		$('#declarationSelect option[value="TENDER_WAY_12"]').hide();
		$('#declarationSelect option[value="TENDER_WAY_10"]').hide();
		$('#declarationSelect option[value="TENDER_WAY_6"]').hide();
// 後端導回這頁才會選到上一次的選項
//		$("#declarationSelect option").removeAttr('selected');
//		$("#declarationSelect option:first").attr('selected', 'selected');

		$form.attr('action',staticFilePath+'/gpaPredict'+authType+'/readGpaPredict' + searchMethod + returnTo);
		$('#tenderName').attr('name','tenderCaseName');
		$('#tenderId').attr('name','tenderCaseNo');
		$('#tenderStartDate').attr('name','predictNoticeDateStart');
		$('#tenderEndDate').attr('name','predictNoticeDateEnd');
		
		hideForAdvanced();
		spdtHide();
		break;
	}
	component1.rePosition();
	component2.rePosition();
}

var resetName = function (){
	$('#orgName').attr('name','orgName');
	$('#orgId').attr('name','orgId');
	$('#tenderName').attr('name','tenderName');
	$('#tenderId').attr('name','tenderId');
	$('#tenderStartDate').attr('name','tenderStartDate');
	$('#tenderEndDate').attr('name','tenderEndDate');
}

var hideForAdvanced = function (){
	$('#spdtArea').hide();
	$('#opdtArea').hide();
	$('#predictDateArea').show();
	$('#spdtStartDate').val("");
	$('#spdtEndDate').val("");
	$('#spdtStartDate').prev().val("");
	$('#spdtEndDate').prev().val("");
	$('#opdtStartDate').val("");
	$('#opdtEndDate').val("");
	$('#opdtStartDate').prev().val("");
	$('#opdtEndDate').prev().val("");
	$('#executeLocationArea').hide();
	$('#tenderRangeArea').hide();
	$('#priorityCateArea').hide();
	$('#radReConstructArea').hide();
	$('#locationArea').show();
}
var showForAdvanced = function (){
	$('#spdtArea').show();
	$('#opdtArea').show();
	$('#predictDateArea').hide();
	$('#executeLocationArea').show();
	$('#tenderRangeArea').show();
	$('#priorityCateArea').show();
	$('#radReConstructArea').show();
	$('#locationArea').hide();
	$('#tenderYmStart').val("");
	$('#tenderYmEnd').val("");
}

var spdtHide = function (){
//這邊只讓"等標期內"的選項失效
//判定有被選到"等標期" 才 reset
	if($("#level_22").prop("checked") == true){
		$("input[name='dateType']").attr("checked",false);
		$("input[name='dateType']")[0].checked = true;
		$("#level_22").attr('disabled', true);
	}else{
		$("#level_22").attr('disabled', true);
	}
}
var spdtShow = function (){
	$("#level_22").attr('disabled', false);
}



//以下changePageSize用
//var myData;
//var myAction;
var pageSizeChanger = function (){
	var myAction = $('form:first').attr('action');
	var myData = $('form:first').serialize();

	$('#pageSizeSelector').change(function(){
		var pick = $('#pageSizeSelector').val();
		var myDataArr = myData.split('&');
		$.each( myDataArr, function( index, value ) {
			if(value.indexOf('pageSize') != -1)
				myDataArr[index] = 'pageSize=' + pick;
		});
		window.location = myAction + "?" + myDataArr.join("&"); 
		});
}

//tenderWay切換到公開取得電子報價單時 顯示黃色提示訊息
var tenderWayNotice = function (event){
	if($(event.target).val() == "TENDER_WAY_12")
		$(".note_tenderWay12").show();
	else
		$(".note_tenderWay12").hide();
}

var trackTenders = function (){
	
	 var favorite = [];
     $.each($("input[name='trackPk']:checked"), function(){
         favorite.push($(this).val());
     });
     console.log("add to trackList : " + favorite.join(","));
	
	$.ajax({
		type: 'POST',
		url: '/prkms/apiTrack',
		data: {pkList: favorite.join(",")},
		complete: function(msg) {
			console.log(msg);
			alert(msg.responseText)
		}
		
	});
}

var changeChildBoxContent = function (orgId) {
	
	var spanMessage = document.getElementById("childBoxDiv");

	$.ajax({
		type: 'POST',
		url: '/prkms/tender/org/orgName/getChildOrg',
		data: {orgId: orgId},
		complete: function(msg) {

			if (msg.statusText == 'success' || msg.statusText == 'OK'){

				//預設先沒有資料 這樣假設有問題就不會卡住
				var msgdata = {"fatherId":"","isNotOrg":true};
				
				try{
					msgdata = JSON.parse(msg.responseText);
					}catch(e){
						console.log(e);
						console.log(msg.responseText);
					}

				var spanmsg = "<p><b>選擇下屬機關</b></p>";
				
				if(msgdata.isNotOrg == true || msgdata.isNotOrg == 'true'){
					spanmsg = spanmsg + "<p>無下屬機關</p>";
				}else{
					var orglist = msgdata.resultList;
					
					var orgmsg = "<table><tr><td>單位代碼</td><td>單位名稱</td><td>下屬機關</td></tr>";
					
					Object.keys(orglist).forEach(function(k){
						orgmsg = orgmsg + "<tr><td>";
						orgmsg = orgmsg + '<a style="color: blue;" href="javaScript:summaryChange(' + "'" + orglist[k].accId + "', '" + orglist[k].accName + "'" +  ')">' ;
						orgmsg = orgmsg + orglist[k].accId + "</a></td>";
						
						orgmsg = orgmsg + "<td>";
						orgmsg = orgmsg + '<a style="color: blue;" href="javaScript:summaryChange(' + "'" + orglist[k].accId + "', '" + orglist[k].accName + "'" +  ')">' ;
						orgmsg = orgmsg + orglist[k].accName + "</a></td>";
						
						orgmsg = orgmsg + "<td>";
						orgmsg = orgmsg + '<a style="color: blue;" href="javaScript:summaryChange(' + "'" + orglist[k].accId + "'" +  ')">' ;
						orgmsg = orgmsg + orglist[k].accId + ".*</a></td>";
						
						orgmsg = orgmsg + "</tr>";
					});
					
					orgmsg = orgmsg + "</table><br><center>";
					spanmsg = spanmsg + orgmsg;
					
				}

				if(msgdata.fatherId != ''){
					spanmsg = spanmsg + '<div class="bt_cen2" style="display: inline-block;">'
					spanmsg = spanmsg + '<a href="##" onclick="changeChildBoxContent(' + "'" + msgdata.fatherId + "'" + ');">返回</a>'
					spanmsg = spanmsg + "</div>"
				}
				
				spanmsg = spanmsg + '<div class="bt_cen2" style="display: inline-block;">'
				spanmsg = spanmsg + '<a href="##"  onclick="$.unblockUI();">關閉</a>'
				spanmsg = spanmsg + "</div>"
				
				spanMessage["innerHTML"] = spanmsg;
				
			}else{
				spanMessage["innerHTML"] = 
					"<p style='color:red;'>系統連線異常,請稍後再試!!</p>" +
					"<div class=\"bt_cen2\" style=\"display: inline-block;\">" + 
					"<a href=\"##\" onclick=\"$.unblockUI();\">關閉</a>" + 
					"</div>";
			}
		},beforeSend: function(){
			spanMessage["innerHTML"] = "<p style='color:red;'>處理中...</p>";
   		}
		
	});
}


var showChildBox = function (orgId) {
	
	changeChildBoxContent(orgId);
	
	var height = Math.floor(jQuery(window).height() * 0.5);
	var width = Math.floor(jQuery(window).width() * 0.4);
	var top = Math.floor(jQuery(window).height() * 0.3);
	var left = Math.floor(jQuery(window).width() * 0.3);
		
	$.blockUI(
		{
			message: $('#childBox'),
			css:
				{
					left : left,
					top : top,
					width : width,
					height : height,
					padding : "15px"
				}
		}
	);
	
	return false;
}

var summaryChange = function (orgId, orgName){
	$("input[name='orgId']").val(orgId);
	$("input[name='orgName']").val(orgName);
	$.unblockUI();
}

var scrollToResult = function (){
	var secB = document.getElementById('search_b');
	if(secB != null)
		secB.scrollIntoView();
}



//blockUIConfirm
var blockUIConfirmG = function (confirmMesg,confirmY,confirmN){
	$.blockUI({
		message : `
			<h1 class="title_1" colspan="2">` + confirmMesg + `</h1>
			<div class="bt_cen2" align="right">
				<a href="javascript::void(0);"onclick="confirmYes()">` + confirmY + `</a>
				<a href="javascript:void(0);" onclick="confirmNon()">` + confirmN + `</a>
			</div>
		`,
//		onOverlayClick : $.unblockUI , 
	});
}

var isValidDate = function (date) {
	  return date instanceof Date && !isNaN(date.getTime())
	}

var initNoticeDateMark = function (){
	
	let loc = location.href;
	let tenderStartDateStr;
	let tenderEndDateStr;
	let dateType;
	
	// 標的分類
	if(loc.indexOf('readTenderProctrg') > -1 && $('#level_7').prop('checked')){
		tenderStartDateStr = $('input[name="tenderStartDate"]').val();
		tenderEndDateStr = $('input[name="tenderEndDate"]').val();
	}else if(loc.indexOf('readTenderProctrg') > -1 && $('#level_6').prop('checked')){
		dateType = $('input[name="dateType"]:checked').val();
		if('isNow' == dateType){
			let today = new Date();
			tenderStartDateStr = today.getFullYear()+ "/" + (today.getMonth()+1) + "/" + today.getDate();
			tenderEndDateStr = tenderStartDateStr;
		}else if('isDate' == dateType){
			tenderStartDateStr = $('input[name="tenderStartDate"]').val();
			tenderEndDateStr = $('input[name="tenderEndDate"]').val();
		}
//		else{
//			return;
//		}
	// 招標基本、進階、更正查詢	
	}else if((loc.indexOf('readTenderBasic') > -1 || loc.indexOf('readTenderAdvanced') > -1 || loc.indexOf('readTenderUpdated') > -1) && 'TENDER_DECLARATION' == $('select[name="tenderType"]').val()){
		dateType = $('input[name="dateType"]:checked').val();
		if('isNow' == dateType){
			let today = new Date();
			tenderStartDateStr = today.getFullYear()+ "/" + (today.getMonth()+1) + "/" + today.getDate();
			tenderEndDateStr = tenderStartDateStr;
		}else if('isDate' == dateType){
			tenderStartDateStr = $('input[name="tenderStartDate"]').val();
			tenderEndDateStr = $('input[name="tenderEndDate"]').val();
		}
//		else{
//			return;
//		}
	//	決標
	}else if(loc.indexOf('readTenderAgent') > -1){
		tenderStartDateStr = $('input[name="awardAnnounceStartDate"]').val();
		tenderEndDateStr = $('input[name="awardAnnounceEndDate"]').val();
	}
//	else{
//		return;
//	}
	
//	g_search_note加註
	$('#printArea .search_note .g_search_note').append(
			'<tr><td></td><td><span class="red">◎</span></td><td>政府電子採購網提醒您，項次標註<span class="red">!</span>為已辦理更正公告請於公告日期後再次查詢更正公告 </td></tr>'
	);
	
//	str轉date 時間轉換
	let tenderStartDate = new Date(tenderStartDateStr);
	let tenderEndDate = new Date(tenderEndDateStr);
	tenderStartDate.setFullYear(tenderStartDate.getFullYear()-1911); 
	tenderEndDate.setFullYear(tenderEndDate.getFullYear()-1911); 
	
//	處理dom 判斷是否加註
	let dateIndex;
	let rowIndex;
	let caseIndex;
	$('.tb_01 thead th').each(function(){
		if('公告日期' == $(this).text().trim())
			dateIndex = $(this).index();
		else if('項次' == $(this).text().trim())
			rowIndex = $(this).index();
		else if('標案案號標案名稱' == $(this).text().trim())
			caseIndex = $(this).index();
	});
	$('.tb_01 tbody tr').each(function(){
		let tarDate = new Date($(this).find('td:eq('+dateIndex+')').text().trim());
		let today = new Date();
		today.setHours(00,00,00,00)
		today.setFullYear(today.getFullYear()-1911);
		if( $(this).find('td:eq('+caseIndex+')').text().trim().indexOf('更正公告') != -1 
				&& today < tarDate && $(this).find('td:eq('+rowIndex+')').text().trim().indexOf('無符合條件資料') == -1){
				$(this).find('td:eq('+rowIndex+')').append('<span class="red">!</span>');
		}
	});
	
	
}

var addBackBtn = function (){
	$('<div class="bt_cen2"><a href="#" onclick="history.go(-1)">返回</a></div>').insertAfter('.page:eq(1)');
}


