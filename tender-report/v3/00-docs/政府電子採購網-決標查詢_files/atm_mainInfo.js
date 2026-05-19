/**
 * 新增決標公告 - 決標資料頁簽js
 */
/* 決標資料 - Start */
var _orgActiveDesc = {'Y':'啟用', 'N':'停用', 'X':'未開通', 'D':'裁撤', 'O':'靜止帳戶', 'L':'鎖定'};

// 11之1
function checkLaw111(){
	var isLaw111 =  $('input[name=isLaw111]:checked').val();
	if(isLaw111 == 'Y'){
		$('#table_isLaw111_ext').show();
	}else if(isLaw111 == 'N'){
		$('#table_isLaw111_ext').hide();
		$('#table_isLaw111_ext').find("*:checked").prop('checked', false);
	}
}

function checkIsPoliMem(){
	var isPoliMem =  $('input[name=isPoliMem]:checked').val();
	if(isPoliMem == 'Y'){
		$('#span_isPoliMemAtt').show();
	}else if(isPoliMem == 'N'){
		$('#span_isPoliMemAtt').hide();
		$('input[name=isPoliMemAtt]:checked').prop('checked', false);
	}
}

function checkIsAccMem(){
	var isAccMem =  $('input[name=isAccMem]:checked').val();
	if(isAccMem == 'Y'){
		$('#span_isAccMemAtt').show();
	}else if(isAccMem == 'N'){
		$('#span_isAccMemAtt').hide();
		$('input[name=isAccMemAtt]:checked').prop('checked', false);
	}
}


// 判斷底價金額是否公開 
function checkIsEstimatePublic(){
	//如果有訂底價才判斷 或是 有建議金額
	var isEstimate = $('#isEstimate').val();
	var fkAtmNoEstimate = $('#fkAtmNoEstimate').val();
	var isEstimatePublic = $("input[name='isEstimatePublic']:checked").val();
	if(isEstimate == 'Y' || (fkAtmNoEstimate == 5 && isEstimate == 'N')){
		if (isEstimatePublic == "N") {
			document.getElementById("divIsEstimatePublic_N").style.display="";
		}
		else{
			document.getElementById("divIsEstimatePublic_N").style.display="none";
		}
	}
}
// 判斷總決標金額-已確認決標金額無誤
function checkChkAwardPriceIsCorrect(){
	if($("#chkAwardPriceIsCorrect_tmp").prop('checked')){
		$("#rowAwardPriceLowReason").show();
		$('#chkAwardPriceIsCorrect').val('Y');
		
		// 被選取
		$("#trPriceLowRsn").show();
	}else{
		$("#rowAwardPriceLowReason").hide();
		$('#chkAwardPriceIsCorrect').val('N');
		
		// 取消選取
		$("#trPriceLowRsn").hide();
		$("#awardPriceLowReason").val("");
	}
}

// 判斷決標金額是否係依預估條件估算之預估金額
function checkIsAwardPriceEstimate(){
	var isAwardPriceEstimate = $("input[name='isAwardPriceEstimate']:checked").val();
	if (isAwardPriceEstimate == "Y") {
		document.getElementById("divIsAwardPriceEstimate_Y").style.display="";
	}
	else{
		document.getElementById("divIsAwardPriceEstimate_Y").style.display="none";
	}
}
// 判斷總決標金額是否公開
function checkIsAwardPricePublic(){
	var isAwardPricePublic = $("input[name='isAwardPricePublic']:checked").val();
	if (isAwardPricePublic == "N") {
		document.getElementById("divIsAwardPricePublic_N").style.display="";
	}
	else{
		document.getElementById("divIsAwardPricePublic_N").style.display="none";
		$("#fkAtmAwardpriceNopub").val([""]);
		$("#fkAtmAwardpriceNopub").children().removeAttr("selected");
	}
}
// 判斷契約是否訂有依物價指數調整價金規定
function checkIsCommodityPriceRule(){
	var isCommodityPriceRule = $("input[name='isCommodityPriceRule']:checked").val();
	if (isCommodityPriceRule == "Y") {
		document.getElementById("divIsCommodityPriceRule_Y").style.display="";
		document.getElementById("divIsCommodityPriceRule_N").style.display="none";
		document.getElementById("divNoCommodityRuleOther").style.display="none";
		document.getElementById("divCommodityPriceRuleOption_0").style.display="none";
		$("#fkAtmNoCommodity").val('');
		$("input[name='noCommodityRuleOther']").val('');
		$("#hiddenFkAtmNoCommodity").val('');
	}
	else if (isCommodityPriceRule == "N"){
		$("input[name='adjustRangeByItem']").val('');   //依特定個別項目指數漲跌幅調整幅度
		$("input[name='projectByItem']").val('');   //依特定個別項目名稱 
		$("input[name='adjustRangeByClass']").val(''); 	//依特定中分類項目指數漲跌幅調整幅度         
		$("input[name='projectByClass']").val(''); 	//依特定中分類項目名稱      
		$("input[name='adjustRangeByAll']").val('');	//依總指數漲跌幅調整幅度    
		$("input[name='commodityPriceRuleCommodity']").val('');	//物價指數調整規定說明 for 財務類and勞務類  
		document.getElementById("divIsCommodityPriceRule_Y").style.display="none";
		document.getElementById("divIsCommodityPriceRule_N").style.display="";
		if($("input[name='commodityPriceRuleOption']:checked").val() === undefined){			
			document.getElementById("commodityPriceRuleOption_1").click();
		}
		document.getElementById("divCommodityPriceRuleOption_0").style.display="";
	}
}

//契約是否訂有依物價指數調整價金規定
function checkISPriceRuleOption(){
	var commodityPriceRuleOption = $("input[name='commodityPriceRuleOption']:checked").val();
	if (commodityPriceRuleOption == "1") {
		document.getElementById("divCommodityPriceRuleOption_1").style.display="";
	}else{
		document.getElementById("divCommodityPriceRuleOption_1").style.display="none";
		document.getElementById("divNoCommodityRuleOther").style.display="none";
	}
}

//未列物價調整規定說明為其他則顯示其他原因
function changeFkAtmNoCommodity(index) {
	if(index === '5'){
		document.getElementById("divNoCommodityRuleOther").style.display="";
	}else{
		document.getElementById("divNoCommodityRuleOther").style.display="none";
		$("#noCommodityRuleOther").val("");
	}

	$("#hiddenFkAtmNoCommodity").val(index);
}

