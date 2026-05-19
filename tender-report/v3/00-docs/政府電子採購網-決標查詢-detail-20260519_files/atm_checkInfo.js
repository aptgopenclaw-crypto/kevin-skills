/**
 * 新增決標公告 - 完整檢視頁簽js
 */
/* 完整檢視 - Start */

// 當後端檢核的結果為false，就不能上傳至正式區
function checkOkUpdateData(contractInfoCheckOk, publishedInfoCheckOk, noticePccWorkflowCheckOk, bidderCheckOk, 
							awardItemCheckOk, advantageAwardCheckOk, mainInfoEnglishCheckOk, mainInfoCheckOk, itServiceCheckOk,bidderContractCheckOk){
	
	console.log("機關資料檢核結果: " + contractInfoCheckOk);
	console.log("已公告資料|採購資料檢核結果: " + publishedInfoCheckOk);
	console.log("共同供應契約檢核結果: " + noticePccWorkflowCheckOk);
	console.log("投標廠商檢核結果: " + bidderCheckOk);
	console.log("決標品項檢核結果: " + awardItemCheckOk);
	console.log("最有利標檢核結果: " + advantageAwardCheckOk);
	console.log("英文公告檢核結果: " + mainInfoEnglishCheckOk);
	console.log("資訊服務檢核結果: " + itServiceCheckOk);
	console.log("決標資料檢核結果: " + mainInfoCheckOk);
	console.log("簽約廠商檢核結果: " + bidderContractCheckOk);
	//debugger;
	if ((contractInfoCheckOk == 'false' || publishedInfoCheckOk == 'false' || 
		noticePccWorkflowCheckOk == 'false' || bidderCheckOk == 'false' || 
		awardItemCheckOk == 'false' || advantageAwardCheckOk == 'false' || 
		mainInfoEnglishCheckOk == 'false' || itServiceCheckOk == 'false' || 
		mainInfoCheckOk == 'false' || bidderContractCheckOk == 'false') &&
		_isByPassCheck != "Y") {
		
		console.log("不可以上傳至正式區。");
		$("#a_update").prop("disabled", "disabled");
		$("#a_update").removeAttr("onclick");
		$("#a_update").css("background", "#939b9c");
	}
	else {
		console.log("可以上傳至正式區。");
		$("#a_update").removeAttr("disabled");
		$("#a_update").attr("onclick","rejectSupp();");
		$("#a_update").css("background", "#079ba2");
	}
}

/**
 * 創建數字轉換金額格式的公共元件
 * @param id        html document 元素
 * @param messageid	顯示中文格式 document 元素
 * @param defval    預設值
 **/
function currency(id, messageid, defval) {
	var currencyConfig = {
		defaultValue : defval,
		callback : function(currencyData) {
			//debugger;
			console.log(currencyData);
			$("[id='"+id+"']").text(currencyData.formateValue + "元");
			$("[id='"+messageid+"']").html(currencyData.chineseValue);
		}
	}
	var component = new Geps3.Currency(currencyConfig);
}

// 決標品項 - 計算標比
function caculateRadio(governmentEstimateValue, awardAmtValue, index, obtainIndex){
	// 底價
//	var governmentEstimateValue = $("input[id='atmAwardItem.atmItemObtainList["+idx+"].governmentEstimateValue']").val();
	var governmentEstimate = governmentEstimateValue != null ? new Number(governmentEstimateValue) : 0;
//	var awardAmtValue = $("input[id='atmAwardItem.atmItemObtainList["+idx+"].awardAmountValue']").val();
	var awardAmt = awardAmtValue != null ?  new Number(awardAmtValue) : 0;
	var radio = new Number((awardAmt/governmentEstimate)*100).toFixed(2);
//	console.log("governmentEstimate:"　+ governmentEstimate + ", awardAmt:" + awardAmt);
	if(isNaN(radio) || !isFinite(radio)){
		radio = 0.0;
	}
//	if(radio >= 99 && radio <= 108){
//		//顯示理由選項
//		$("span[id='span_radioReason[" + idx + "]']").show();
//		$("span[id='span_radio[" + idx + "]']").hide();
//		$("span[id='span_AtmAratioReason[" + idx + "]']").html("");
//		$("span[id='span_AtmAratioReason[" + idx + "]']").hide();
//	}else if(governmentEstimate > 0 && radio > 108){
//		$("span[id='span_radioReason[" + idx + "]']").hide();
//		$("span[id='span_AtmAratioReason[" + idx + "]']").show();
//		$("span[id='span_AtmAratioReason[" + idx + "]']").html("底價 > 0, 標比不可 > 108%");
//		$("span[id='span_radio[" + idx + "]']").hide();
//	}else{
//		$("span[id='span_radioReason[" + idx + "]']").hide();
//		$("span[id='span_AtmAratioReason[" + idx + "]']").hide();
//		$("span[id='span_radio[" + idx + "]'").show();
//		$("span[id='span_radio[" + idx + "]'").html(radio + "%");
//	}
	$("[id='item["+index+"].obtain["+obtainIndex+"].radio']").html(radio + "%");
}