// 未列物價調整規定說明依照標的分類顯示不同選項
function fkAtmNoCommodityOption(){
	var fkPmsProctrgCate = $("#fkPmsProctrgCate").val();
	if(fkPmsProctrgCate == "1"){
		$("#fkAtmNoCommodity").find("option").eq(0).after("<option value='3'>${noCommodityReasonDescList.get(2).get('data')}</option>");
	}else if(fkPmsProctrgCate == "2"){
		$("#fkAtmNoCommodity").find("option").eq(0).after("<option value='1'>${noCommodityReasonDescList.get(0).get('data')}</option>");
	}else if(fkPmsProctrgCate == "3"){
		$("#fkAtmNoCommodity").find("option").eq(0).after("<option value='2'>${noCommodityReasonDescList.get(1).get('data')}</option>");
	}
}

//是否包括使用建築資訊建模BIM
function checkIsUseBim(){
	//debugger;
	var isUseBim = $("input[name='isUseBim']:checked").val();
	if(isUseBim == undefined){
		isUseBim = $('#isUseBim').val();
	}
	if (isUseBim == "N") {
		document.getElementById("rowIsBidderUseBim").style.display="";
	}else{
		document.getElementById("rowIsBidderUseBim").style.display="none";
	}
}

//是否採購監辦
function checkFkPmsSupervisionType(){
	if(document.getElementById("fkPmsProcurementRange").value >= 3){
		var fkPmsSupervisionType = $("input[name='fkPmsSupervisionType']:checked").val();
		if (fkPmsSupervisionType == "1") {
			document.getElementById("divIsUpgovSupervision").style.display="";
			document.getElementById("divUpgovSupervisionDocNo").style.display="none";
		}else if(fkPmsSupervisionType == "2"){
			document.getElementById("divIsUpgovSupervision").style.display="none";
			document.getElementById("divUpgovSupervisionDocNo").style.display="";
			
		}else{
			document.getElementById("divIsUpgovSupervision").style.display="none";
			document.getElementById("divUpgovSupervisionDocNo").style.display="none";
		}
	}
}

//上級機關是否派員監辦
function checkIsUpgovSupervision(){
	var fkPmsProcurementRange = document.getElementById("fkPmsProcurementRange").value;
	if(fkPmsProcurementRange >= 3){
		var isUpgovSupervision = $("input[name='isUpgovSupervision']:checked").val();
		if (isUpgovSupervision == "N") {
			document.getElementById("divUpgovNotSupervisionRsn").style.display="";
		}else{
			document.getElementById("divUpgovNotSupervisionRsn").style.display="none";
			$("input[name='upgovNotSupervisionRsn']").val('');
		}
	}
}

//機關主（會）計是否派員監辦
function checkIsAccSupervision(){

	if(checkRangeOne()){
		var isAccSupervision = $("input[name='isAccSupervision']:checked").val();
		if (isAccSupervision == "Y") {
			document.getElementById("divIsAccSupervision").style.display="";
			document.getElementById("divIsAccSupervisionLaws").style.display="none";
			$("input[type=checkbox][name=accSupervisionLaws]").prop("checked", false);
		}else if(isAccSupervision == "N"){
			document.getElementById("divIsAccSupervision").style.display="none";
			document.getElementById("divIsAccSupervisionLaws").style.display="";
		}else{
			document.getElementById("divIsAccSupervision").style.display="none";
			document.getElementById("divIsAccSupervisionLaws").style.display="none";
		}
	}
}

//機關主（會）計是否派員監辦 --->是否書面審核
function checkFkAccSupervisionType(){

	if(checkRangeOne()){
		var fkAuditSupervisionType = $("input[name='fkAccSupervisionType']:checked").val();
		if (fkAuditSupervisionType == "2") {
			document.getElementById("divAccApprovalData").style.display="";
			$('input[type=hidden][name="atmApprovalList[9].isNeedApprove"]').val("Y");
		}else{
			document.getElementById("divAccApprovalData").style.display="none";
			$('input[type=hidden][name="atmApprovalList[9].isNeedApprove"]').val("N");
		}
	}
}

//機關有關單位（機關內之政風、監查（察）、督察、檢核或稽核單位）是否派員監辦
function checkIsAuditSupervision(){

	if(checkRangeOne()){
		var isAuditSupervision = $("input[name='isAuditSupervision']:checked").val();
		if (isAuditSupervision == "Y") {
			document.getElementById("divIsAuditSupervision").style.display="";
			document.getElementById("divIsAuditSupervisionLaws").style.display="none";
			$("input[type=checkbox][name=auditSupervisionLaws]").prop("checked", false);
		}else if(isAuditSupervision == "N"){
			document.getElementById("divIsAuditSupervision").style.display="none";
			document.getElementById("divIsAuditSupervisionLaws").style.display="";
		}else{
			document.getElementById("divIsAuditSupervision").style.display="none";
			document.getElementById("divIsAuditSupervisionLaws").style.display="none";
		}
	}
}

//機關有關單位（機關內之政風、監查（察）、督察、檢核或稽核單位）是否派員監辦 --->是否書面審核
function checkFkAuditSupervisionType(){

	if(checkRangeOne()){
		var fkAuditSupervisionType = $("input[name='fkAuditSupervisionType']:checked").val();
		if (fkAuditSupervisionType == "2") {
			document.getElementById("divAuditApprovalData").style.display="";
			$('input[type=hidden][name="atmApprovalList[10].isNeedApprove"]').val("Y");
		}else{
			document.getElementById("divAuditApprovalData").style.display="none";
			$('input[type=hidden][name="atmApprovalList[10].isNeedApprove"]').val("N");
		}
	}
}

//是否屬「文化藝術獎助及促進條例」第15條規定應設置公共藝術(公有建築物/5億元以上重大公共工程計畫)
function checkIsArtEngineer(){
	var isArtEngineer = $("input[name='isArtEngineer']:checked").val();
	if (isArtEngineer == "Y") {
		document.getElementById("divIsArtEngineer").style.display="";
	}else {
		document.getElementById("divIsArtEngineer").style.display="none";
	}
}

//是否屬公共工程節能減碳檢核注意事項
function checkIsEsCrProvision(){
	var isEsCrProvision = $("input[name='isArtEngineer']:checked").val();
	if (isEsCrProvision == "Y") {
		document.getElementById("trIsEsCrProvision").style.display="";
	}else {
		document.getElementById("trIsEsCrProvision").style.display="none";
	}
}

// 創建數字轉換金額格式的共用元件
function strCurrency(id, messageid, defval) {
	var currencyConfig = {
		defaultValue : defval,
		callback : function(currencyData) {
			$(id).text(currencyData.formateValue + "元");
			$(messageid).html(currencyData.chineseValue);
		}
	}
	var component = new Geps3.Currency(currencyConfig);
}


/* 舊版報廢 - Start */

// 決標資料暫存
function tmpSaveMainInfo(){
	var pkAtmMainTmp = document.getElementById("pkAtmMainTmp").value;	// 決標主檔暫存pk
	var fkPmsMain = document.getElementById("fkPmsMain").value;	// 標案主檔fk
	var fkPmsMainTmp = document.getElementById("fkPmsMainTmp").value;	// 標案主檔fk
	var isMultipleAward = document.getElementById("isMultipleAward").value;	// 是否複數決標

	var awardSeq = document.getElementById("awardSeq").value;	// 決標公告序號
	var isEnglishNotice = document.getElementById("isEnglishNotice").value;	// 是否刊登英文公告
	var awardDate = document.getElementById("awardDate").value;	// 決標日期
	if (isMultipleAward == "Y"){
		var isPartialAward = $("input[name='isPartialAward']:checked").val();	// 執行現況
	}
	else{
		var isPartialAward = "";	// 執行現況
	}
	var contractNo = document.getElementById("contractNo").value;	// 契約編號
	var isGazette = $("input[name='isGazette']:checked").val();	// 是否刊登公報
	var governmentEstimate = document.getElementById("governmentEstimate").value;	// 底價金額
	var isEstimatePublic = $("input[name='isEstimatePublic']:checked").val();	// 底價金額是否公開
	if (isEstimatePublic == "N") {
		var fkAtmEstimateNotPub = $("select[name='fkAtmEstimateNotPub").val();	// 底價金額不公開理由
		if (fkAtmEstimateNotPub == "5"){
			var estimateNotPubDocNo = document.getElementById("estimateNotPubDocNo").value;	// 底價金額不公開 - 核准文號
		}
		else{
			var estimateNotPubDocNo = "";
		}
	}
	else{
		var fkAtmEstimateNotPub = "";
		var estimateNotPubDocNo = "";
	}
	var awardPrice = document.getElementById("awardPrice").value;	// 總決標金額
	var isAwardPriceEstimate = $("input[name='isAwardPriceEstimate']:checked").val();	// 決標金額是否係依預估條件估算之預估金額
	if (isAwardPriceEstimate == "Y") {
		var awardPriceEstimateWay = document.getElementById("awardPriceEstimateWay").value;	// 估算方式
	}
	else{
		var awardPriceEstimateWay = "";
	}
	var isAwardPricePublic = $("input[name='isAwardPricePublic']:checked").val();	// 總決標金額是否公開
	if (isAwardPricePublic == "N") {
		var fkAtmAwardpriceNopub = $("select[name='fkAtmAwardpriceNopub").val();	// 總決標金額不公開理由
		if (fkAtmAwardpriceNopub == "5"){
			var awardPriceNopubDocno = document.getElementById("awardPriceNopubDocno").value;	// 總決標金額不公開 - 核准文號
		}
		else{
			var awardPriceNopubDocno = "";
		}
	}
	else{
		var fkAtmAwardpriceNopub = "";
		var awardPriceNopubDocno = "";
	}
	var isLaw58 = $("input[name='isLaw58']:checked").val();	// 是否依採購法第58條規定採次低標或次次低標決標
	var isCommodityPriceRule = $("input[name='isCommodityPriceRule']:checked").val();	// 契約是否訂有依物價指數調整價金規定
	if (isCommodityPriceRule == "Y") {
		var adjustRangeByItem = document.getElementById("adjustRangeByItem").value;	// 依特定個別項目指數漲跌幅調整幅度
		var adjustRangeByClass = document.getElementById("adjustRangeByClass").value;	// 依特定中分類項目指數漲跌幅調整幅度
		var adjustRangeByAll = document.getElementById("adjustRangeByAll").value;	// 依總指數漲跌幅調整幅度

		var commodityPriceRuleOption = "";
	}
	else if (isCommodityPriceRule == "N") {
		var adjustRangeByItem = "";	// 依特定個別項目指數漲跌幅調整幅度
		var adjustRangeByClass = "";	// 依特定中分類項目指數漲跌幅調整幅度
		var adjustRangeByAll = "";	// 依總指數漲跌幅調整幅度

		var commodityPriceRuleOption = $("input[name='commodityPriceRuleOption']:checked").val();
	}
	var contractExecuteOrgId = document.getElementById("contractExecuteOrgId").value;	// 履約執行機關 - 代碼
	var contractExecuteOrgName = document.getElementById("contractExecuteOrgName").value;	// 履約執行機關 - 名稱
	var isAccSupervision = $("input[name='isAccSupervision']:checked").val();	// 機關主（會）計是否派員監辦
	var isAuditSupervision = $("input[name='isAuditSupervision']:checked").val();	// 機關有關單位（機關內之政風、監查（察）、督察、檢核或稽核單位）是否派員監辦
	var comment = document.getElementById("comment").value;	// 附加說明

	var jsonMainInfo = {
			"awardSeq":awardSeq, "isEnglishNotice":isEnglishNotice, "awardDate":awardDate, "isPartialAward":isPartialAward, 
			"contractNo":contractNo, "isGazette":isGazette, "governmentEstimate":governmentEstimate, "isEstimatePublic":isEstimatePublic, 
			"fkAtmEstimateNotPub":fkAtmEstimateNotPub, "estimateNotPubDocNo":estimateNotPubDocNo, "awardPrice":awardPrice, "isAwardPriceEstimate":isAwardPriceEstimate, 
			"awardPriceEstimateWay":awardPriceEstimateWay, "isAwardPricePublic":isAwardPricePublic, "fkAtmAwardpriceNopub":fkAtmAwardpriceNopub, "awardPriceNopubDocno":awardPriceNopubDocno, 
			"isLaw58":isLaw58, "isCommodityPriceRule":isCommodityPriceRule, "adjustRangeByItem":adjustRangeByItem, "adjustRangeByClass":adjustRangeByClass, 
			"adjustRangeByAll":adjustRangeByAll, "commodityPriceRuleOption":commodityPriceRuleOption, "contractExecuteOrgId":contractExecuteOrgId, "contractExecuteOrgName":contractExecuteOrgName, 
			"isAccSupervision":isAccSupervision, "isAuditSupervision":isAuditSupervision, "comment":comment};

	console.log("jsonMainInfo: " + JSON.stringify(jsonMainInfo));
	AtmAwardController.mainInfoSave(JSON.stringify(jsonMainInfo), pkAtmMainTmp, fkPmsMain, fkPmsMainTmp, setMainInfoSave);
}
// AtmAwardController.mainInfoSave - callback
function setMainInfoSave(obj) {
	dwr.util.setValue("pkAtmMainTmp", obj.pkAtmMainTmp);
	dwr.util.setValue("fkPmsMain", obj.fkPmsMain);
	dwr.util.setValue("fkPmsMainTmp", obj.fkPmsMainTmp);
}