/* 已公告資料(採購資料) - 欄位顯示 - Start */

/* 標的分類 - 工程類 - Start */



// 判斷是否顯示"本案是否包括『瀝青混凝土鋪面』、『控制性低強度回填材料(CLSM)』、『級配粒料基層』、『級配粒料底層』或『低密度再生透水混凝土』等可使用再生粒料之工作項目"欄位
function checkRowIsRecyclePellet(fkPmsProctrgCate, proctrgCode,fkPmsTenderWay){
	console.log("fkPmsProctrgCate: " + fkPmsProctrgCate);
	console.log("proctrgCode: " + proctrgCode);
	console.log("fkPmsTenderWay: " + fkPmsTenderWay);
	
	if(fkPmsTenderWay == '6'){
		if (fkPmsProctrgCate == "1"){
			if ("5114" == proctrgCode ||
				"5122" == proctrgCode ||
				"5112" == proctrgCode ||
				"5111" == proctrgCode ||
				"5153" == proctrgCode ||
				"5156" == proctrgCode ||
				"5161" == proctrgCode ||
				"5171" == proctrgCode ||
				"5172" == proctrgCode ||
				"5173" == proctrgCode ||
				"5174" == proctrgCode ||
				"5175" == proctrgCode ||
				"5176" == proctrgCode ||
				"5178" == proctrgCode ||
				"5179" == proctrgCode ||
				"5113" == proctrgCode 
				){
				$("#rowIsRecyclePellet").hide();
			}
			else{
				$("#rowIsRecyclePellet").show(); // 顯示本案是否包括『瀝青混凝土鋪面』、『控制性低強度回填材料(CLSM)』、『級配粒料基層』、『級配粒料底層』或『低密度再生透水混凝土』等可使用再生粒料之工作項目
			}
		}
	}else{
		if (fkPmsProctrgCate == "1"){
			if (!("5111" == proctrgCode ||
				"5152" == proctrgCode ||
				"5153" == proctrgCode ||
				"5156" == proctrgCode ||
				"5161" == proctrgCode ||
				"5171" == proctrgCode ||
				"5172" == proctrgCode ||
				"5173" == proctrgCode ||
				"5174" == proctrgCode ||
				"5175" == proctrgCode ||
				"5176" == proctrgCode ||
				"5177" == proctrgCode ||
				"5178" == proctrgCode ||
				"5179" == proctrgCode			
				)){
				$("#rowIsRecyclePellet").show();
			}
		}
		else{
			$("#rowIsRecyclePellet").hide();
		}
	}
	
}

// 判斷是否顯示"是否屬災區重建工程"欄位
function checkRowIsReconstruct(fkPmsProctrgCate){
	if (fkPmsProctrgCate == "1"){
		$("#rowIsReconstruct").show();
	}
	else{
		$("#rowIsReconstruct").hide();
	}
}

/* 標的分類 - 工程類 - End */

/* 標的分類 - 財物類 - Start */

// 標的分類為"財物類"及"勞務類"，且採購金額級距為"未達公告金額" 顯示"是否於招標文件載明優先決標予身心障礙福利機構團體或庇護工場"欄位


//判斷是否顯示"身心障礙福利機構團體或庇護工場生產物品及服務"欄位
function checkRowPriorityCate(isAwardDisability){
	if (isAwardDisability == "Y"){
		$("#rowPriorityCate").show();
	}
	else{
		$("#rowPriorityCate").hide();
	}
}