/* 舊版報廢 - End */

//判斷law111
function checkIsLaw111(awardDateString){
	console.log("[checkIsLaw111] awardDateString :" + awardDateString);
	var isTender = $("#isTender").val();
	var editType = $("#editType").val();
	
	if(awardDateString.length > 0 ){
		//民國年
		if(awardDateString.length < 10){
			awardDateString = dateTransShiYuan(awardDateString);
			console.log("[checkIsLaw111] awardDateString :" + awardDateString);
		}
		var awardDate = new Date(awardDateString);
		var lawDate = new Date("2019/05/24");
		console.log(awardDate + " " + lawDate);
		if(awardDate < lawDate){
			$('#tr_law111').hide();
		}else{
			$('#tr_law111').show();
			var isLaw111 = $('input[name=isLaw111]:checked').val();
			if(isLaw111 == 'Y'){
				$("#table_isLaw111_ext").show();
				var isPoliMem = $('input[name=isPoliMem]:checked').val();
				if(isPoliMem == 'Y'){
					$("#span_isPoliMemAtt").show();
				}
				var isAccMem = $('input[name=isAccMem]:checked').val();
				if(isAccMem == 'Y'){
					$('#span_isAccMemAtt').show();
				}
			}
			//欄位值由招標(決標)公告帶入，原選擇「否」，可修正為「是」；原選擇為「是」，不允許修正為「否」。
			console.log("isTender:" + isTender);
			if(isTender == 'Y'){
				var isLaw111OfTender = $('#isLaw111OfTender').val();
				if(isLaw111OfTender == 'Y'){
					$('#isLaw111_N').prop("disabled", true);
				}
			}
			//更正決標公告時，欄位值由既有之決標公告資料帶入，原選擇「否」，可修正為「是」；原選擇為「是」，不允許修正為「否」。 editType == '3'
			console.log("editType " + editType);
			
			if(editType == '3'){	
				var isLaw111Old = $('#isLaw111Old').val();
				if(isLaw111Old == 'Y')
					$('#isLaw111_N').prop("disabled", true);
			}	
		}
	}
}

//法規小幫手
function showLaw(code) {
       var lawConfig = {
             element : document.getElementById(code),
             defaultValue : { code1 : code },
             callback : function(lawVo){console.log(lawVo);}
       }
       var component = new Geps3.Law(lawConfig);
}

function doShowLaw() {
	showLaw("PMS-043"); //是否刊登公報
	showLaw("PMS-081"); //底價金額是否公開
	showLaw("PMS-082"); //總決標金額是否公開
	showLaw("PMS-088"); //採購監辦
}

//檢核得標廠商之履約起日是否大於決標日期並顯示訊息 awardDate:決標日期
function checkExecDateEarlyAwardDate(awardDate) {
	console.log("awardDate: " + awardDate);
//	if (awardDate.length == 9) {
//		awardDate = convertRocDateToWest(awardDate);
//	}
	$("#divCommodityPriceRuleOption_2").hide();
    // 得標廠商之履約起日早於決標日期要顯示訊息
	if (typeof(awardDate)!='undefined' && awardDate!="") {
		
		var fkAtmMainTmp = $("#pkAtmMainTmp").val();
		if (fkAtmMainTmp.replace(/(^s*)|(s*$)/g, "").length == 0) {
			fkAtmMainTmp = $("#pkAtmMain").val();
		}
		
		$.ajax({
			type: "POST",
			url: _base_url+"checkExecDateEarlyAwardDate",
			// 不能用 JSON.stringify
			data: {"fkAtmMainTmp" : fkAtmMainTmp},
			dataType: "json",
			success: function (res) {
				console.log(res);
				
				var chkMsg = "";
				var award = new Date(awardDate);
				var size = res.atmBidderListSize;
				for (var i = 0 ; i < size ; i++) {
					var suppName = res.atmBidderList[i].suppName;
					if (typeof(suppName)!='undefined' && suppName!="") {
						var startDate = DOMPurify.sanitize(res.atmBidderList[i].execContractStartDate);
						var endDate = DOMPurify.sanitize(res.atmBidderList[i].execContractEndDate);
						
						var start = new Date(startDate);
						// 當履約起日早於決標日期，則加入警告訊息
						if (start < award) {
							chkMsg += "廠商名稱：" + bidderCnsToImg(suppName) + "<br>";
							chkMsg += "履約起迄日期：" + dateTransMinGo(startDate) + "至" + dateTransMinGo(endDate) + "<br>";
						}
					}
				}
				
				if (chkMsg.length > 0) {
					// 顯示警告訊息
					var remindMsg = "「履約起迄日期」之起始日期早於「決標日期」，如下列：<br>";
		        	remindMsg += "決標日期：" + dateTransMinGo(awardDate) + "<br>";
		        	remindMsg += chkMsg;
		        	remindMsg += "請確認，如屬誤植，請至「投標廠商」或「決標資料」頁籤進行修正。";
		        	
		        	$("#divWarnAwardDate").html(remindMsg);
		        	$("#divWarnAwardDate").show();
				} else {
					$("#divWarnAwardDate").hide();
				}
				
			},
			error: function (res) {
				console.log(res);
			}
		});
		
		if (new Date(awardDate) < new Date($("#commodityOptionOnlineDate").val())){
			$("#tableCommodityPriceRuleOption").hide();
			$("#divCommodityPriceRuleOption").hide();
		} else {
			if ($('input[name=commodityPriceRuleOption]:checked').val() != '1') {
				$("#divCommodityPriceRuleOption_1").hide();
			}
			$("#tableCommodityPriceRuleOption").show();
			if(new Date(awardDate) >= new Date($("#commodityOptionOnlineDate").val()) && new Date(awardDate) < new Date($("#commodityOptionOnlineDateEnd").val())){
				$("#divCommodityPriceRuleOption_2").show();
			} else {
				$("#divCommodityPriceRuleOption_2").hide();
			}
			
		}		
	}
	
	var fkPmsProcurementRange = document.getElementById("fkPmsProcurementRange").value;
	if((checkRangeOne() &&  $("#isTender").val() !='Y') || (fkPmsProcurementRange != '1' && $("#isTender").val() =='Y') || $("#Gazetteflag").val() == "true"){
		$('#isGazette_N').prop("disabled", true);
			
	} else {
		if(!(editType == '3' || (editType == '2' || $("#awardUpdateSq").val() != '001'))){
			$('#isGazette_N').prop("disabled", false);
		}
	}
	
	if((checkRangeOne() &&  $("#isTender").val() !='Y') || (fkPmsProcurementRange != '1' && $("#isTender").val() =='Y')){
		document.getElementById("isAuditSupervision").style.display="";
		document.getElementById("isAccSupervision").style.display="";
	} else{
		document.getElementById("isAuditSupervision").style.display="none";
		document.getElementById("isAccSupervision").style.display="none";
	}
}

// 西元年轉民國年
function dateTransMinGo(date) {
	console.log("date: " + date);
	var year, month, day;
	var MinGoDate = "";
	if (date != null && !date.replace(/(^s*)|(s*$)/g, "").length == 0) {
		var ShiYuanDate = new Date(DOMPurify.sanitize(date));
		year = ShiYuanDate.getFullYear();
		month = ShiYuanDate.getMonth() + 1;
		day = ShiYuanDate.getDate();
		year = year - 1911;
		if(month>9){
			month = month;
		}else{
			month = "0"+month;
		}
		if(day>9){
			day = day;
		}else{
			day = "0"+day;
		}
		MinGoDate = year + "/" + month + "/" + day;
	}
	console.log("MinGoDate: " + MinGoDate);
	return MinGoDate;
}

// 共同投 輸入完底價金額後檢核 
function checkGovernmentEstimate(){
	console.log("checkGovernmentEstimate");
	//計算標比
	calculateRatio();
}

function selectRatioReason(val){
	//debugger;
	console.log(val);
	var option = val.options[val.selectedIndex].value;
	if(option == 4){
		$('#aratioReasonOther').show();
	}else{
		$('#aratioReasonOther').hide();
	}
	
	
}

function calculateRatio(){
	//debugger;
	console.log("calculateRatio");
	var awardPrice = 0;
	var govEst = 0;
	var radio = 0;
	//總決標金額
	var txtAwardPrice = $jq("[name=awardPrice]")[0];
	//底價金額
	var txtGovEst = $jq("[name=governmentEstimate]")[0];
	//標比 hidden 欄位
	var hiddenRadio = $jq("[name=ratio]")[0];
	var spanRadio = $jq("#ratioRate")[0];
	var selReason = $jq("[name=fkAtmAratioReason]")[0];
	var txtOther = $jq("[name=aratioReasonOther]")[0];
	$jq("#errorReason").hide();
	$jq("#errorRatio").hide();
	if (txtAwardPrice != undefined && txtAwardPrice.value.length > 0){
		if (!isNaN(txtAwardPrice.value.replace(/ /g,'').replace(/,/g,''))) {
			awardPrice = Number(txtAwardPrice.value.replace(/ /g,'').replace(/,/g,''));				
		}
	}
	if (txtGovEst != undefined && txtGovEst.value.length > 0){
		if (!isNaN(txtGovEst.value.replace(/ /g,'').replace(/,/g,''))){
			govEst = Number(txtGovEst.value.replace(/ /g,'').replace(/,/g,''));
		}
	}
	// 總決標金額/底價金額
	if (govEst != 0){ 
		radio = Math.round(awardPrice / govEst * 10000) / 100;
	}
	if(hiddenRadio != undefined){
		hiddenRadio.value = radio;
		if (radio >= 99 && radio <= 100) {
			$('#tr_ratioReason').show();
			spanRadio.style.display = "block";
			selReason.style.display = "block";
			spanRadio.innerHTML = "" + radio + "%";
			if (selReason.value == 4 ){
				txtOther.style.display = "block";
			}else{
				txtOther.style.display = "none";
				txtOther.value="";
			}
		} else if (govEst > 0 && 
					(radio < 99 || 
					 (radio > 100 && radio <= 108))) {
			$('#tr_ratioReason').hide();
			spanRadio.style.display = "block";
			spanRadio.innerHTML = "" + radio + "%";
			selReason.style.display = "none";		
			$jq(selReason).find(":selected").attr("selected",false);		
			txtOther.style.display = "none";
			txtOther.value="";
		} else if (govEst < 0 && radio >= 92 && radio <99) {
			$('#tr_ratioReason').hide();
			spanRadio.style.display = "block";
			spanRadio.innerHTML = "" + radio + "%";
			selReason.style.display = "none";
			$jq(selReason).find(":selected").attr("selected",false);
			txtOther.style.display = "none";
			txtOther.value="";
		} else if (govEst < 0 && radio > 100) {
			$('#tr_ratioReason').hide();
			spanRadio.style.display = "block";
			spanRadio.innerHTML = "" + radio + "%";
			selReason.style.display = "none";
			$jq(selReason).find(":selected").attr("selected",false);
			txtOther.style.display = "none";
			txtOther.value="";
		} else if (govEst > 0 && radio > 108) {
			$('#tr_ratioReason').hide();
			spanRadio.style.display = "block";
			spanRadio.innerHTML = "<font color='red'>底價 > 0, 標比不可  > 108%</font>";
			selReason.style.display = "none";
			$jq(selReason).find(":selected").attr("selected",false);
			txtOther.style.display = "none";
			txtOther.value="";
		} else if (govEst < 0 && radio < 92) {
			$('#tr_ratioReason').hide();
			spanRadio.style.display = "block";
			spanRadio.innerHTML = "<font color='red'>底價 < 0, 標比不可  < 92%</font>";
			selReason.style.display = "none";
			$jq(selReason).find(":selected").attr("selected",false);
			txtOther.style.display = "none";
			txtOther.value="";
		}
	}
	
}