// 判斷是否顯示"履約標的是否包含環境保護產品"欄位
function checkRowIsExecuteProtection(fkPmsProctrgCate){
	if (fkPmsProctrgCate == "2"){
		$("#rowIsExecuteProtection").show();
	}
	else{
		$("#rowIsExecuteProtection").hide();
	}
}

/* 標的分類 - 財物類 - End */

/* 標的分類 - 勞務類 - Start */
/* 標的分類 - 勞務類 - End */

// 判斷是否顯示"國際競圖之採購"欄位
function checkRowIsIntlCompetition(fkPmsTenderWay, fkPmsProctrgCate, isPackage, proctrgCode){
	if (fkPmsTenderWay != "5"){
		if (fkPmsProctrgCate == "1" || fkPmsProctrgCate == "2"){
			if (isPackage == "Y") {
				$("#rowIsIntlCompetition").show();
			}
			else{
				$("#rowIsIntlCompetition").hide();
			}
		}
		else if (fkPmsProctrgCate == "3"){
			if (proctrgCode == "8671" || proctrgCode == "8672" || proctrgCode == "8673" || proctrgCode == "8674"){
				$("#rowIsIntlCompetition").show();
			}
			else{
				$("#rowIsIntlCompetition").hide();
			}
		}
	}
}

//判斷是否顯示是否屬依國際競圖設計成果辦理之工程採購欄位
function checkRowIsIntlCompetitionComm(fkPmsProctrgCate, proctrgCode, fkPmsProcurementRange){
	// 標的分類為 工程類；採購金額級距為  查核金額以上未達巨額
	if(fkPmsProctrgCate == "1" && fkPmsProcurementRange >= "3"){ 
		if((parseInt(proctrgCode) >= 5121 && parseInt(proctrgCode) <= 5129) 
			|| proctrgCode == "5132" || proctrgCode == "5137"
			|| proctrgCode == "5139" || proctrgCode == "5159"){
			$("#rowIsIntlCompetitionComm").show();
		}else{
			$("#rowIsIntlCompetitionComm").hide();
		}
	}else{
		$("#rowIsIntlCompetitionComm").hide();
	}
}

// 判斷是否顯示"本案完成後所應達到之功能、效益、標準、品質或特性"欄位
function checkRowExpectBenefit(isPackage){
	if (isPackage == "Y"){
		$("#rowExpectBenefit").show();
	}
	else{
		$("#rowExpectBenefit").hide();
	}
}

// 判斷是否顯示"本案採購契約是否採用主管機關訂定之最新版範本"欄位
function checkRowIsUsePccNewSample(isShowPccNewSample){
	if (isShowPccNewSample == "Y"){
		$("#rowIsUsePccNewSample").show();
	}
	else{
		$("#rowIsUsePccNewSample").hide();
	}
}

// 判斷是否顯示"機關辦理原住民地區未達公告金額採購，檢視採購程序是否符合原住民族工作權保障法第11條及其施行細則第7條至第9條規定"欄位
function checkIsLaw1179(locationDesc,range,isLaw1179){
	if(locationDesc.indexOf("非原住民地區") < 0 && range == "1"){
		$("#div_isLaw1179").show();
		if(isLaw1179 == "N"){$("#div_isLaw1179").hide();}
	} else {
		$("#div_isLaw1179").hide();
	}
}

// 判斷是否顯示"採購對象"欄位
function checkProcurementTarget(fkAtmLimitedLaw, procurementTarget){
	if (fkAtmLimitedLaw == 12) {
		var procurementTargetsArray = procurementTarget.split(",");
		var procurementTargets = "";
		for (var i = 0; i < procurementTargetsArray.length; i++) {
			procurementTargets += procurementTargetsArray[i] + "<br>";
		}
		$("#divProcurementTarget").html(procurementTargets);
		if (procurementTargets.indexOf("原住民個人") != -1 || procurementTargets.indexOf("政府立案之原住民團體") != -1) {
			$("#divProcurementTargetsRemindMsg").show();
		}
	}
}

/* 已公告資料(採購資料) - 欄位顯示 - End */

/* 投標廠商 - 欄位顯示 - Start */