// 判斷底價金額不公開理由為其他，應顯示"核准文號"欄位。
function checkFkAtmEstimateNotPub(fkAtmEstimateNotPub){
	if (fkAtmEstimateNotPub == 5){
		$("#divFkAtmEstimateNotPub_5").show();
	}
	else{
		$("#divFkAtmEstimateNotPub_5").hide();
	}
}

// 判斷總決標金額不公開理由為其他，應顯示"核准文號"欄位。
function checkFkAtmAwardpriceNopub(fkAtmAwardpriceNopub){
	if (fkAtmAwardpriceNopub == 3){
		$("#divFkAtmAwardpriceNopub_3").show();
	}
	else{
		$("#divFkAtmAwardpriceNopub_3").hide();
	}
}

// 是否顯示超底價決標核准文號
function showOverEst(governmentEstimate, awardPrice, procurementAmount) {
	
	var amtEst = 0;
	var amtAward = 0;
	var amtPur = 0;
	
	var signEst = 1;
	var signAward = 1;
	var signPur = 1;
	
	if(governmentEstimate == undefined)
		governmentEstimate = "0";
	if(awardPrice == undefined)
		awardPrice = "0";
	if(procurementAmount == undefined)
		procurementAmount = "0";
	
	// 底價金額
	var strEst = governmentEstimate.replace(/ /g,'').replace(/,/g,'');
	// 決標金額
	var strAward = awardPrice.replace(/ /g,'').replace(/,/g,'');
	// 採購金額
	var strPur = procurementAmount.replace(/ /g,'').replace(/,/g,'');
	
	console.log("strEst :" + strEst);
	console.log("strAward :" + strAward);
	console.log("strPur :" + strPur);
	
	if (strEst.indexOf("(") > -1) {
		signEst = -1;
		strEst = strEst.substring(1, strEst.length - 2);
	}
	if (strAward.indexOf("(") > -1) {
		signAward = -1;
		strAward = strAward.substring(1, strAward.length - 2);
	}
	if (strPur.indexOf("(") > -1) {
		signPur = -1;
		strPur = strPur.substring(1, strPur.length - 2);
	}
	
	if (strEst.length > 0 && (!isNaN(strEst))) {
		amtEst = signEst * Number(strEst);
	}
	if (strAward.length > 0 && (!isNaN(strAward))) {
		amtAward = signAward * Number(strAward);
	}
	if (strPur.length > 0 && (!isNaN(strPur))) {
		amtPur = signPur * Number(strPur);
	}
	
	//20130107, 修正判斷超底價核准文號的邏輯
	/*超底價核准文號修正程式：
	1、最低標
		底價金額為0或未訂底價不檢查
		底價金額大於0時，
		決標金額不允許大於底價金額之1.08(108%)     
		決標金額大於底價金額且小於底價金額之1.08(108%)時要填寫核准文號，【惟查核金額以上時，大於底價1.04的核准文號要是上級機關核准文號(對決標來說都是核准文號)】
		底價金額小於0時，(通常都是指收入)
		決標金額不允許大於底價金額之0.92(92%) -->即當-100時，不可以小於-92，即-91就不允許
		決標金額大於底價金額且小於底價金額之0.92(92%)時要填寫核准文號【惟查核金額以上，小於等於底價金額*0.92,決標金額大於底價金額*0.96的核准文號要是上級機關的核准文號(對決標來說都是核准文號)】
	2、最高標(非收入性質時，邏輯與最低標相同)(收入性質時，邏輯與最低標相反，底價大於0時，收入愈多愈好，但收入給得比底價少時，要限制)
		2.1非收入性質，比照最低標。
		2.2收入性質時，條件如下：
			底價金額為0或未訂底價不檢查
			底價金額大於0時，
			決標金額不允許小於底價金額之0.92(92%)     
			決標金額小於底價金額且大於底價金額之0.92(92%)時要填寫核准文號【惟查核金額以上，小於底價0.96且大於底價0.92的核准文號要是上級機關核准文號(對決標來說都是核准文號)】
			底價金額小於0時，(通常都是指收入)
			決標金額不允許大於底價金額之0.92(92%) -->即當-100時，不可以小於-92，即-91就不允許
			決標金額大於底價金額且小於底價金額之0.92(92%)時要填寫核准文號【惟查核金額以上，小於等於底價金額*0.92,決標金額大於底價金額*0.96的核准文號要是上級機關的核准文號(對決標來說都是核准文號)】
	3、最有利標
		非收入性質時，有底價比照最低標，無底價不檢核
		收入性質時，有底價比照最高標，無底價不檢核
    */
	
	var fkPmsAwardWay = $("#fkPmsAwardWay").val();
	var isAtmIncome = $("#isAtmIncome").val();
	var chkIsOverEstVal = chkIsOverEst(fkPmsAwardWay, isAtmIncome, amtAward, amtEst);
	if (chkIsOverEstVal == "Y"){
		$("#overEst").show();
	}else{
		$("#overEst").hide();
		//清空欄位
		$("input[type=text][name='overEstimateDocNo']").val("");
	}
	
}

// 20130107，判斷是否為要填寫超底價核准文號的情境, 
// 參數: 決標方式，是否為收入性質採購，決標金額，底價金額
function chkIsOverEst(fkPmsAwardWay, isAtmIncome, numAwardAmt, numEstAmt) {
	
	if (numEstAmt != 0){
		switch (parseInt(fkPmsAwardWay)){
		case 1:
			if (numEstAmt > 0 && (numAwardAmt > numEstAmt && numAwardAmt <= 1.08 * numEstAmt)){
				return "Y";				 
			}
			else if (numEstAmt < 0 && (numAwardAmt > numEstAmt && numAwardAmt <= 0.92 * numEstAmt)){
				return "Y";
			}
			else{
				return "N";
			}			 
			break;
		case 2:
		case 3:
			if ("Y" == isAtmIncome){
				if (numEstAmt>0 && (numAwardAmt < numEstAmt && numAwardAmt >= 0.92 * numEstAmt)){
					return "Y";				 
				}
				else if (numEstAmt<0 && (numAwardAmt > numEstAmt && numAwardAmt <= 0.92 * numEstAmt)){
					return "Y";
				}
				else{
					return "N";
				}
			}
			else{
				//console.log("888");
				// 非收入性質
				if (numEstAmt>0 && (numAwardAmt > numEstAmt && numAwardAmt <= 1.08 * numEstAmt)){
					return "Y";				 
				}
				else if (numEstAmt<0 && (numAwardAmt > numEstAmt && numAwardAmt <= 0.92 * numEstAmt)){
					return "Y";
				}
				else{
					return "N";
				}		 
			}		     			 
			break;
		default:
			return "N";
		}
	}
	else{
		return "N";
	}
}

//For 履約執行機關
function getOrgExecuteQuery(div, orgIdId, orgNameId, defaultValue){
	console.log(div + " " + orgIdId + " " + orgNameId + " " + defaultValue);
	var orgQueryConfig = {
			element : document.getElementById(div),
			attr : { id : orgIdId , name: orgIdId , class:'form-control' , alt:'組織名稱/統一編號互查' },
			defaultValue : defaultValue,
//			messageElement : document.getElementById(divOrgQuery),
			callback : function(orgQueryData){
				var active = null;
				if(orgQueryData.value != null) {
					active = orgQueryData.value.active;
				}
				console.log(orgQueryData);
				if(orgQueryData.success){
					//機關沒啟用
						var valueJson = orgQueryData.value;
						console.log(valueJson.name);
						$("[id='" + orgNameId+"']").val(valueJson.name);
						$('#div_contractExecuteOrgIdErr').html("");			
				}else{
					$("[id='" + orgNameId+"']").val("");
					$("#div_contractExecuteOrgIdErr").val(orgQueryData.message);
				}

				
			}
		}
		
		var component = new Geps3.OrgQuery(orgQueryConfig);
		$("#" + div + " div").find("div").find("a").attr("href", "#" + div);
}