//判斷是否顯示"是否為原住民廠商"欄位
function checkIsAborigineCompany(locationDesc,range, index){
	if(locationDesc.indexOf("非原住民地區") < 0 && range == "1"){
		$("[id='tr_isAborigineCompany["+index+"]']").show();
	} else {
		$("[id='tr_isAborigineCompany["+index+"]']").hide();
	}
}

/* 投標廠商 - 欄位顯示 - End */

/* 已公告資料(決標資料) - 欄位顯示 - Start */

//機關主（會）計是否派員監辦 - 不派員監辦情形：
function getAccSupervisionLawLi(accSupervisionLaw){
	var accSupervisionLawArray= accSupervisionLaw.split(',');
	var i ,accContant='';
	
	for(i=0 ; i < accSupervisionLawArray.length;i++){
		
		switch (accSupervisionLawArray[i]) {
		  case '2':
			  accContant += "<li>" + '2.依採購法第40條規定洽由其他具有專業能力之機關代辦之採購，已洽請代辦機關之類似單位代辦監辦'+"</li>";
			  break;
		  case '3':
			  accContant += "<li>" + '3.以書面或電子化方式進行開標、比價、議價、決標及驗收程序，而以會簽主（會）計及有關單位方式處理'+"</li>";
			  break;
		  case '4':
			  accContant += "<li>" + '4.另有重要公務需處理，致無人員可供分派'+"</li>";
			  break;
		  case '5':
			  accContant += "<li>" + '5.地區偏遠，無人員可供分派'+"</li>";
			  break;
		  case '6':
			  accContant += "<li>" + '6.重複性採購，同一年度內已有監辦前例'+"</li>";
			  break;
		  case '7':
			  accContant += "<li>" + '7.因不可預見之突發事故，確無法監辦'+"</li>";
			  break;
		  case '8':
			  accContant += "<li>" + '8.依公告、公定或管制價格或費率採購財物或勞務，無減價之可能'+"</li>";
			  break;
		  case '9':
			  accContant += "<li>" + '9.即買即用或自供應至使用之期間甚為短暫，實地監辦驗收有困難'+"</li>";
			  break;
		  case '10':
			  accContant += "<li>" + '10.辦理分批或部分驗收，其驗收金額未達公告金額'+"</li>";
			  break;
		  case '11':
			  accContant += "<li>" + '11.經政府機關或公正第三人查驗，並有相關規格、品質、數量之證明文書供驗'+"</li>";
			  break;
		  case '12':
			  accContant += "<li>" + '12.依採購法第48條第2項前段或招標文件所定家數規定流標'+"</li>";
			  break;
		  case '13':
			  accContant += "<li>" + '13.無廠商投標而流標'+"</li>";
			  break;
		}
	}
	
	$("#accSupervisionLaws").html(accContant);
}

//機關有關單位（機關內之政風、監查（察）、督察、檢核或稽核單位）是否派員監辦 - 不派員監辦情形：
function getAuditSupervisionLawLi(auditSupervisionLaw){
	var auditSupervisionLawArray= auditSupervisionLaw.split(',');
	var i ,auditContant='';
	
	for(i=0 ; i < auditSupervisionLawArray.length;i++){
		
		switch (auditSupervisionLawArray[i]) {
		  case '1':
			  auditContant += "<li>" + '1.機關內無政風、監查（察）、督察、檢核或稽核單位'+"</li>";
			  break;
		  case '2':
			  auditContant += "<li>" + '2.依採購法第40條規定洽由其他具有專業能力之機關代辦之採購，已洽請代辦機'+"</li>";
			  break;
		  case '3':
			  auditContant += "<li>" + '3.以書面或電子化方式進行開標、比價、議價、決標及驗收程序，而以會簽主（會）計及有關單位方式處理'+"</li>";
			  break;
		  case '4':
			  auditContant += "<li>" + '4.另有重要公務需處理，致無人員可供分派'+"</li>";
			  break;
		  case '5':
			  auditContant += "<li>" + '5.地區偏遠，無人員可供分派'+"</li>";
			  break;
		  case '6':
			  auditContant += "<li>" + '6.重複性採購，同一年度內已有監辦前例'+"</li>";
			  break;
		  case '7':
			  auditContant += "<li>" + '7.因不可預見之突發事故，確無法監辦'+"</li>";
			  break;
		  case '8':
			  auditContant += "<li>" + '8.依公告、公定或管制價格或費率採購財物或勞務，無減價之可能'+"</li>";
			  break;
		  case '9':
			  auditContant += "<li>" + '9.即買即用或自供應至使用之期間甚為短暫，實地監辦驗收有困難'+"</li>";
			  break;
		  case '10':
			  auditContant += "<li>" + '10.辦理分批或部分驗收，其驗收金額未達公告金額'+"</li>";
			  break;
		  case '11':
			  auditContant += "<li>" + '11.經政府機關或公正第三人查驗，並有相關規格、品質、數量之證明文書供驗'+"</li>";
			  break;
		  case '12':
			  auditContant += "<li>" + '12.依採購法第48條第2項前段或招標文件所定家數規定流標'+"</li>";
			  break;
		  case '13':
			  auditContant += "<li>" + '13.無廠商投標而流標'+"</li>";
			  break;
		}
	}
	
	$("#auditSupervisionLaws").html(auditContant);
}

//計算標比
//function caculateRadio(idx){
//	//底價
//	var governmentEstimate = document.getElementById('atmAwardItem.atmItemObtainList['+idx+'].governmentEstimateValue').value;
//	var awardAmt =  document.getElementById('atmAwardItem.atmItemObtainList['+idx+'].awardAmountValue').value;
//	var radio = new Number(awardAmt/governmentEstimate).toFixed(2) * 100;
//	if(radio >= 99 && radio <= 100 ){
//		//顯示理由選項
//		document.getElementById('span_radioReason['+idx+']').style.display = "";
//		document.getElementById('span_radio['+idx+']').style.display = "none";
//	}else{
//		document.getElementById('span_radioReason['+idx+']').style.display = "none";
//		document.getElementById('span_radio['+idx+']').style.display = "";
//		document.getElementById('span_radio['+idx+']').innerHTML = radio + "%";
//	}
//}

//檢查law111 「決標日期」小於(早於)或等於修法生效日期(108年5月24日)，「成立採購工作及審查小組」不顯示(因無法規依據，機關無需填寫)。
function checkLaw111Date(awardDateString){
	//debugger;
	if(awardDateString.length > 0 ){
//		console.log(awardDateString);
		var awardDate = new Date(awardDateString);
		var lawDate = new Date("108/05/24");
		//因宣告日期 小於民國100年時，年份會有錯誤，所以需重新設定年份
		//awardDateString 格式 yyy/mm/dd 所以用'/'字符做切割
		var awardDateStr = awardDateString.split('/');
		//awardDateStr[0] -年份 ,awardDateStr[1] -月份 ,awardDateStr[2] -天數
		awardDate.setFullYear(awardDateStr[0]);
		if(awardDate < lawDate){
			$('#tr_law111').hide();
		}else{
			$('#tr_law111').show();
		}
	}
}

// 判斷是否顯示"預算金額為 0 原因"欄位
function checkBudgetZero(budgetAmount){
	if (budgetAmount == "0") {
		$("#spanBudgetZeroReason").show();
	}
	else {
		$("#spanBudgetZeroReason").hide();
	}
}

//公共工程生態檢核注意事項
function showIsPubEcological(){
	
	var budgetAmount = $("#budgetAmount").val();
	if(budgetAmount != undefined){
		budgetAmount = budgetAmount.replaceAll(",","");
	}
	var procTrgCode = $("#proctrgCode").val();
	// 工程類且預算金額100萬以上
	// 勞務類標案且標的分類為「8671建築服務」、「8672工程服務」、「8673綜合工程服務」、「8674都市計劃及景觀建築服務」
	if((_cpcType == "1" && budgetAmount >= 1000000 ) 
			|| (_cpcType == "3" && (procTrgCode == "8671" || procTrgCode == "8672" || procTrgCode == "8673" || procTrgCode == "8674"))){
		
		$jq("#trIsPubEcological").show();
		
		if($jq("[name='isPubEcological']:checked").val()=="Y1"){
			$jq("#span_pubEcologicalY1").show();
			$jq("#span_pubEcologicalN1").hide();
		} else if($jq("[name='isPubEcological']:checked").val()=="Y2"){
			$jq("#span_pubEcologicalY1").hide();
			$jq("#span_pubEcologicalN1").hide();
		} else if($jq("[name='isPubEcological']:checked").val()=="N1"){
			$jq("#span_pubEcologicalY1").hide();
			$jq("#span_pubEcologicalN1").show();
		} else {
			$jq("#span_pubEcologicalY1").hide();
			$jq("#span_pubEcologicalN1").hide();
		}
		
	}else{
		$jq("#trIsPubEcological").hide();
	}
}