//採最低標時，預算金額必須大於等於總決標金額  && ,預算金額必須大於等於底價金額
function checkBudgetLowerAwardPrice(){
	//debugger;
	var awardPrice = $('#awardPrice').val();
	var budget = $('#budgetAmount').val();
	var fkPmsAwardWay = $('#fkPmsAwardWay').val();
	console.log("awardPrice, budget, fkPmsAwardWay :" + awardPrice + "  " + budget + "   " + fkPmsAwardWay);
	//debugger;
	var budget = $('#budgetAmount').val();
	var budgetZeroReason = $('#budgetZeroReason').val();
	// 當預算金額填0且有提供預算金額為0理由時，允許預算金額小於底價金額
	if(fkPmsAwardWay == '1' && parseInt(budget) < parseInt(awardPrice)&& !(budget == 0 && budgetZeroReason.length != 0)){
		var errorAwardPrice = $('#errorAwardPrice').html();	
		$('#errorAwardPrice').html("採最低標時，預算金額必須大於等於總決標金額 ");
		$('#errorAwardPrice').append(errorAwardPrice);
	}
	
	
	var governmentEstimate = $('#governmentEstimate').val();
	var fkPmsAwardWay = $('#fkPmsAwardWay').val();
	console.log("awardPrice, governmentEstimate, fkPmsAwardWay :" + governmentEstimate + "  " + budget + "   " + fkPmsAwardWay);
	//debugger;
	
	// 當預算金額填0且有提供預算金額為0理由時，允許預算金額小於底價金額
	if(fkPmsAwardWay == '1' && parseInt(budget) < parseInt(governmentEstimate) && !(budget == 0 && budgetZeroReason.length != 0)){
		$('#governmentEstimateErrorMsg').html("採最低標時,預算金額必須大於等於底價金額");
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

function checkRangeOne(){
	var isTender = $("#isTender").val();
	if (isTender == "Y"){
		return $("#fkPmsProcurementRange").val() > "1";
	}else{
		var awardDate = $("#awardDate").val();
		var procurementAmount = $('#procurementAmount').val().replace(/ /g,'').replace(/,/g,'');
		var awardDateString = new Date();
		var announcementAmount = 1000000;
		if(awardDate.length > 0){
			awardDateString = awardDate;
			//民國年
			if(awardDate.length < 10){
				awardDateString = dateTransShiYuan(awardDate);
			}
		}
		if (new Date(awardDateString) >= new Date($("#procurementRageOnlineDate").val())){
			announcementAmount = 1500000;
			
		} 
	
		if(procurementAmount == ""){
			procurementAmount = "0";
		}
		return parseInt(procurementAmount) >= announcementAmount;
	}
	
}

// 公共工程節能減碳檢核注意事項
function showIsEsCrProvision(){
	var budgetAmount = $("#budgetAmount").val();
	if(budgetAmount != undefined){
		budgetAmount = budgetAmount.replaceAll(",","");
	}
	var procTrgCode = $("#proctrgCode").val().toString();
	// 工程類且預算金額1億以上
	// 標的分類為「8671建築服務」、「8672工程服務」、「8673綜合工程服務」、「8674都市計劃及景觀建築服務」
	// 且在上線日之後
	if((_cpcType == "1" && budgetAmount > 100000000 ) || procTrgCode == "8671" || procTrgCode == "8672" || procTrgCode == "8673" || procTrgCode == "8674"){
		
		$jq("#trIsEsCrProvision").show();
		
		if($jq("[name='isEsCrProvision']:checked").val()=="Y"){
			$jq("#div_isEsCrProvisionY").show();
			$jq("#div_isEsCrProvisionN").hide();
			$jq("#div_isEsCrStagrIncludeY").hide();
			if($jq("[name='isEsCrStagrInclude']:checked").val()=="Y"){
				$jq("#div_isEsCrStagrIncludeY").show();
			}else if($jq("[name='isEsCrStagrInclude']:checked").val()=="N"){
				$jq("#div_isEsCrStagrIncludeY").hide();
			}
		}else if($jq("[name='isEsCrProvision']:checked").val()=="N"){
			$jq("#div_isEsCrProvisionY").hide();
			$jq("#div_isEsCrProvisionN").show();
		} else {
			$jq("#div_isEsCrProvisionY").hide();
			$jq("#div_isEsCrProvisionN").hide();
		}
		
	}else{
		$jq("#trIsEsCrProvision").hide();
	}
}

function initialCommodityOld() {
	console.log("initialCommodityOld");
	var isCommodityPriceRuleTemp = $("input[name='isCommodityPriceRule']:checked").val();
	var fkAtmNoCommodityTemp = $("#fkAtmNoCommodity").val();
	$("#isProjectByNew").replaceWith(isProjectByOld);
	if (isCommodityPriceRuleTemp == "Y") {
		document.getElementById("isCommodityPriceRule_Y").click();
		$("#divIsCommodityPriceRule_Y").show();
		$("#divIsCommodityPriceRule_N").hide();
	} else if (isCommodityPriceRuleTemp == "N") {
		$("#divIsCommodityPriceRule_Y").hide();
		$("#divCommodityPriceRuleOption_0").show();
		$("#divCommodityPriceRuleOption_1").show();
		document.getElementById("isCommodityPriceRule_N").click();
		if($("input[name='commodityPriceRuleOption']:checked").val() === undefined){
			document.getElementById("commodityPriceRuleOption_1").click();
		}
		if (fkAtmNoCommodityTemp == 5) {
			$("#divNoCommodityRuleOther").show();
		}
	}
}

function initialCommodityNew() {
	console.log("initialCommodityNew");
	var isCommodityPriceRuleTemp = $("input[name='isCommodityPriceRule']:checked").val();
	var fkAtmNoCommodityTemp = $("#fkAtmNoCommodity").val();
	$("#isProjectByOld").replaceWith(isProjectByNew);
	if (isCommodityPriceRuleTemp == "Y") {
		document.getElementById("isCommodityPriceRule_Y").click();
		$("#divIsCommodityPriceRule_Y").show();
		$("#divIsCommodityPriceRule_N").hide();
	} else if (isCommodityPriceRuleTemp == "N") {
		$("#divIsCommodityPriceRule_Y").hide();
		$("#divCommodityPriceRuleOption_0").show();
		$("#divCommodityPriceRuleOption_1").show();
		document.getElementById("isCommodityPriceRule_N").click();
		document.getElementById("commodityPriceRuleOption_1").checked=true;
		if (fkAtmNoCommodityTemp == 5) {
			$("#divNoCommodityRuleOther").show();
		}
	}
}

function vaildOption(fkAtmNoCommodity, commodityPriceRuleNew) {
	// 新制
	if (commodityPriceRuleNew == 'Y') {
		if (_cpcType == '1') {
			if (fkAtmNoCommodity >= 3 && fkAtmNoCommodity <= 5) {
				$("#fkAtmNoCommodity").val(fkAtmNoCommodity);
				$("#hiddenFkAtmNoCommodity").val(fkAtmNoCommodity);
			} else {
				$("#fkAtmNoCommodity").val(null);
				$("#hiddenFkAtmNoCommodity").val(null);
			}
		} else {
			if (fkAtmNoCommodity >= 4 && fkAtmNoCommodity <= 6) {
				$("#fkAtmNoCommodity").val(fkAtmNoCommodity);
				$("#hiddenFkAtmNoCommodity").val(fkAtmNoCommodity);
			} else {
				$("#fkAtmNoCommodity").val(null);
				$("#hiddenFkAtmNoCommodity").val(null);
			}
		}
	}
	// 舊制
	else {
		switch (_cpcType) {
			case '1':
				if (fkAtmNoCommodity >= 3 && fkAtmNoCommodity <= 5) {
					$("#fkAtmNoCommodity").val(fkAtmNoCommodity);
				} else {
					$("#fkAtmNoCommodity").val(null);
				}
				break;
			case '2':
				if (fkAtmNoCommodity == 1 || fkAtmNoCommodity == 4 || fkAtmNoCommodity == 5) {
					$("#fkAtmNoCommodity").val(fkAtmNoCommodity);
				} else {
					$("#fkAtmNoCommodity").val(null);
				}
				break;
			case '3':
				if (fkAtmNoCommodity == 2 || fkAtmNoCommodity == 4 || fkAtmNoCommodity == 5) {
					$("#fkAtmNoCommodity").val(fkAtmNoCommodity);
				} else {
					$("#fkAtmNoCommodity").val(null);
				}
				break;
		}
	}
	
	if($("#fkAtmNoCommodity").val() == 5){
		$("#divNoCommodityRuleOther").show();
	}else{
		$("#divNoCommodityRuleOther").hide();
	}
}

function priceRuleDisNew(proctrgCateChanged) {
	initialCommodityNew();
	appendingNewOption();
	// 若有「招標公告」的決標公告之標的分類，與原招標公告時的標的分類相同(未變更)，則設定disabled
	const isSameCategory = !proctrgCateChanged;
	if(isSameCategory){
		$("#isCommodityPriceRule_Y").prop("disabled", true);
		$("#projectByItem").prop("disabled", true);
		$("#adjustRangeByItem").prop("disabled", true);
		$("#projectByClass").prop("disabled", true);
		$("#adjustRangeByClass").prop("disabled", true);
		$("#adjustRangeByAll").prop("disabled", true);
		$("#commodityPriceRuleCommodity").prop("disabled", true);
		$("#isCommodityPriceRule_N").prop("disabled", true);
		$("#commodityPriceRuleOption_1").prop("disabled", true);
		$("#fkAtmNoCommodity").prop("disabled", true);
		$("#noCommodityRuleOther").prop("disabled", true);
		$("#atLeastOneRange").hide();
	}
}

function priceRuleUndisNew() {
	$("#isCommodityPriceRule_Y").prop("disabled", false);
	$("#projectByItem").prop("disabled", false);
	$("#adjustRangeByItem").prop("disabled", false);
	$("#projectByClass").prop("disabled", false);
	$("#adjustRangeByClass").prop("disabled", false);
	$("#adjustRangeByAll").prop("disabled", false);
	$("#commodityPriceRuleCommodity").prop("disabled", false);
	$("#isCommodityPriceRule_N").prop("disabled", false);
	$("#commodityPriceRuleOption_1").prop("disabled", false);
	$("#fkAtmNoCommodity").prop("disabled", false);
	$("#noCommodityRuleOther").prop("disabled", false);
}
/* 決標資料 - End */