// 公共工程節能減碳檢核注意事項
function showIsEsCrProvision() {
	var budgetAmount = $("#budgetAmount").val();
	if (budgetAmount != undefined) {
		budgetAmount = budgetAmount.replaceAll(",", "");
	}
	var procTrgCode = $("#proctrgCode").val().toString();
	// 工程類且預算金額1億以上
	// 標的分類為「8671建築服務」、「8672工程服務」、「8673綜合工程服務」、「8674都市計劃及景觀建築服務」
	// 且在上線日之後
	if ((_cpcType == "1" && budgetAmount > 100000000) || procTrgCode == "8671" || procTrgCode == "8672" || procTrgCode == "8673" || procTrgCode == "8674") {

		$jq("#trIsEsCrProvision").show();

		if ($jq("[name='isEsCrProvision']:checked").val() == "Y") {
			$jq("#span_isEsCrProvisionY").show();
			$jq("#span_isEsCrProvisionN").hide();
			if ($jq("[name='isEsCrStagrInclude']:checked").val() == "Y") {
				$jq("#span_isEsCrStagrIncludeY").show();
			}
		} else if ($jq("[name='isEsCrProvision']:checked").val() == "N") {
			$jq("#span_isEsCrProvisionY").hide();
			$jq("#span_isEsCrProvisionN").show();
		} else {
			$jq("#span_isEsCrProvisionY").hide();
			$jq("#span_isEsCrProvisionN").hide();
		}

	} else {
		$jq("#trIsEsCrProvision").hide();
	}
}
/* 已公告資料(決標資料) - 欄位顯示 - End */


/* 舊版報廢 - Start */

// 完整檢視
function checkSubmitData(){
	$jq("form[id=sendForm]").attr("action", _base_url+"addAtmAwardCheckInfo");
	$jq("input[name=method]").val("addAtmAwardAdd");
	$jq("form[id=sendForm]").submit();
}

//完整檢視-友善列印
function showFriendlyPrintRange() {
	var title = $("#title").contents().filter((index, e) => e.nodeType === 3).first().text().trim();
	
	if(typeof title === 'undefined'){
		title = $("#title2").text();
	}
		
	var win = window.open(this.href,'demo','toolbar=no,resizable=yes,scrollbars=yes');
	win.document.write("<style>" +
							"body{background:#fff;}"+
							"tr td{border-width: 2px;}"+
							".tbg_L11 {" +
							"background-color: #ffff66!important;" +
							"width: 10px;" +
							"color: #000;}" +
							".tb_04_1 {" + 
							"width: 100%;" +
						    "padding: 2px;" +
						    "border-collapse: collapse;}" + 
						    ".tb_04_1 table {" +
							"border-collapse: collapse;}" +
							".tb_04_1 tr td {" +
						    "border: 1px solid #ffff00;" + 
							"border-collapse: collapse;" +
						    "vertical-align: top;}" +
						    ".tb_04_1 th {" +
						    "border: 1px solid #ffff00;" + 
						    "border-collapse: collapse;}" +
						    ".tb_s06 .tbg_4_1 {background-color: #FFFF99!important;" +
							" width: 130px;}" +
							".tb_s06 .tbg_4_0 {background-color: #FFFF99!important;" +
							" width: 150px;}" +
							".tb_s06 .tbg_4R_1 {background-color: #EFF1F1!important;" +
							" width: 100px;" +
							"word-break: break-all;}" +
							" .indent1 { width: 130px; display: inline-block; } .indent2 { width: 115px; display: inline-block; } " + 
							"#divIsArtEngineer hr{width: 95%; } " +
						"</style>");
	win.document.write("<title>友善列印_預覽</title>");
	win.document.write("<link rel='stylesheet' type='text/css' href='/tps/css/all.css'>");
	win.document.write("<link rel='stylesheet' type='text/css' href='/tps/css/bootstrap.css'>");
	win.document.write("<link rel='stylesheet' type='text/css' href='/tps/css/tab_menu.css'>");
	win.document.write("<link rel='stylesheet' type='text/css' href='/tps/css/tab.css'>");
	win.document.write("<link rel='stylesheet' type='text/css' href='/tps/css/displaytag.css'>");
	win.document.write("<div class='R'><div class='R2'>列印時間："+getSysDateWithTime()+"</div></div><br>");
	win.document.write("<div style='text-align:center;font-size: 2em; font-weight: bold;'>"+title+"(稿)</div>");
	win.document.write("<center><span style='width:95%; font-size: 2em; font-weight: bold;'>本公告內容僅為暫存，尚未上傳至正式區</span></center>");
	win.document.write(document.getElementById("friendlyPrintRange").innerHTML);
	win.document.write("<style>" +
							"body{background:#fff;}"+
							"@media print{p.noPrint{display:none;} " +
					   "</style>");
	
	win.document.write("<p align='center' class='noPrint bt_cen2' style='height: 40px;'><input type='button' value='列印' onclick='window.print()'/> <input type='button' value='取消' onclick='window.close()'/></p>");
	win.document.close();
	
	
}
//完整檢視-文字列印
function print_text(viewer){
	let editType = $('#editType').val();
	// editType: 0:初始, 1:新增, 2:當日修改, 3:更正公告, 4:撤銷公告, 5:分品項決標
	if(viewer == "0" || viewer == "1"){
		$('#printText').attr('action', '/tps/atm/AtmAwardWithoutSso/printText');
	} else 	if(editType != 1 && editType != 0 ){
		$('#printText').attr('action', '/tps/atm/AtmAwardOfficialController/printTextChkInfo');
	} 
	var popupWindow =
		window.open('','_Myblank','status=yes,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,width=997,height=768',true);
	document.getElementById('printText').submit();
}

//上傳至正式區-文字列印
function print_text_Official(){
	// editType: 0:初始, 1:新增, 2:當日修改, 3:更正公告, 4:撤銷公告, 5:分品項決標
	if(_editType != 1 && _editType != 0){
		$('#printText').attr('action', '/tps/atm/AtmAwardOfficialController/printTextChkInfoOfficial');
	}
	var popupWindow =
		window.open('','_Myblank','status=yes,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,width=997,height=768',true);
	document.getElementById('printText').submit();
}
/* 舊版報廢 - End */

/* 完整檢視 - End */

/**
 * 取得系統時間(因為目前這個function是為了文字列印以及友善列印的關係，就先不加進DateUtils.js)
 * @returns string (例:YYYY/MM/DD HH:mm:ss)
 */
function getSysDateWithTime(){
	var sysDate = new Date();
	var year,month,day,hours,minutes,seconds;
	var sysDatStr;
	year = sysDate.getFullYear();
	//轉民國年
	year = year-1911;
	month = sysDate.getMonth()+1;
	day = sysDate.getDate();
	hours = sysDate.getHours();
	minutes = sysDate.getMinutes();
	seconds = sysDate.getSeconds()
	sysDatStr = year.toString();
	sysDatStr += (month.toString().length>1) ? "/"+month : "/0"+month ;
	sysDatStr += (day.toString().length>1) ? "/"+day : "/0"+day ;
	sysDatStr += (hours.toString().length>1) ? " "+hours : " 0"+hours ;
	sysDatStr += (minutes.toString().length>1) ? ":"+minutes : ":0"+minutes ;
	sysDatStr += (seconds.toString().length>1) ? ":"+seconds : ":0"+seconds ;
	return sysDatStr
}




// 判斷標的分類以更換"最新版範本"提示
function isGetNewSampleNotice(pk,awardDate){
	console.log("Call isGetNewSampleNotice :" + pk ,awardDate);
	$.ajax({
		type: "POST",
		url: _base_url+"getNewSampleNotice",
		//不能用 JSON.stringify
		data: {"pk":pk,"awardDate":awardDate},
		dataType: "json",
		success: function (res) {
			//console.log(res);
			let htmlContent = "";
			res.forEach(function(text) {
				htmlContent += text;
			});
			htmlContent =htmlContent.replaceAll("&lt;br&gt;","<br/>");
			$('#NewSampleNotice').html(DOMPurify.sanitize(htmlContent));
		},
		error: function (res) {
			console.log(res);
		}
	});
}