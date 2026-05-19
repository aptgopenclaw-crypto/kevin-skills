/**
 * 新增決標公告 - 頁籤共用元件js
 */
/* 共用元件 - Start */
var $jq = jQuery.noConflict();
var _orgActiveDesc = {'Y':'啟用', 'N':'停用', 'X':'未開通', 'D':'裁撤', 'O':'靜止帳戶', 'L':'鎖定'};
// 日期 (共用元件)
function getDate(divName, dateName, dateType, defaultVal){
	console.log(dateName + "_defaultValue: " + defaultVal);
	var date = {
		element : document.getElementById(divName),
		type : dateType,
		defaultValue : defaultVal,	// 預設值(必須為西元年), ex: '2020/04/23' || '2020/04/23 12:00'
		attr : {
			id:dateName, 
			name:dateName, 
			class:'form-date', 
			alt:'日期', 
			size:20, 
			maxlength:20
		}
	}
	console.log(date);
	var component = new Geps3.DatePicker(date);
	if(divName == 'divApprovalDate_6'){		
		$("#divApprovalDate_6 div").removeClass("f_20");
		$("#divApprovalDate_6 div div:first").addClass("date_L");
		$("#divApprovalDate_6").find("input").attr("id", "divApprovalDate_6Input");
		$("#divApprovalDate_6Input").attr("style", "height: 35px;");

		$("#divApprovalDate_6Input").click(function(){
			var top = ($("#divApprovalDate_6").offset().top) + 30;
			var left = $("#divApprovalDate_6").offset().left;
			$("#calendarDiv").find("div").eq(0).attr("style", "left: " + left + "px; top: " + top + "px;");
			component.rePosition();
		});
	}else{
		$("[id='" + divName + "'] div").removeClass("f_20");
		$("[id='" + divName + "'] div div:first").addClass("date_L");
		$("[id='" + divName + "']").find("input").attr("id", divName + "Input");
		$("[id='" + divName + "Input']:first").attr("style", "height: 35px;");

		$("[id='" + divName + "Input']").click(function(){
			var top = ($("[id='" + divName + "']").offset().top) + 30;
			var left = $("[id='" + divName + "']").offset().left;
			$("#calendarDiv").find("div").eq(0).attr("style", "left: " + left + "px; top: " + top + "px;");
			if(divName == 'divOpenDate'){
				//修改開標時間geptime排版
				var timeleft = ($("[id='" + divName + "']").offset().left) + 272;
				$("#calendarDiv").find("div").eq(7).attr("style", "height: 338px; left: " + timeleft + "px; top: " + top + "px;display: inline-block;");
			}
			component.rePosition();
		});
	}
}

//判斷瀏覽器是否為IE 
function isIE(){
    if(!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

//決標日期 共用元件 
function getAwardDate(divName, dateName, dateType, defaultVal){
	console.log("getAwardDate: " + divName);
	var date = {
		element : document.getElementById(divName),
		type : dateType,
		defaultValue : defaultVal,	// 預設值(必須為西元年), ex: '2020/04/23' || '2020/04/23 12:00'
		attr : {
			id:dateName, 
			name:dateName, 
			class:'form-date', 
			alt:'日期', 
			size:20, 
			maxlength:20
		},
		callback : function(dateData){
			console.log(dateData);
			var awardDateString = dateData.dataValue;
			//debugger;
			if(awardDateString != null && awardDateString.length > 0){
				// 2023/2/20 因日期元件為共用, 故限定僅有"決標日期"欄位會影響其他欄位的檢核
				if (divName == 'divAwardDate') {
					checkIsLaw111(awardDateString);
		            //公共工程節能減碳檢核注意事項，是否屬公共工程節能減碳檢核注意事項規定應辦理節能減碳檢核
					checkEsCrProvision(awardDateString);
					// 物價指數項目名稱上線日
					checkProjectBy(awardDateString);
					checkExecDateEarlyAwardDate(awardDateString);
					// 是否屬「公共工程生態檢核注意事項」規定應辦理生態檢核
					checkEcoModOnlineDate(awardDateString);
					// 檢核「公共藝術經費預繳期限」與「公共藝術經費預計請款日」
					toggleArtFieldsByAwardDate(awardDateString);
				}
			} else {
				checkExecDateEarlyAwardDate(new Date(Date.now()));
			}
		}
	}
	window.component = new Geps3.DatePicker(date);
}

// 數字轉換金額格式 (共用元件)預算金額
function getCurrency(divName, currencyName, currencyNameVal, messageId, errMessageId, defaultVal, onClickFunc){
//	console.log(divName + ", " + currencyName + ", " + defaultVal);
	var currencyConfig = {
		element : document.getElementById(divName),
		attr : {
			id : currencyName, 
			name: currencyName, 
			maxlength: '17', 
			alt: '數字轉換金額格式', 
			class: 'form-control', 
			onblur: onClickFunc,
			onKeyup:"chkNum('" + currencyName + "')"
		}, 
		showMessage : false,
//		messageElement : document.getElementById(divStringName),
		defaultValue : defaultVal,		// ex: '1234'
		callback : function(currencyData){
			var editType = $("#editType").val();
			//如果不為新增, 將空字串轉為0元
			if(editType ==2 || editType == 3 || editType == 5){
				if(currencyData.value.length == 0 || currencyData.value == ""){
					currencyData.value = 0;
				}
			}
			console.log("currencyData value = " + currencyData.value);
			console.log("errMessageId = " + errMessageId);
			console.log("errMessageId html = " + $("[id='"+errMessageId+"']").html());
			// 存取"純數字"字串至input hidden "currencyNameVal"
			$("[id='"+currencyNameVal+"']").val(currencyData.value);
			if (currencyData.chineseValue != ''){
				$("div[id='"+messageId+"']").html(currencyData.chineseValue);
				$("span[id='"+messageId+"']").html(currencyData.chineseValue);
			}else{
				$("div[id='"+messageId+"']").html("");
				$("span[id='"+messageId+"']").html("");
			}
			if(currencyData.errorMessage.length >0){
				$("[id='"+errMessageId+"']").html(currencyData.errorMessage);
			}else{
				$("[id='"+errMessageId+"']").html('');
			}
			
			console.log(currencyNameVal);
			if(currencyNameVal == "budgetAmount"){
				if($("#fkPmsMain").val() != "" && $("#fkPmsMain").val() != "0"){
					showTenderBudgetData(currencyData.value);
				}
				
				checkBudgetZero();	// 判斷"預算金額為 0 原因"欄位是否顯示
				showUploadItService(); // 資訊服務頁籤顯示判斷
				//設定重大開工要件相關欄位
			    checkIsMajorPcBwCase();
			}
			//取得決標方式 awardType
			//如果為定期會送 採購金額應小於100萬
			var awardType = $('#fkPmsAwardType').val();
			var procurementAmountValue = $('#procurementAmountValue').val();
			var announcementAmount = 1000000;
			if (_announcementAmount !== undefined) {
				announcementAmount = _announcementAmount;
			}
			if(awardType != null && awardType.length >0){
				if(awardType == 1 && procurementAmountValue >= announcementAmount){
					$('#error_procurementAmountValue').html("定期彙送採購金額應小於announcementAmount");
				}else{
					$('#error_procurementAmountValue').html("");
				}
			}
//			if(currencyName == "budget"){ // 預算金額
//				showIsVolunteerItService(); // 判斷是否顯示本案預算金額未達1,000萬元，本機關自願提供價格資料
//				checkBudgetZero();	// 判斷"預算金額為 0 原因"欄位是否顯示
//				showUploadItService(); // 資訊服務頁籤顯示判斷
				//設定重大開工要件相關欄位
//			    checkIsMajorPcBwCase();
//			}
		}
	}
//	console.log(currencyConfig);
	var component = new Geps3.Currency(currencyConfig);
	$("#" + divName + " tr").find("td").eq(1).after("<td>元</td>");
	$("#" + divName + " tr td").attr("style","border:0px;");
}

function chkNum(objId){
	if($("#" + objId).val().indexOf('.') > 0) {
		$("#" + objId).val($("#" + objId).val().replaceAll(".",""));
	}
}

//數字轉換金額格式 (共用元件) for 決標資料頁簽 底價金額
function getCurrency4Esti(divName, currencyName, currencyNameVal, messageId, errMessageId, defaultVal, onClickFunc){
//	console.log(divName + ", " + currencyName + ", " + defaultVal);
	var currencyConfig = {
		element : document.getElementById(divName),
		attr : {
			id : currencyName, 
			name: currencyName, 
			maxlength: '17', 
			alt: '數字轉換金額格式', 
			class: 'form-control', 
			onblur: onClickFunc
		}, 
		showMessage : false,
//		messageElement : document.getElementById(divStringName),
		defaultValue : defaultVal,		// ex: '1234'
		callback : function(currencyData){
			//debugger;
			// 存取"純數字"字串至input hidden "currencyNameVal"
			$("[id='"+currencyNameVal+"']").val(currencyData.value);
			$("div[id='"+messageId+"']").html(currencyData.chineseValue);
			if(currencyData.errorMessage.length >0)
				$("[id='"+errMessageId+"']").html(currencyData.errorMessage);
		
			var isJointBid = $('#isJointBid').val();
			if(isJointBid == 'Y'){
				checkGovernmentEstimate(currencyNameVal);
			}
		}
	}
//	console.log(currencyConfig);
	var component = new Geps3.Currency(currencyConfig);
	$("#" + divName + " tr").find("td").eq(1).after("<td>元</td>");
	$("#" + divName + " tr td").attr("style","border:0px;");
}

//金額元件for建議金額
function getCurrency4Recomment(divName, currencyName, currencyNameVal, messageId, errMessageId, defaultVal, onClickFunc){
	var currencyConfig = {
		element : document.getElementById(divName),
		attr : {
			id : currencyName, 
			name: currencyName, 
			maxlength: '17', 
			alt: '數字轉換金額格式', 
			class: 'form-control', 
			onblur: onClickFunc
		}, 
			showMessage : false,
//		messageElement : document.getElementById(divStringName),
		defaultValue : defaultVal,		// ex: '1234'
		callback : function(currencyData){
			//debugger;
			// 存取"純數字"字串至input hidden "currencyNameVal"
			$("[id='"+currencyNameVal+"']").val(currencyData.value);
			$("div[id='"+messageId+"']").html(currencyData.chineseValue);
			if(currencyData.errorMessage.length >0)
				$("[id='"+errMessageId+"']").html(currencyData.errorMessage);
		}
	}
//	console.log(currencyConfig);
	var component = new Geps3.Currency(currencyConfig);
	$("#" + divName + " tr").find("td").eq(1).after("<td>元</td>");
	$("#" + divName + " tr td").attr("style","border:0px;");
}

/**
 *創建數字轉換金額格式的公共元件
 *@param id          //html document 元素
 *@param messageid   //顯示中文格式 document 元素
 *@param defval      //預設值
 **/
function currency(id, messageid, defval) {
	var currencyConfig = {
		defaultValue : defval,
		maxlength: '17', 
		callback : function(currencyData) {
			//console.log("atm_common.js currency");
			//console.log(currencyData);
			
			if(id.match(/#/) == '#' && messageid.match(/#/) == '#'){
				$(id).text(currencyData.formateValue + "元");
				$(messageid).html(currencyData.chineseValue);
			}else{
				$("[id='" + id+"']").text(currencyData.formateValue + "元");
				$("[id='" + messageid+"']").html(currencyData.chineseValue);
			}
		}
	}
	var component = new Geps3.Currency(currencyConfig);
}

/**
 *創建數字轉換金額格式的公共元件，傳入參數為base64加密後的數字
 *@param id          //html document 元素
 *@param defval      //預設值
 **/
function currencyEncryption(id, defval) {
	var currencyConfig = {
		defaultValue : atob(defval),
		maxlength: '17', 
		callback : function(currencyData) {
			$("[id='"+id+"']").text(currencyData.formateValue + "元");
		}
	}
	var component = new Geps3.Currency(currencyConfig);
}

/**
 *創建數字轉換金額格式的公共元件
 *@param id          //html document 元素
 *@param defval      //預設值
 **/
function currencyForNum(id, defval) {
	var currencyConfig = {
		defaultValue : defval,
		maxlength: '17', 
		callback : function(currencyData) {
			
			if(id.match(/#/) == '#' && messageid.match(/#/) == '#'){
				$(id).text(currencyData.formateValue + "元");
				//$(messageid).html(currencyData.chineseValue);
			}else{
				$("[id='" + id+"']").text(currencyData.formateValue + "元");
				//$("[id='" + messageid+"']").html(currencyData.chineseValue);
			}
		}
	}
	var component = new Geps3.Currency(currencyConfig);
}

/**
 * 英數字檢核的公共元件
 * @param Id     //input 屬性 id
 * @param messageElement //顯示資訊 html document 
 * @param content //
 */
function createNumberInput(divName,numberName,messageElement,content,defaultVal,messageElementId){
	defaultVal = defaultVal == "0.0" ? "0" : defaultVal;
	var numberConfig = {
		element : document.getElementById(divName),
		attr : { id : numberName ,
				 name: numberName , 
				 style:"height: 34px; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: 4px; box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075); color: #ababab; transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;" ,
				 alt:'英數字'
			   },
		param : {defaultValue : defaultVal},
		showMessage : true,
		messageElement : document.getElementById(messageElementId),
		callback : function(alphanumericData){console.log(alphanumericData);
			var t=$("#"+messageElementId).text();$("#"+messageElement).text(t);$("#"+messageElementId).text("");
			setNoRecyclePelletRsn();
			if($("#fkPmsMain").val() != ""){
				showRecyclePelletUsage();
			}
		}
	}
	var numberCode = new Geps3.Alphanumeric(numberConfig);
	$("#"+divName+" table").removeAttr("width")
	$("#"+divName).find("tr").eq(0).children("td").eq(1).html("公噸<span id="+messageElement+" class="+"red_3"+"></span>");
	$("<td>"+content+"</td>").insertBefore($("#"+divName).find("tr").eq(0).children("td").eq(0));
	$("#"+divName+" tr td").attr("style","border:0px;").attr("width","300px");
}

//所有國家(共用元件) 排除中華民國
function getCountry(divName,country,countryValue, defaultVal){
	//console.log("getCountry s:" + new Date().getTime());
	//延遲2秒讓元件再後面產生
	var timeoutID = window.setTimeout(function(){
		initCountry(divName,country,countryValue, defaultVal, 'TW;');
	}, 1500);	
	//console.log(timeoutID);
}

//所有國家(共用元件) 包括中國民國
function getCountryWithTw(divName,country,countryValue, defaultVal){
	//console.log("getCountry s:" + new Date().getTime());
	//延遲2秒讓元件再後面產生
	var timeoutID = window.setTimeout(function(){
		initCountry(divName,country,countryValue, defaultVal, '');
	}, 1500);	
	//console.log(timeoutID);
}

//所有國家(共用元件) 包括中國民國 (for 簽約廠商-原產地國別)
function getCountryWithTw2(divName,country,countryValue, defaultVal){
	//console.log("getCountry s:" + new Date().getTime());
	//延遲2秒讓元件再後面產生
	var timeoutID = window.setTimeout(function(){
		initCountry2(divName,country,countryValue, defaultVal, '');
	}, 1500);	
	//console.log(timeoutID);
}

//原產地國別(共用元件)(得標廠商畫面)
function getCountryForItem(divName,country,countryValue, defaultVal, delay){
	//debugger;
	if(delay.length == 0){
		delay = 1000;
	}
	//console.log("getCountry s:" + new Date().getTime());
	//延遲2秒讓元件再後面產生
	var timeoutID = window.setTimeout(function(){
		initCountryForNationOri(divName,country,countryValue, defaultVal, '');
	}, delay);	
	//console.log(timeoutID);
}

//得標廠商國別有一定機率會存不到值 故將name改為tmp 並在JSP存值
function initCountryForNationOri(divName,country,countryValue, defaultVal ,excludes){
	console.log("country:" + defaultVal);
	var countryConfig = {
		element : document.getElementById(divName),
		attr : { 
			id : country ,
			name: country + "Tmp",
			class:'form-select',
			alt:'國家碼' 
		},
		excludes : excludes,
		defaultValue : defaultVal,
		callback : function(countryData){
			console.log(countryData);
			$("[id='" + countryValue+"']").val(countryData.value);
		}
	}
	
	var component = new Geps3.Country(countryConfig);
	console.log("call render()");
	component.render();
	console.log("getCountry e:" + new Date().getTime());
}

function initCountry(divName,country,countryValue, defaultVal ,excludes){
	console.log("country:" + defaultVal);
	var countryConfig = {
		element : document.getElementById(divName),
		attr : { 
			id : country ,
			name: country,
			class:'form-select',
			alt:'國家碼' 
		},
		excludes : excludes,
		defaultValue : defaultVal,
		callback : function(countryData){
			console.log(countryData);
			$("[id='" + countryValue+"']").val(countryData.value);
			checkBidderNation(countryData.value);
		}
	}
	
	var component = new Geps3.Country(countryConfig);
	console.log("call render()");
	component.render();
	console.log("getCountry e:" + new Date().getTime());
}

//檢核得標廠商國別
function checkBidderNation(nationCode){
	var companyTypeSyscom = $('select[name="companyTypeSyscom"]').val();  //組織型態
	var isForeignPerson = '';
	if(document.getElementById('atmBidder.isForeignPerson') != null) {
		isForeignPerson = document.getElementById('atmBidder.isForeignPerson').value;
	}
	var suppName = $("input[name='atmBidder.suppName']").val();
	$("#spanErrorFkAtmBidderNation").text("");
	if (companyTypeSyscom != null && companyTypeSyscom.replace(/(^s*)|(s*$)/g, "").length != 0 && nationCode == 'TW'){
		if(companyTypeSyscom == '5'){
			$("#spanErrorFkAtmBidderNation").text("組織型態選取「外國廠商」者，「得標廠商國別」不允許選取「中華民國(Republic of China (Taiwan))」");
		}else if(companyTypeSyscom == '6' && isForeignPerson == 'Y'){
			$("#spanErrorFkAtmBidderNation").text("組織型態選取「外國自然人」者，「得標廠商國別」不允許選取「中華民國(Republic of China (Taiwan))」");
		}
		if(companyTypeSyscom == '1' && suppName != null && suppName.replace(/(^s*)|(s*$)/g, "").length != 0){
			// 依工程會要求 友訊科技股份有限公司台灣分公司，可以選擇中華民國。
			if("友訊科技股份有限公司台灣分公司" == suppName){
				$("#spanErrorFkAtmBidderNation").text("");
			}
			else if(suppName.indexOf('台灣分公司') > -1 || suppName.indexOf('臺灣分公司') > -1){
				$("#spanErrorFkAtmBidderNation").text("「廠商名稱」欄位內容包含「台灣分公司」或「臺灣分公司」字樣者，「得標廠商國別」不允許選取「中華民國(Republic of China (Taiwan))」");
			}
			else if(suppName.indexOf('在臺協會') > -1 || suppName.indexOf('在台協會') > -1){
				$("#spanErrorFkAtmBidderNation").text("「廠商名稱」欄位內容包含「在臺協會」或「在台協會」字樣者，「得標廠商國別」不允許選取「中華民國(Republic of China (Taiwan))」");
			}
		}
	}
}

function initCountry2(divName,country,countryValue, defaultVal ,excludes){
	console.log("country:" + defaultVal);
	var countryConfig = {
		element : document.getElementById(divName),
		attr : { 
			id : country ,
			name: country,
			class:'form-select',
			alt:'國家碼' 
		},
		excludes : excludes,
		defaultValue : defaultVal,
		callback : function(countryData){
			console.log(countryData);
			$("[id='" + countryValue+"']").val(countryData.value);
		}
	}
	
	var component = new Geps3.Country(countryConfig);
	console.log("call render()");
	component.render();
	console.log("getCountry e:" + new Date().getTime());
}

//機關代碼查機關名稱
function getOrgQuery(divOrgQuery, id, name, defaultValue, orgName){
	var orgQueryConfig = {
		element : document.getElementById(divOrgQuery),
		attr : { id : id , name: name , class:'form-control' , alt:'組織名稱/統一編號互查' },
		defaultValue : defaultValue,
//		messageElement : document.getElementById(divOrgQuery),
		callback : function(orgQueryData){
			console.log(orgQueryData);
			if(orgQueryData.success == true){
				var active = orgQueryData.value.active;
				console.log(_orgActiveDesc[active]);
				$("[id='" + id+"']").val(orgQueryData.value.orgId);
				$("[id='" + orgName+"']").val(orgQueryData.value.name);
				// 採購資料|已公告資料 - 補助機關
				if(id.indexOf('grantOrgId')!=-1){
					var idx = id.match(/\d+/)[0];
					console.log(idx);
					console.log(active);
					$('font[id="errorGrantOrgId[' + idx+ ']"]').html("");
					$('font[id="errorGrantOrgName[' + idx+ ']"]').html("");
					//設定狀態
					$('input[id="atmGrantList['+ idx+ '].active"]').val(active);
				}
				
				// 採購資料|已公告資料 - 辦理方式
				if (id == "dealOrgIdTmp" || id == "dealOrgId"){
					//機關沒啟用
					$("[id='dealOrgId']").val(orgQueryData.value.orgId);
					$("[id='dealOrgName']").val(orgQueryData.value.name);
					$('#dealOrgIdErrorMsg').html("");
					checkFkTpamHowBid();
				}
				// 決標資料 - 履約機關
				if (id == "contractExecuteOrgIdTmp"){
					$("[id='contractExecuteOrgId']").val(orgQueryData.value.orgId);
					$("[id='contractExecuteOrgName']").val(orgQueryData.value.name);
				}
			}else{
				if (id == "dealOrgIdTmp" || id == "dealOrgId"){
					$("[id='dealOrgName']").val("");
				}
				if(id.indexOf('grantOrgId')!=-1){
					$('input[id="atmGrantList['+ idx+ '].grantOrgName"]').val("");
					var idx = id.match(/\d+/)[0];
					$('font[id="errorGrantOrgId[' + idx+ ']"]').html("");
					$('font[id="errorGrantOrgName[' + idx+ ']"]').html("");
				}else if(id == "dealOrgIdTmp"){
					$('#dealOrgIdErrorMsg').html("");
				}else if(id == "contractExecuteOrgIdTmp"){
					$('#div_contractExecuteOrgIdErr').html("");
				}
				$('input[id="atmGrantList['+ idx+ '].active"]').val('');
			}
		}
	}
	
	var component = new Geps3.OrgQuery(orgQueryConfig);
	$("[id='"+divOrgQuery + "'] div").find("div").eq(1).find("a").eq(0).attr("href", "#"+divOrgQuery);
}

//地址共用元件
function getAddress(span_address,addrCity,addrArea,addrZip,addrDetl){
	var config = {
		element : document.getElementById(span_address),
//		isCns : true,
		attr : {
			city : { id : 'addrCity' , name: 'addrCity' , alt:'城市'},
			cityArea : { id : 'addrArea' , name:'addrArea'  , alt:'行政地區'},
			zipcode : { id : 'addrZip' , name:'addrZip' , readonly : true , alt : '郵遞區號'},
			detail : { id : 'addrDetl' , name:'addrDetl'  , alt : '街道號詳細資訊'},
		},
		defaultValue : { city : addrCity, cityArea : addrArea ,zipcode : addrZip , detail : addrDetl },
		showAddress : true,
		messageElement : document.getElementById('addr_detail_msg'),
		callback : function(addressData){
			console.log(addressData);
			var addrDetl = addressData.detail;
			if(addressData.detail.trim().length == 0){
				$('#div_addrDetl_err').html("<font color='red'>地址為必要欄位，欄位值不可為空白。</font>");
			}else{
				$('#div_addrDetl_err').html("<font color='red'></font>");
			}
			if(addrDetl.indexOf("<") < 0 && addrDetl.indexOf(">") < 0){
				$("#addrDetl").val(addrDetl);
			}else{
				if(addrDetl.indexOf("<page>") != -1 && addrDetl.indexOf("<code>") != -1){
					$("#addrDetl").val(addrDetl);
				}else{
					$("#addrDetl").val("");
				}
			}
		}
	}

	var component = new Geps3.Address(config);
	var zipCode = config.defaultValue.zipcode;
	//當縣市選其他時，cityArea會是null
	var allDetail = config.defaultValue.zipcode.substring(0,3) + config.defaultValue.city + config.defaultValue.cityArea + config.defaultValue.detail;
	if(zipCode == 999){
		allDetail = config.defaultValue.zipcode.substring(0,3) + config.defaultValue.city + config.defaultValue.detail;
	}
	$('#addr_detail_msg').html($('<div>').text(allDetail).html());
}

//標的分類共用元件
function getTargetClassification(procTrgCode){
	var isCpp = $("#isCpp").val();  //是否屬共同供應契約採購
	
	procTrgCode = parseInt(procTrgCode) < 10 && procTrgCode.length == 1 ? "0" + procTrgCode : procTrgCode;
	var tenderQueryConfig = {
		element : document.getElementById('DmsProctrgCodeArea'),
		attr : {
			id : 'proctrgCode' , 
			name: 'proctrgCode' , 
			class: 'form-control'
		},
		defaultValue : {
			value : procTrgCode
		},
		
		messageElement : document.getElementById('DmsProctrgName'),
		callback : function(cpcData){
			//debugger;
			if($("[name='radio_fkPmsProctrgCate']:checked").length > 0){
				_fkPmsProctrgCate = parseInt($("[name='radio_fkPmsProctrgCate']:checked").val());
			}else{
				_fkPmsProctrgCate = 0
			}
			console.log(cpcData);
			console.log("標的分類: "+cpcData.value.typeName);
			$("#fkDmsProctrgCode").val(cpcData.value.id);
			$("#proctrgDesc").val(cpcData.value.name);
			$("#proctrgCodeTmp").val(cpcData.value.code);
			$("[id='proctrgCode']").val(cpcData.value.code);
			var fkPmsProctrgCate = $('input[type=hidden][name=fkPmsProctrgCate]').val();
			var fkAtmLimitedLaw = $("#fkAtmLimitedLaw").val();
			setfkPmsProctrgCate(cpcData.value.typeName);
			checkRowIsIntlCompetition(); // 判斷是否顯示國際競圖之採購欄位
			checkRowIsIntlCompetitionComm(); //判斷是否顯示是否屬依國際競圖設計成果辦理之工程採購欄位
			showUploadItService(); // 資訊服務頁籤顯示判斷
			checkIsPackage(); // 是否屬統包
			console.log("_dmsProctrgCodeOfTender: " + _dmsProctrgCodeOfTender);
			showProctrgDescData(cpcData.value.code, _dmsProctrgCodeOfTender);
			// 8672、8673 是否應依公共工程專業技師簽證規則實施技師簽證
			chooseIsEngineer();
			if($("#rowIsWoodenStructure").length > 0){
				checkIsWoodenStructure(cpcData.value.id);
			}
			var fkPmsProctrgCate;
			if (cpcData.value.typeName == '工程類') {
				fkPmsProctrgCate = 1;
			}
			else if (cpcData.value.typeName == '財物類') {
				fkPmsProctrgCate = 2;
			}
			else if (cpcData.value.typeName == '勞務類') {
				fkPmsProctrgCate = 3;
			}
			var proctrgCode = cpcData.value.code;
			// 2020.10.06 George 各機關使用再生粒料相關欄位需求單
		    if (checkIsRecyclePelletCase(fkPmsProctrgCate, proctrgCode) == "Y") {
		    	$jq("#rowIsRecyclePellet").show();
		    }
		    else {
		    	$jq("#rowIsRecyclePellet").hide();
		    }
		    
		    var isCpp = $("#isCpp").val();
		    if(isCpp == "Y" && fkPmsProctrgCate == '1'){
				$("#proctrgCodeErrorMessage").text("共同供應契約案，標的分類不可為工程。");
			}else{
				$("#proctrgCodeErrorMessage").text("");
			}
		    
		    // 公開取得電子報價單
		    if(_isEqmCase == "Y" && cpcData.value.typeName == '勞務類'){
				$("#proctrgCodeErrorMessage").text("標的分類僅允許選擇財物類或工程類");
			}else{
				$("#proctrgCodeErrorMessage").text("");
			}
			
			// 2020.09.28 George 招標方式為"公開取得報價單或企劃書"和"公開取得電子報價單"沒有WTO欄位。
			var fkPmsTenderWay = $("#fkPmsTenderWay").val();
			if (fkPmsTenderWay != "2" && fkPmsTenderWay != "12" && _isTender != "Y"){
				console.log("_isTreatPurcModify :" + _isTreatPurcModify);				
				if(editType == 1 || _isTreatPurcModify == true){
					getTreatyThreshold($("input[type=radio][name=fkTpamHowBid]:checked").val(), $("#ownershipOrgId").val(), 
					$("#dealOrgId").val(), $("#awardDate").val(), document.getElementById("procurementAmountValue").value,
					$("input[name=radio_fkPmsProctrgCate]:checked").val(), cpcData.value.code,
					$("#fkPmsTenderWay").val(), $("#fkAtmLimitedLaw option:selected").attr('lawcode'));
				}
			}
			
			if(isCpp =='Y' &&  cpcData.value.typeName == '工程類'){
				//顯示錯誤訊息 共同供應契約案，標的分類不可為工程。
				$("#fkDmsProctrgCodeErrorMessage").text('共同供應契約案，標的分類不可為工程。');
			}else{
				$("#fkDmsProctrgCodeErrorMessage").text('');
			}
			//招標方式為限制性招標
			if(parseInt($("#fkPmsTenderWay").val()) == parseInt(4) || parseInt($("#fkPmsTenderWay").val()) == parseInt(6)){
//				debugger;
//				if (fkPmsProctrgCate == ''){
//					debugger;
				
//		 			checkFkPmsProcurementRange();
//		 			$("#fkAtmLimitedLaw").html("");
//		 			console.log("標的分類共用元件 : onchangeAtmLimitedLawOption");
//		 			onchangeAtmLimitedLawOption();
//		 			var law = $("#fkAtmLimitedLaw").val();
//		 			if(law == ''){
//		 				clickLimitedLaw('');
//		 		}
				
				if (fkAtmLimitedLaw == '12' && cpcData.value.id != _fkDmsProctrgCode){
					checkFkPmsProcurementRange(); 
		 			$("#fkAtmLimitedLaw").html("");
		 			onchangeAtmLimitedLawOption();
		 			clickLimitedLaw('');
	 				$("input[name='procurementTargets']").each(function(){
						$(this).prop("checked", false);
					});
	 				$("#trProcurementTarget").hide();
	 			}
				
				if (fkPmsProctrgCate == ''){
		 			checkFkPmsProcurementRange(); 
		 			$("#fkAtmLimitedLaw").val("");
		 			$("#fkAtmLimitedLaw").html("");
		 			onchangeAtmLimitedLawOption();
		 			clickLimitedLaw('');
				}
				else if (fkPmsProctrgCate != '' && fkPmsProctrgCate != _fkPmsProctrgCate && _isTender !='Y'){
					//標的分類值更動後觸發
		 			checkFkPmsProcurementRange(); 
		 			$("#fkAtmLimitedLaw").val("");
		 			$("#fkAtmLimitedLaw").html("");
		 			onchangeAtmLimitedLawOption();
		 			clickLimitedLaw('');
				}
			}
			// 標的分類(872、845、849、874、94)顯示提示訊息
			var timeoutID = window.setTimeout(function(){
				showCpcCheckBlockUI(cpcData.value.name);
			}, 1100);
			
			//設定重大開工要件相關欄位
		    checkIsMajorPcBwCase();
		    
		    //巨額工程採購之決標原則是否已於招標前提報機關成立之採購審查小組審查
		    chkHugeCommCase(fkPmsProctrgCate);
		}
	}
	 
	var DmsProctrg = new Geps3.Cpc(tenderQueryConfig);
//	$("#DmsProctrgCodeArea").find("div").eq(0).children("div").eq(0).removeClass("f_90");//將標的分類公共元件中第一個div中class屬性的f_90拿掉
//	$("#DmsProctrgCodeArea").find("tr").eq(0).children("td").eq(1).removeAttr("width");//將標的分類公共元件中第二個td的width屬性拿掉
//	$("#DmsProctrgCodeArea button").attr({class:'btn_4c',style:"margin-right: 4px;width: auto !important;padding-left: 20px !important;padding-right: 20px !important;"});//將標的分類公共元件中的按鈕加入css
//	$("#DmsProctrgCodeArea tr td").attr("style","border:0px;");//將標的分類公共元件中的tr和td邊框設定覆蓋掉
//	$("#DmsProctrgCodeArea").find("tr").eq(0).children("td").eq(2).remove();//將標的分類公共元件中第三個td移除
}

/**
 * 呼叫WTO前準備參數
 * @returns
 */
function prepareToGetTreatyThreshold(cpcData){	
	let fkTpamHowBid = $("input[type=radio][name=fkTpamHowBid]:checked").val();
	if(fkTpamHowBid == undefined) fkTpamHowBid = $('#fkTpamHowBid').val();
	
	let ownershipOrgId = $("#ownershipOrgId").val();	
	let dealOrgId = $("#dealOrgId").val();	
	let awardDate = $("#awardDate").val();	
	let procurementAmountValue = $('#procurementAmountValue').val();
	
	let fkPmsProctrgCate = $("input[name=radio_fkPmsProctrgCate]:checked").val();
	if(fkPmsProctrgCate == undefined) $('#fkPmsProctrgCate').val();
	let code = cpcData.value.code;
	
	let fkPmsTenderWay = $("#fkPmsTenderWay").val();
	
	let lawcode = $("#fkAtmLimitedLaw option:selected").attr('lawcode');
	
	console.log("[prepareToGetTreatyThreshold] Params: fkTpamHowBid:" + fkTpamHowBid);
	console.log("[prepareToGetTreatyThreshold] Params: ownershipOrgId:" + ownershipOrgId);
	console.log("[prepareToGetTreatyThreshold] Params: dealOrgId:" + dealOrgId);
	console.log("[prepareToGetTreatyThreshold] Params: awardDate:" + awardDate);
	console.log("[prepareToGetTreatyThreshold] Params: procurementAmountValue:" + procurementAmountValue);
	console.log("[prepareToGetTreatyThreshold] Params: fkPmsProctrgCate:" + fkPmsProctrgCate);
	console.log("[prepareToGetTreatyThreshold] Params: code:" + code);
	console.log("[prepareToGetTreatyThreshold] Params: fkPmsTenderWay:" + fkPmsTenderWay);
	console.log("[prepareToGetTreatyThreshold] Params: lawcode:" + lawcode);
	
	getTreatyThreshold(fkTpamHowBid, ownershipOrgId, dealOrgId, awardDate, procurementAmountValue, fkPmsProctrgCate, code, fkPmsTenderWay, lawcode);
}

function setfkPmsProctrgCate(typeName){
	console.log('setfkPmsProctrgCate');
	//debugger;
	$("input[type=radio][name=radio_fkPmsProctrgCate]").attr("disabled",true);
	let awardDate = $("#awardDate").val()	
	if(typeName == "勞務類"){
		$("input[name='isPackage'][value='Y']").prop('disabled', true);
		$("input[type=radio][id=isPackage_N]").prop('checked', true);
		
	}else{
		$("input[name='isPackage'][value='Y']").prop('disabled', false);
	}
	
	var proctrgCateCheck = true;
	console.log("typeName:" + typeName);
	var fkPmsProcurementRange = $("#fkPmsProcurementRange").val();
	switch(typeName){
	case "工程類":
		$("input[name='radio_fkPmsProctrgCate'][value='1']").prop('checked',true);	// 工程類
		$("input[name='radio_fkPmsProctrgCate'][value='2']").prop('checked',false);	// 財物類
		$("input[name='radio_fkPmsProctrgCate'][value='3']").prop('checked',false);	// 勞務類
		$("#fkPmsProctrgCate_1").removeAttr('disabled');
		$("#fkPmsProctrgCate").val("1").trigger('change');
//		$("input[type=radio][name=fkPmsProctrgCate]").val("1");
		//若為工程類 顯示 是否屬災區重建工程 (暫不分標招方式)
		$('#rowIsReconstruct').show();
		$("#rowIsExecuteProtection").hide();
		$("#rowIsAwardDisability").hide();
		// 判斷標的分類以更換"最新版範本"提示
		isGetNewSampleNotice("1",awardDate);
		break;
	case "財物類":
		$("input[name='radio_fkPmsProctrgCate'][value='2']").prop('checked',true);	// 財物類
		$("input[name='radio_fkPmsProctrgCate'][value='1']").prop('checked',false);	// 工程類
		$("input[name='radio_fkPmsProctrgCate'][value='3']").prop('checked',false);	// 勞務類
		$("#fkPmsProctrgCate_2").removeAttr('disabled');
		$("#fkPmsProctrgCate").val("2").trigger('change');
//		$("input[type=radio][name=fkPmsProctrgCate]").val("2");
		//若為工程類 顯示 是否屬災區重建工程 (暫不分標招方式)
		$('#rowIsReconstruct').hide();
//		$("#rowIsRecyclePellet").hide();
		$("#rowIsExecuteProtection").show();
		checkRowIsAwardDisability();
		// 判斷標的分類以更換"最新版範本"提示
		isGetNewSampleNotice("2",awardDate);
		break;
	case "勞務類":
		$("input[name='radio_fkPmsProctrgCate'][value='3']").prop('checked',true);	// 勞務類
		$("input[name='radio_fkPmsProctrgCate'][value='2']").prop('checked',false);	// 財物類
		$("input[name='radio_fkPmsProctrgCate'][value='1']").prop('checked',false);	// 工程類
		$("#fkPmsProctrgCate_3").removeAttr('disabled');
		$("#fkPmsProctrgCate").val("3").trigger('change');
//		$("input[type=radio][name=fkPmsProctrgCate]").val("3");
		//若為工程類 顯示 是否屬災區重建工程 (暫不分標招方式)
		$('#rowIsReconstruct').hide();
//		$("#rowIsRecyclePellet").hide();
		$("#rowIsExecuteProtection").hide();
		checkRowIsAwardDisability();
		// 判斷標的分類以更換"最新版範本"提示
		isGetNewSampleNotice("3",awardDate);
		break;
	default:
		proctrgCateCheck = false;
		break;
	}
//	$("input[type=radio][name=radio_fkPmsProctrgCate]").attr("disabled",true);
	var fkPmsTenderWay = $("#fkPmsTenderWay").val();
	
	if(fkPmsTenderWay == '1'){
		if(proctrgCateCheck){
			var PmsPCValue=$("input[type=radio][name=radio_fkPmsProctrgCate]:checked").val();
			switch(PmsPCValue){
				case "1":
//					$("#rowIsRecyclePellet").show();
					checkRowIsIntlCompetition();
					break;
				case "2":
//					$("#rowIsRecyclePellet").hide();
					checkRowIsIntlCompetition();
					break;
				case "3":
//					$("#rowIsRecyclePellet").hide();
					checkRowIsIntlCompetition();
					break;
			}
		}
	}
	
	if(fkPmsTenderWay == '2'){
		if(proctrgCateCheck){
			var PmsPCValue=$("input[type=radio][name=radio_fkPmsProctrgCate]:checked").val();
			switch(PmsPCValue){
				case "1":
					//瀝青
//					$("#rowIsRecyclePellet").show();
					break;
				case "2":
//					$("#rowIsRecyclePellet").hide();
					break;
				case "3":
//					$("#rowIsRecyclePellet").hide();
					break;
			}
		}
	}
	
	if(fkPmsTenderWay == '4'){
		if(proctrgCateCheck){
			var PmsPCValue=$("input[type=radio][name=radio_fkPmsProctrgCate]:checked").val();
			switch(PmsPCValue){
				case "1":
//					$("#rowIsRecyclePellet").show();
					$("#rowIsReconstruct").show();
//					switchRowIsAwardDisability("hide");
					$("#rowIsExecuteProtection").hide();
					checkRowIsIntlCompetition();
					break;
				case "2":
//					$("#rowIsRecyclePellet").hide();
					$("#rowIsReconstruct").hide();
//					switchRowIsAwardDisability("show");
					$("#rowIsExecuteProtection").show();
					checkRowIsIntlCompetition();
					break;
				case "3":
//					$("#rowIsRecyclePellet").hide();
					$("#rowIsReconstruct").hide();
//					switchRowIsAwardDisability("hide");
					$("#rowIsExecuteProtection").hide();
					checkRowIsIntlCompetition();
					break;
			}
		}
	}
	
	if(fkPmsTenderWay == '6'){
		if(proctrgCateCheck){
			var fkDmsProctrgCode = $("#fkDmsProctrgCode").val();
			var fkPmsProctrgCate = $("input[type=radio][name=radio_fkPmsProctrgCate]:checked").val();
			switch(fkPmsProctrgCate){
				case "1":
//					if (_excludeStr.indexOf(fkDmsProctrgCode)!=-1) {
//						$("#rowIsRecyclePellet").hide();
//					} else {
//						$("#rowIsRecyclePellet").show(); // 顯示本案是否包括『瀝青混凝土鋪面』、『控制性低強度回填材料(CLSM)』、『級配粒料基層』、『級配粒料底層』或『低密度再生透水混凝土』等可使用再生粒料之工作項目
//					}
					$("#rowIsReconstruct").show();
//					switchRowIsAwardDisability("hide");
					$("#rowIsExecuteProtection").hide();
					$("input[type=radio][name=isPackage]").attr("disabled",false);	// 是否屬統包 解除鎖定
					$("input[name='isEngineer'][value='Y']").attr('disabled', true);	// 是否屬統包 鎖定
					break;
				case "2":
//					$("#rowIsRecyclePellet").hide();
					$("#rowIsReconstruct").hide();
//					switchRowIsAwardDisability("show");
					$("#rowIsExecuteProtection").show();
					$("input[type=radio][name=isPackage]").attr("disabled",false);	// 是否屬統包 解除鎖定
					$("input[name='isEngineer'][value='Y']").attr('disabled', true);	// 是否屬統包 鎖定
					break;
				case "3":
//					$("#rowIsRecyclePellet").hide();
					$("#rowIsReconstruct").hide();
//					switchRowIsAwardDisability("hide");
					$("#rowIsExecuteProtection").hide();
					$("input[name='isPackage'][value='N']").attr('checked',true);	// 是否屬統包 = N
					$("input[name='isPackage'][value='Y']").attr('disabled', true);	// 是否屬統包 鎖定
					$("input[name='isPackage'][value='N']").attr('disabled', false);
					$("input[name='isEngineer'][value='Y']").attr('disabled', false);	// 是否屬統包 解除
					$("#rowExpectBenefit").hide();		// 本案完成後所應達到之功能、效益、標準、品質或特性
					break;
			}
		}
	}
}

//當再生粒料資訊欄位都輸入0時，顯示「未使用焚化再生粒料、轉爐石、電弧氧化碴之理由」欄位
function setNoRecyclePelletRsn(){
	var Usage1=parseFloat($("#recyclePelletUsage1").val());
	var Usage2=parseFloat($("#recyclePelletUsage2").val());
	var Usage3=parseFloat($("#recyclePelletUsage3").val());
	console.log("Usage1:" + Usage1);
	console.log("Usage2:" + Usage2);
	console.log("Usage3:" + Usage3);
	if(Usage1== 0 && Usage2== 0 && Usage3== 0){
		$("#span_noRecyclePelletRsn").show();
	}else{
		$("#span_noRecyclePelletRsn").hide();
	}
}

//input Date object
function convertToUtilDateFmt(srcDate){
	// ex 2020-05-12  ==> 2020/05/12
	var date = srcDate.toISOString().substring(0,10);
	var fmtDate = "";
	if(date.length == 10){
		var year = date.split("-")[0];
		var month = date.split("-")[1];
		var day = date.split("-")[2];
		fmtDate = year + "/" + month + "/" + day;
	}
	return fmtDate;
}
/* 共用元件 - End */

// 共用功能 暫存與導頁
function SaveAndDirect(action){
		switch(action){
		case 'save':
		    //alert("暫存成功");
		case 'ContractInfo':
			$("#direct").val("ContractInfo");
			break;
		case 'PublishedInfo':
			$("#direct").val("PublishedInfo");
			break;
		case 'NoticePccWorkFlow':
			$("#direct").val("NoticePccWorkFlow");
			break;
		case 'AtmBidder':
			$("#direct").val("AtmBidder");
			break;
		case 'AtmAwardItem':
			$("#direct").val("AtmAwardItem");
			break;
		case 'AdvantageAward':
			$("#direct").val("AdvantageAward");
			break;
		case 'MainInfoEnglish':
			$("#direct").val("MainInfoEnglish");
			break;
		case 'MainInfo':
			$("#direct").val("MainInfo");
			break;
		case 'CheckInfo':
			$("#direct").val("CheckInfo");
			break;
		}
		var action = $("#sendForm").attr("action").split("/");
		$("#sendForm").attr("action", _base_url + action[action.length -1]);
		$("#sendForm").submit();
	}

// 檢核標案名稱是否超過40個中文字
function checkTenderName(tenderName){
	$.ajax({
		type: "POST",
		url: _base_url+"checkTenderName",
		dataType: "json",
		data: {tenderName : tenderName},
		success: function(data) {
			if(data.errorMsg != ""){
				$("#tenderNameErrorMessage").text(data.errorMsg);
				$("#tenderCaseNameErrorMsg").text(data.errorMsg);
				$("#tenderName").val(data.tenderName);
				$("#submitLock").val('0');
			}else{
				$("#sendForm").submit();		
				$("#submitLock").val('1');
			}
		},
		error: function(jqXHR) {
			alert("發生錯誤: " + jqXHR.status);    
		}
	});
}

//履約地點(含地區)共用元件
function getCelocation(initElement, utilName, target, defaultVal){
	console.log("defaultVal"+defaultVal);

	var defaultVals = defaultVal.split(",");
	var list = new Array();
	if(defaultVal != ""){
		for(var i=0; i<defaultVals.length;i++){
			var val = defaultVals[i];
			if(val.indexOf("－") == -1 && val.indexOf("(") == -1) {  //for 二代轉三代決標
				val += "－全區";
			}
			list.push(val);
		}
	}
	console.log("[getCelocation] default : " + list);
	var celocationConfig = {
		element : document.getElementById(initElement),
		attr : { id : utilName , name: utilName , class:'form-control' , alt:'履約地點(含地區)' },
		defaultValue : list,
		showMessage : true,
		callback : function(celocationData){
			// 範例 : 將資料存成 "臺北市,新北市"
			console.log("--------[getCelocation]--------- callback :");
			console.log(celocationData);
			var locations = [];
			if (celocationData.success) {
				locations = celocationData.value;
			} else if (celocationData != undefined && celocationData.length > 0) {
				locations = celocationData;
			}
			if(locations != null && locations.length > 0){
				var names = [];
				locations.forEach(function(item, index){
					if(item.name != undefined){
						console.log(item.name);
						names[index] = item.name; 
					}else{
						names[index] = item;
					}
				});
				console.log('#' + target);
				$('#' + target).val(names);
			}
			else{
				$('#' + target).val("");
			}
		}
	}
	var component = new Geps3.Celocation(celocationConfig);
	$("#span_country").find("div").eq(1).attr("style", "width: 651px;");
}

//履約地點共用元件
function getAllCelocation(initElement, utilName, target, defaultVal,isLaw1179Val){
	var i=0;
	$("#tr_isLaw1179").hide();
	var allCelocationConfig = {
		element : document.getElementById(initElement),
		defaultValue : {pkValue : [defaultVal]},
		attr : { 
			id: utilName, 
			name: utilName, 
			class: 'form-control', 
			alt: '履約地點'
		},
		multiple : false,	// 預設值為複選，必須鎖定單選。
		suppQuery : false,
		callback : function(celocationData){
			console.log(celocationData);
			var range = $(":radio[name=radio_fkPmsProcurementRange]:checked").val();
			if(range == undefined){
				range = $('#fkPmsProcurementRange').val();
			}
			if (celocationData.value != "") {
				$("#fkPmsExecuteLocation").val(celocationData.value[0]['dbId']);
				$("#locationDesc").val(celocationData.value[0]['name']);
				
			}
			//if(typeof(celocationData.value)!= "undefined" && range.replace(/(^s*)|(s*$)/g, "").length != 0 && range != null){
			//共用元件v0.38之後，celocationData若為空，celocationData.value會回覆空字陣列
			if(celocationData.value != "" && range.replace(/(^s*)|(s*$)/g, "").length != 0 && range != null){
				console.log("isAborigineZone: "+celocationData.value[0]["isAborigineZone"]);
				$("#isAborigineZone").val(celocationData.value[0]["isAborigineZone"]);
				if(range=="1" && celocationData.value[0]["isAborigineZone"] == "Y"){
					$("#tr_isLaw1179").show();
					console.log("isLaw1179: "+isLaw1179Val);
					if(i==0){$(":radio[name=isLaw1179]").val([isLaw1179Val]);i=1;}
				}else{$("#tr_isLaw1179").hide();$(":radio[name=isLaw1179]").val([""]);i=1;}
			}else{$("#tr_isLaw1179").hide();$(":radio[name=isLaw1179]").val([""]);i=1;}
		}
	}
	/*2021.05.12 Cavin
	 * (新增決標)決標的履約地點，不應有預設值
	 * 當傳給共用元件預設值沒有值時，刪除defaultValue屬性
	 * */
	if (defaultVal.replace(/(^s*)|(s*$)/g, "").length == 0 || defaultVal == null || defaultVal == 0) {
		delete allCelocationConfig.defaultValue;
	}
	var component = new Geps3.AllCelocation(allCelocationConfig);
}

//創建洽辦機關代碼的公共元件
function getOrgHowbid(){
	var intlCompetitionCommTenderOrgId = $("#intlCompetitionCommTenderOrgId").val();
	var orgQueryConfig = {
		element : document.getElementById("howbidArea"),
		attr : { id : 'input_bidstr' , name: 'input_bidstr' , class:'form-control' , alt:'組織名稱/統一編號互查' },
		messageElement : document.getElementById('demo_msg'),
		defaultValue: intlCompetitionCommTenderOrgId,
		callback : function(orgQueryData){
			console.log(orgQueryData.value);
			if(orgQueryData.value != null){
				$("#intlCompetitionCommTenderOrgId").val(orgQueryData.value.orgId);
//					$("#bidstrName").val(orgQueryData.value.name);
			}
//				$("howbidArea .geps-common-msg").val();
		}
	}
	var component = new Geps3.OrgQuery(orgQueryConfig);
	$("#howbidArea tr td").attr("style", "border: 0px;");
	$("button").attr("class","btn_4w");
}

//資訊服務頁籤顯示判斷
function showUploadItService(){
	$("#showItService").hide();
	var fkPmsAwardWay = $("#fkPmsAwardWay").val(); // 決標方式
	var isTender = $("#isTender").val(); 
	var fkDmsProctrgCode = $("#fkDmsProctrgCode").val(); // 標的分類代碼pk
	var proctrgCode = $("#proctrgCode").val() == undefined?$("#proctrgCodeTmp").val():$("#proctrgCode").val(); // 標的分類代碼
	//fkDmsProctrgCode = isTender == "Y" ? proctrgCode : fkDmsProctrgCode;
	var budgetAmount = $("#budgetAmount").val(); // 預算金額
//	var isVolunteerItService  = $('input[type=radio][name=chkIsVolunteerItService]:checked').val();
	var isVolunteerItService  = htmlEncode($('input[type=hidden][name=isVolunteerItService]').val());
	
	//標的分類841、842、843、844、849，(最低標、最高標、最有利標皆可)預算金額未達1000萬，須有「自願提供價格資料」
	if(proctrgCode == "84" || proctrgCode == "841" || proctrgCode == "842" || proctrgCode == "843" || 
			proctrgCode == "844" || proctrgCode == "845" || proctrgCode == "8451" || proctrgCode == "849"){
		//大於1000萬 且最有利標 顯示
		if(budgetAmount >= 10000000 && fkPmsAwardWay == "3"){
			$("#tr_isVolunteerItService").hide();
			$("#showItService").show();
			if ($("#direct").val() == "PublishedInfo"){
				$("#publishInfo_nextPage").attr("onclick","SaveAndDirect('UploadItService')");
			}
		}else if(budgetAmount < 10000000){
			$("#tr_isVolunteerItService").show();
			if(isVolunteerItService == 'Y'){
				$("#showItService").show();
				if ($("#direct").val() == "PublishedInfo"){
					$("#publishInfo_nextPage").attr("onclick","SaveAndDirect('UploadItService')");
				}
			}
			else{
				$("#showItService").hide();
				if ($("#direct").val() == "PublishedInfo"){
					if ($("#isCpp").val() == "Y"){
						$("#publishInfo_nextPage").attr("onclick","SaveAndDirect('NoticePccWorkFlow')");
					}
					else{
						$("#publishInfo_nextPage").attr("onclick","SaveAndDirect('AtmBidder')");
					}
				}
			}
		}else if(budgetAmount >= 10000000){
			//如果預算金額改為大於等於10000000則要隱藏 202001114 byJohn
			$("#tr_isVolunteerItService").hide();
			$("input[name='chkIsVolunteerItService'][value='"+isVolunteerItService+"']").prop('checked',false);
			$('input[type=hidden][name=isVolunteerItService]').val('');
			if ($("#direct").val() == "PublishedInfo"){
				if ($("#isCpp").val() == "Y"){
					$("#publishInfo_nextPage").attr("onclick","SaveAndDirect('NoticePccWorkFlow')");
				}
				else{
					$("#publishInfo_nextPage").attr("onclick","SaveAndDirect('AtmBidder')");
				}
			}
		}
	}else{
		$("#tr_isVolunteerItService").hide();
		$("input[name='chkIsVolunteerItService'][value='"+isVolunteerItService+"']").prop('checked',false);
		$('input[type=hidden][name=isVolunteerItService]').val('');
		if ($("#direct").val() == "PublishedInfo"){
			if ($("#isCpp").val() == "Y"){
				$("#publishInfo_nextPage").attr("onclick","SaveAndDirect('NoticePccWorkFlow')");
			}
			else{
				$("#publishInfo_nextPage").attr("onclick","SaveAndDirect('AtmBidder')");
			}
		}
	}
}

// 2020.08.13 George 把"限制性招標依據法條內容"從"atm_publishInfo.js"轉移至此。
function showAtmLimitedDesc(fkAtmLimitedLaw) {
	//debugger;
	var retValue;
	
	if (fkAtmLimitedLaw == undefined || fkAtmLimitedLaw == ""){
		$("#divAtmLimitedLawDesc").html("");
		return "";
	}

	switch (parseInt(fkAtmLimitedLaw)) {
	    case 1:
	    	retValue = "以公開招標、選擇性招標或依採購法第9款至第11款公告程序辦理結果，無廠商投標或無合格標，且以原定招標內容及條件未經重大改變者。";
	    	break;
	    case 2:
	    	retValue = "屬專屬權利、獨家製造或供應、藝術品、秘密諮詢，無其他合適之替代標的者。";
	        break; 
	    case 3:
	    	retValue = "遇有不可預見之緊急事故，致無法以公開或選擇性招標程序適時辦理，且確有必要者。";
	        break; 
	    case 4:
	    	retValue = "原有採購之後續維修、零配件供應、更換或擴充，因相容或互通性之需要，必須向原供應廠商採購者。";
	        break;
	    case 5:
	    	retValue = "屬原型或首次製造、供應之標的，以研究發展、實驗或開發性質辦理者。";
	        break;
	    case 6:
	    	retValue = "在原招標目的範圍內，因未能預見之情形，必須追加契約以外之工程，如另行招標，確有產生重大不便及技術或經濟上困難之虞，非洽原訂約廠商辦理，不能達契約之目的，且未逾原主契約金額百分之五十者。";
	        break;
	    case 7:
	    	retValue = "原有採購之後續擴充，且已於原招標公告及招標文件敘明擴充之期間、金額或數量者。";
	        break;
	    case 8:
	    	retValue = "在集中交易或公開競價市場採購財物。";
	        break;	
	    case 2219:
	    	retValue = "委託專業服務、技術服務或資訊服務或社會福利服務，經公開客觀評選為優勝者。";
	        break;	
	    case 22110:
	    	retValue = "辦理設計競賽，經公開客觀評選為優勝者。";
	        break;
	    case 22111:
	    	retValue = "因業務需要，指定地區採購房地產，經依所需條件公開徵求勘選認定適合需要者。";
	        break;
	    case 12:
	    	retValue = "購買身心障礙者、原住民或受刑人個人、身心障礙福利機構或團體、政府立案之原住民團體、監獄工場、慈善機構及庇護工場所提供之非營利產品或勞務。";
	        break;
	    case 13:
	    	retValue = "委託在專業領域具領先地位之自然人或經公告審查優勝之學術或非營利機構進行科技、技術引進、行政或學術研究發展。";
	        break;
	    case 24:
	    	retValue = "邀請或委託具專業素養、特質或經公告審查優勝之文化、藝術專業人士、機構或團體表演或參與文藝活動或提供文化創意服務。";
	        break;
	    case 25:
	    	retValue = "公營事業為商業性轉售或用於製造產品、提供服務以供轉售目的所為之採購，基於轉售對象、製程或供應源之特性或實際需要，不適宜以公開招標或選擇性招標方式辦理者。";
	        break;	
	    case 26:
	    	retValue = "其他經主管機關認定者。";
	    	$("#remindFkAtmLimitedLaw").html("(公告金額以上案件須登載主管機關認定函日期及文號)");
	    	$("#remindFkAtmLimitedLaw").show();
	        break;	
	    case 14:
	    	retValue = "因應國家面臨戰爭、戰備動員或發生戰爭者，得不適用採購法之規定。";
	        break;
	    case 15:
	    	retValue = "機密或極機密之採購，得不適用採購法第27條、第45條及第61條之規定。";
	        break;
	    case 16:
	    	retValue = "確因時效緊急，有危及重大戰備任務之虞者，得不適用採購法第26條、第28條及第36條之規定。";
	        break;
	    case 17:
	    	retValue = "以議價方式辦理之採購，得不適用採購法第26條第3項本文之規定。";
	        break;
	    case 18:
	    	retValue = "國家遇有戰爭、天然災害、癘疫或財政經濟上有重大變故，需緊急處置之採購事項。";
	        break;
	    case 19:
	    	retValue = "人民之生命、身體、健康、財產遭遇緊急危難，需緊急處置之採購事項。";
	        break;
	    case 20:
	    	retValue = "公務機關間財物或勞務之取得，經雙方直屬上級機關核准者。";
	        break;
	    case 21:
	    	retValue = "依條約或協定向國際組織、外國政府或其授權機構辦理之採購，其招標、決標另有特別規定者。";
	        break;	
	    case 212:
	    	retValue = "符合採購法第22條第1項第16款所定情形，經需求、使用或承辦採購單位就個案敘明邀請指定廠商比價或議價之適當理由，簽報機關首長或其授權人員核准者，得採限制性招標，免報經主管機關認定。";
	        break;
	    case 28:
	    	retValue = "古蹟、歷史建築及聚落修復或再利用有關之採購，其為工程採購者，得採用選擇性招標；其為古蹟之勞務採購者，並得採用限制性招標。<BR>古蹟、歷史建築之工程採購，依古蹟歷史建築重大災害應變處理辦法執行之緊急搶救、加固等應變處理措施或涉及特殊修復之專業技術者，得採用限制性招標，不經公告程序，邀請二家以上廠商比價或僅邀請一家廠商議價。";
	        break;
	    case 31:
	    	retValue = "毗鄰房地產或畸零地之採購，係與現有房地產合併，以應業務需要者。";
	        break;
	    case 32:
	    	retValue = "符合採購法第22條第1項第2款、第3款、第7款或第8款之情形者。";
	        break;
	    case 33:
	    	retValue = "其他經主管機關認定者。";
	    	
			//工程會要求當指定地區採購房地產作業辦法第4條第3款要顯示黃底黑字訊息
			$("#remindFkAtmLimitedLaw").html("(須登載主管機關認定函日期及文號)");
			$("#remindFkAtmLimitedLaw").show();
	    	
	        break;
	    case 301:
	    	retValue = "依本辦法辦理採購，得採用限制性招標，不經公告程序，邀請二家以上廠商比價或邀請一家廠商議價。";
	    	break;
	    case 913:
	    	retValue = "國營事業為進行創新或研究發展之合作或委託研究而辦理公告金額以上之採購者，除我國締結之條約或協定另有規定者外，得採限制性招標，不受政府採購法第十九條及第二十二條第一項之限制。";
	    	break;
	    
	    default: 
	    	retValue = "";
	}
	
	if(parseInt(fkAtmLimitedLaw) != 26 && parseInt(fkAtmLimitedLaw) != 33){
		$("#remindFkAtmLimitedLaw").hide();
	}
	
    if (retValue != ""){
        $("#divAtmLimitedLawDesc").html("法條內容："+retValue);    	
    }else{
        $("#divAtmLimitedLawDesc").html("");
    } 

	return retValue;
}

// 判斷標的分類以更換"最新版範本"提示
//function changeNewSampleNotice(){
//	var fkPmsProctrgCate = $("#fkPmsProctrgCate").val();
//	var newSampleNotice = "";
	
//	if (fkPmsProctrgCate == 1){
//		newSampleNotice += 	"工程類工程採購契約範本最新版之時間為「107.07.24」<br>" +
//							"工程類統包工程採購契約範本最新版之時間為「105.01.12」<br>" +
//							"工程類節能績效保證專案統包工程採購契約範本最新版之時間為「105.01.12」<br>" +
//							"工程類災害搶險搶修開口契約範本最新版之時間為「105.01.12」<br>";
//	}
//	else if (fkPmsProctrgCate == 2){
//		newSampleNotice += 	"財物類財物採購契約範本最新版之時間為「107.09.20」<br>";
//	}
//	else if (fkPmsProctrgCate == 3){
//		newSampleNotice += 	"勞務類勞務採購契約範本最新版之時間為「105.01.22」<br>" + 
//							"勞務類公共工程技術服務契約範本最新版之時間為「106.04.06」<br>" + 
//							"勞務類公共工程專案管理契約範本最新版之時間為「106.04.06」<br>" + 
//							"勞務類資訊服務採購契約範本最新版之時間為「106.07.13」<br>" + 
//							"勞務類勞動派遣採購契約範本最新版之時間為「107.01.30」<br>" + 
//							"勞務類災後復建工程設計、監造技術服務開口契約範本最新版之時間為「106.04.06」<br>";
//	}
	
//	newSampleNotice += "上開契約範本係依決標日期往前搜尋及顯示當時最新版契約範本";
	
//	$("#NewSampleNotice").html(newSampleNotice);
//}

// 預算金額 - 核准人
function showTenderBudgetData(Budget){
	var Budget = typeof(Budget) == "undefined" ? $("#budgetAmount").val() : Budget;
	var tenderBudget = $("#tenderBudget").val();
	if(tenderBudget != Budget){
		if(parseInt(tenderBudget) <= parseInt($("#budgetAmount").val())){
			$("#tenderBudgetData").show();
		}else{
			$("#tenderBudgetData").hide();
			$('input[id="choIsPubBudgetAtDoc"]').prop('checked', false);
		}
		$("#tenderBudgetData_approver").show();
		$("input[id='atmApprovalList3.isNeedApprove']").val("Y");
	}else{
		$("#tenderBudgetData").hide();
		$("#tenderBudgetData_approver").hide();
		$("input[id='atmApprovalList3.isNeedApprove']").val("N");
		if($("#budgetErrorMsg2") !== undefined && $("#budgetErrorMsg2").html().indexOf("未勾選「招標文件已刊登正確之預算金額」") > -1) {
			$("#budgetErrorMsg2").hide();
		}
		
		$('input[id="choIsPubBudgetAtDoc"]').prop('checked', false);
		$('#isPubBudgetAtDoc').val("");
	}
	
//	showIsVolunteerItService();
}

//簽約廠商頁籤顯示與否	
function showAtmBidderContract(){
	$("#tabAtmBidderContract").hide();
	if(typeof($jq("#tbContractBidder"))!='undefined'){
		$("#tbContractBidder").hide();
	}
	var fkPmsProcurementRange = $("#fkPmsProcurementRange").val();
	var adaptLaw = $("#adaptLaw").val();
	var isBidderContract = $("#isBidderContract").val();
	console.log(" fkPmsProcurementRange ==> "+fkPmsProcurementRange);
	console.log(" adaptLaw ==> "+adaptLaw);
	console.log(" isBidderContract ==> "+isBidderContract);
	// 鉅額且99條為Y且新增簽約廠商為Y
	if(fkPmsProcurementRange == "4" && adaptLaw == "Y" && isBidderContract == "Y"){
		$("#tabAtmBidderContract").show();
		
		if(typeof($jq("#tbContractBidder"))!='undefined'){
			$("#tbContractBidder").show();
		}
	}
}

function insertAfter( referenceNode, newNode ){
    referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
}

/**
 * 檢查是否顯示最有利標頁籤
 * 當招標方式：限制性招標(經公開評選)或限制性招標(未經公開評選)，決標方式為：準用最有利標
 * 依據法條:採購法第22條第1項第9,10款，需填寫最有利標
 * 依據法條:採購法第22條第1項第11,13,14款，且是否成立評選委員會為是。 
 * 將最有利標頁籤enabled 否則 disabled
 * 20110613，最有利標修正為：限制性招標及其決標公告(含定期彙送) ，如「決標方式」選取「準用最有利標」，
 * 除「是否成立評選委員會」選取「否」外，均需登載「最有利標」頁籤之內容。
 */
function checkIsAdvantageTab(tenderWay,fkPmsAwardWay,slctVlu) {
	//debugger;
	console.log("Start checkIsAdvantageTab ; tenderWay,fkPmsAwardWay,slctVlu: " + tenderWay + " " + fkPmsAwardWay + " " + slctVlu);
   //mark by jerryChou, 因應最有利標條件修正
	// 判斷是否顯示最有利標頁籤
    if( (tenderWay == "4" || tenderWay == "6") && fkPmsAwardWay == "3" ) {
        if( slctVlu == "1" && typeof($jq("#law2211OriAwardWay").val())!='undefined' && $jq("#law2211OriAwardWay").val()!="" && $jq("#law2211OriAwardWay").val()=="參考最有利標精神"){
        	hideTab("advTab");
        	_isAdvantage = false;
        	// 採購法第22條第1項第11款, 採購法第22條第1項第13款 , 採購法第22條第1項第14款
        }else if( slctVlu == "22111" || slctVlu == "13" || slctVlu == "24") {
        	if($("#tr_IsFoundCommittee").length >0){
                document.getElementById("tr_IsFoundCommittee").style.display = "";   
        	} 

            if(document.getElementById("tdIsFoundCommittee").innerHTML.indexOf("hidden") == -1) {
            	setInterval(function(){
    				$("#tdIsFoundCommittee").css("opacity","");  //可修改
    			},100);
            }
            if($('input[type="radio"][name="isFoundCommittee"]:checked').val() != undefined && $('input[type="radio"][name="isFoundCommittee"]:checked').val() == 'Y'){
                showTab("advTab");
                _isAdvantage = true;
            } else if($('input[type="hidden"][name="isFoundCommittee"]').val() != undefined && $('input[type="hidden"][name="isFoundCommittee"]').val() == 'Y') {
            	showTab("advTab");
                _isAdvantage = true;
            } else {
                hideTab("advTab");
                _isAdvantage = false;            
            }
        } else {
        	if($("#tr_IsFoundCommittee").length >0){
                document.getElementById("tr_IsFoundCommittee").style.display = "none";     
        	}      
            showTab("advTab");
            _isAdvantage = true;
        }
    }
}

function checkIsAdvantageTab2(tenderWay, fkPmsAwardWay, slctVlu, isFoundCommittee) {
	//debugger;
	console.log("Start checkIsAdvantageTab2 ; tenderWay,fkPmsAwardWay,slctVlu: " + tenderWay + " " + fkPmsAwardWay + " " + slctVlu);
   //mark by jerryChou, 因應最有利標條件修正
	// 判斷是否顯示最有利標頁籤
    if( (tenderWay == "4" || tenderWay == "6") && fkPmsAwardWay == "3" ) {
        if( slctVlu == "1" && typeof($jq("#law2211OriAwardWay").val())!='undefined' && $jq("#law2211OriAwardWay").val()!="" && $jq("#law2211OriAwardWay").val()=="參考最有利標精神"){
        	hideTab("advTab");
        	_isAdvantage = false;
        	// 採購法第22條第1項第11款, 採購法第22條第1項第13款 , 採購法第22條第1項第14款
        }else if( slctVlu == "22111" || slctVlu == "13" || slctVlu == "24") {
        	if($("#tr_IsFoundCommittee").length >0){
            	document.getElementById("tr_IsFoundCommittee").style.display = "";   
        	}

            if(isFoundCommittee == 'Y'){
                showTab("advTab");
                _isAdvantage = true;
            }else{
                hideTab("advTab");
                _isAdvantage = false;            
            }
        } else {
            showTab("advTab");
            _isAdvantage = true;
            if($("#tr_IsFoundCommittee").length >0){
                document.getElementById("tr_IsFoundCommittee").style.display = "none"; 
            }
        }
    } 
}

function showTab(tabId){
	$('[id="' + tabId + '"]').show();
}

function hideTab(tabId){
	$('[id="' + tabId + '"]').hide();
}

function openDivTmpSave(){
	$.blockUI({
		message: $('#divTmpSave'),
		css: {
			width: '50%',
			top: '20%',
			left: '25%'
		}
	});
}

function closeDivTmpSave(){
	$.unblockUI();
	$("body").css({'background':'#ddd5b8', 'overflow-y':'auto'});
}

function disableTabs(){
	tabs_disable("tabAtmBidderContract");
	tabs_disable("tab_c4");
	tabs_disable("tab_c5");
	tabs_disable("tab_c7");
	tabs_disable("tab_c8");
	
	var isEng = $jq("#isEnglishNotice").val();
	var fkPmsAwardWay = $jq("#fkPmsAwardWay").val();
	var isLowestLaw = $jq("#isLowestLaw").val();
	
	if (isEng == "Y")
		tabs_disable("tab_c6");
	if (fkPmsAwardWay == "3" || isLowestLaw == "Y")
		tabs_disable("tab_c9");
}

function tabs_disable(tabId){
	$('[id="' + tabId + '"]').addClass("un");
	$('[id="' + tabId + '"]').prop('onclick',null).off('click');
}

function tabs_enable(tabId){
	$('[id="' + tabId + '"]').removeClass("un");
}

/**
 * 將難字Page code 轉換成難字圖片
 * @param src 來源 element
 * @param target 目標 element
 * @returns
 */
function getCnsOld(src, target) {
	let srcVal = $(src);
	//判斷來源內容有無難字code 有才執行
	let code = srcVal.val();
	console.log(code.indexOf("<code>")!=-1);
	console.log(code.indexOf("<page>")!=-1);
	
	if(code.length >0 && code.indexOf("<code>")!=-1 && code.indexOf("<page>")!=-1){
		let targetVal = $(target);
		Geps3.CNS.changeCNS({
			jelm : srcVal, 
			loadFinish : function(){
				let cnsVal = Geps3.CNS.getCNSVal(srcVal);
				console.log(cnsVal);
				let cnsImg = Geps3.CNS.pageCode2Img(cnsVal);
				console.log(cnsImg);
				if ($("#direct").val() == "AtmBidderContract"){
					targetVal.html(cnsImg +'<input type="hidden" id="suppName" name="bidderContract.suppName" value="'+cnsVal+'"/>');
				}
				else {
					targetVal.html(cnsImg +'<input type="hidden" id="suppName" name="atmBidder.suppName" value="'+cnsVal+'"/>');
				}
				//隱藏圖示
				var timeoutID = window.setTimeout(function(){
					$(".imethodIcon").hide();
				}, 500);	
			}
		});
	}else{
		return
	}
}

/**
 * 將初始input中難字Page code 轉換成難字字串
 * @param val 來源 string
 * @param target 目標 element
 * @returns
 */
function getCnsInit4Input(val, target) {
	let code = $(target);
	let codeVal = val.replace('&lt;page&gt;','<page>').replace('&lt;/page&gt;','</page>').replace('&lt;code&gt;','<code>').replace('&lt;/code&gt;','</code>');
	if (codeVal.length > 0 && codeVal.indexOf("<code>") != -1 && codeVal.indexOf("<page>") != -1) {
		// 初始化難字
		Geps3.CNS.changeCNS({
			jelm : code, 
			// 初始化成功
			defaultValue : codeVal, 
			loadFinish : function(){
				Geps3.CNS.bindChangeEvent(code, function(e){
					// 變更後進入該方法，並取得該元素值。
					let cnsVal = Geps3.CNS.getCNSVal(code);
				});
			}
		});
	}
}

// 3家或4家合格廠商投標，開標後僅1家廠商符合招標文件規定
function showSupplierAmountOne(){
	$.blockUI({
		message: $('#supplierAmountOne'),
		css: {
			width: '30%',
			top: '20%',
			left: '40%'
		}
	});
}

/**
 * 將民國年轉為西元年字串
 * @param rocDate
 * @returns
 */
function convertRocDateToWest(rocDate){
	var result = "";
	if(rocDate.length == 9){
		var dateArr = rocDate.split("/");
		var year = parseInt(dateArr[0],10);
		year += 1911;
		result = year + '/' + dateArr[1] + '/' + dateArr[2];
		console.log(result);
	}
	return result;
}

/**
 * 將廠商名稱難字pagecode字串轉成圖片字串
 * @param suppName
 * @returns
 */
function bidderCnsToImg(suppName){
	let purifySuppName = DOMPurify.sanitize(suppName, {ADD_TAGS:['page'], ADD_ATTR:['onclick']});
	var tmp = purifySuppName.replaceAll('&lt;', '<').replaceAll('&gt;','>');
	if (tmp.length > 0 && tmp.indexOf("<code>") != -1 && tmp.indexOf("<page>") != -1){
		var tmp_1 = tmp.split("<page>")[0];
		var tmp_2 = "<page>"+(tmp.split("<page>")[1].split("</code>")[0])+"</code>";
		var tmp_3 = tmp.split("</code>")[1];
        tmp_3 = tmp_3 == undefined? "" : tmp_3;
		var cnsToImg = Geps3.CNS.pageCode2Img(tmp_2);
		var suppName_array = [tmp_1, cnsToImg, tmp_3];
		
		tmp = tmp_1 + cnsToImg + tmp_3;
	}
    if (tmp.length > 0 && tmp.indexOf("<code>") != -1 && tmp.indexOf("<page>") != -1){
        tmp = bidderCnsToImg(tmp);
    }
	return tmp;
}
/**
 * 將難字 PageCode字串 轉換成 圖片字串顯示在HTML
 * @param src 來源 element
 * @param target 目標 element
 * @returns
 */
function cnsToImg(src,target){
	let srcVal = $(src);
	//判斷來源內容有無難字code 有才執行
	let code = srcVal.val();
	if(code.length > 0 && code.indexOf("<code>") != -1 && code.indexOf("<page>") != -1){
		$(target).html(Geps3.CNS.pageCode2Img(code));
	}else{
		return
	}
}

function htmlEncode(value){
	// 建立一個暫存的div元素，並使用text()將內容存成html編碼文字後再用html()取出
	return $('<div/>').text(value).html();
}

//20151112,add by jerry chou, 取得22條1項1款的原公告案號之招標公告之決標方式文字
function limitedLawTenderNoBlur(ownerId, limitedLawTenderNo){
	console.log("limitedLawTenderNoBlur :" + ownerId + ", " + limitedLawTenderNo);
	$.ajax({
		type: "POST",
		url: _base_url+"getLaw2211OriAwardWayWord",
		//不能用 JSON.stringify
		data: {'ownershipOrgId': ownerId, 'limitedLawTenderNo': limitedLawTenderNo},
		dataType: "json",
		success: function (res) {
			//debugger;
			console.log(res);
			var awardWayWord2211="";
			var fkPmsAwardWay2211;
			awardWayWord2211 = res.awardWayWord2211;
			fkPmsAwardWay2211 = res.fkPmsAwardWay2211;
			$('#remindFkAtmLimitedLaw').html("");
			$('#awardWayRemindMsg').html("");
			if(awardWayWord2211.length > 0){
				//判斷原公告案號的決標方式fk是否與本案相同
				if (_fkPmsAwardWay!=fkPmsAwardWay2211){
					var errorMsg = "原公告案號之決標方式為「"+ awardWayWord2211 + "」與本案之決標方式選取「"+$("#spnOriAwardWayDesc").html()+"」不一致，請於新增決標公告之編輯標案案號畫面重新選取決標方式";
					//還原並清空決標方式文字
					$("#law2211OriAwardWay").val("");
					//回復原始的決標方式文字
					$("#spnLaw2211OriAwardWay").html($("#spnOriAwardWayDesc").html());
					//alert(errorMsg);
					$('#div_law22110_msg > div[id="msg_content"]').html($('<div>').text(errorMsg).html());
					showBlockUI("div_law22110_msg");
				}else{
					$("#law2211OriAwardWay").val(awardWayWord2211);
					$("#spnLaw2211OriAwardWay").html($('<div>').text(awardWayWord2211).html());
					if (awardWayWord2211=="參考最有利標精神"){
						//隱藏最有利標的頁籤
						if (_fkPmsAwardWay==3){
							hideTab('advTab');        			
						}
						//依工程會要求於決標方式及原公告案號下增加訊息
						$("#awardWayRemindMsg").html("本案之「決標方式」已由系統依原公告案號標案之招標公告之「決標方式」內容自動帶入，且不允許修改。若招標機關欲修改該決標方式者，不適用政府採購法第22條第1項第1款規定。");
						$("#remindFkAtmLimitedLaw").html("本案之「決標方式」已由系統依原公告案號標案之招標公告之「決標方式」內容自動帶入，且不允許修改。若招標機關欲修改該決標方式者，不適用政府採購法第22條第1項第1款規定。");		        		
					}	        		
				}
			}else{
				//debugger;
				$("#law2211OriAwardWay").val("");
				//回復原始的決標方式文字
				var ori = $("#spnOriAwardWayDesc").html();
				if("最有利標" == ori){
					var fkAtmLimitedLaw = $('#fkAtmLimitedLaw').val();
					if(fkAtmLimitedLaw == 2219 || fkAtmLimitedLaw == 22110 || fkAtmLimitedLaw == 22111 || fkAtmLimitedLaw == 13 || fkAtmLimitedLaw == 24){
						ori = "準用最有利標";
					}
				}
				$("#spnLaw2211OriAwardWay").html(ori);
				//顯示最有利標的頁籤
				if (fkPmsAwardWay==3){
					showTab('advTab');        		
				}
			}		    	
		},
		error: function (res) {
			console.log(res);
		}
	});	
}

function checkIsWoodenStructure(fkDmsProctrgCode){
	if($("#rowIsWoodenStructure").length > 0){
		if(typeof fkDmsProctrgCodeArray !== "undefined"){
			if(fkDmsProctrgCodeArray.indexOf(fkDmsProctrgCode) >= 0){
			document.getElementById("rowIsWoodenStructure").style.display="";
			}else{
				document.getElementById("rowIsWoodenStructure").style.display="none";
			}
		}
	}
}

//判斷各項金額是否超過資料庫允許的長度
function checkAmountValid(inputId,errMsgId) {
	var result = true;
	//金額
	var amountValue = $("#"+inputId).val();
	if (amountValue != null && !amountValue.replace(/(^s*)|(s*$)/g, "").length == 0) {
		if (parseInt(amountValue) > 9999999999999) {
			$("#"+errMsgId).css("color", "red");
			$("#"+errMsgId).html("採購金額超出限制大小！");
			result = false;
		}
	}
	return result;
}
var Base64=  
{  
    _keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",  
    encode:function(e){  
        var t="";  
        var n,r,i,s,o,u,a;  
        var f=0;  
        e=Base64._utf8_encode(e);  
        while(f<e.length){  
            n=e.charCodeAt(f++);  
            r=e.charCodeAt(f++);  
            i=e.charCodeAt(f++);  
            s=n>>2;  
            o=(n&3)<<4|r>>4;  
            u=(r&15)<<2|i>>6;  
            a=i&63;  
            if(isNaN(r)){  
                u=a=64  
            }else if(isNaN(i)){  
                a=64  
            }  
            t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)  
        }  
        return t  
    },  
    decode:function(e){  
        var t="";  
        var n,r,i;  
        var s,o,u,a;  
        var f=0;  
        e=e.replace(/[^A-Za-z0-9+/=]/g,"");  
        while(f<e.length){  
            s=this._keyStr.indexOf(e.charAt(f++));  
            o=this._keyStr.indexOf(e.charAt(f++));  
            u=this._keyStr.indexOf(e.charAt(f++));  
            a=this._keyStr.indexOf(e.charAt(f++));  
            n=s<<2|o>>4;  
            r=(o&15)<<4|u>>2;  
            i=(u&3)<<6|a;  
            t=t+String.fromCharCode(n);  
            if(u!=64){  
                t=t+String.fromCharCode(r)  
            }  
            if(a!=64){  
                t=t+String.fromCharCode(i)  
            }  
        }  
        t=Base64._utf8_decode(t);  
        return t  
    },  
    _utf8_encode:function(e){  
        e=e.replace(/rn/g,"n");  
        var t="";  
        for(var n=0;n<e.length;n++){  
            var r=e.charCodeAt(n);  
            if(r<128){  
                t+=String.fromCharCode(r)  
            }else if(r>127&&r<2048){  
                t+=String.fromCharCode(r>>6|192);  
                t+=String.fromCharCode(r&63|128)  
            }else{  
                t+=String.fromCharCode(r>>12|224);  
                t+=String.fromCharCode(r>>6&63|128);  
                t+=String.fromCharCode(r&63|128)  
            }  
        }  
        return t  
    },  
    _utf8_decode:function(e){  
        var t="";  
        var n=0;  
        var r=c1=c2=0;  
        while(n<e.length){  
            r=e.charCodeAt(n);  
            if(r<128){  
                t+=String.fromCharCode(r);  
                n++  
            }else if(r>191&&r<224){  
                c2=e.charCodeAt(n+1);  
                t+=String.fromCharCode((r&31)<<6|c2&63);  
                n+=2  
            }else{  
                c2=e.charCodeAt(n+1);  
                c3=e.charCodeAt(n+2);  
                t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);  
                n+=3  
            }  
        }  
        return t  
    }  
};

//是否於招標文件載明優先決標予身心障礙福利機構團體或庇護工場
function checkIsAwardDisability(){
	var isAwardDisability = $("input[name='isAwardDisability']:checked").val();
	if (isAwardDisability == "Y") {
		document.getElementById("rowPriorityCate").style.display="";
		document.getElementById("divIsAwardDisability_Y").style.display="";
	}
	else{
		document.getElementById("rowPriorityCate").style.display="none";
		document.getElementById("divIsAwardDisability_Y").style.display="none";
	}
	setIsDisabilityPriority(isAwardDisability);
}

//判斷是否顯示"是否於招標文件載明優先決標予身心障礙福利機構團體或庇護工場"欄位
function checkRowIsAwardDisability(){
	var fkPmsProctrgCate = $("input[name=radio_fkPmsProctrgCate]:checked").val() == undefined? $('#fkPmsProctrgCate').val() : $("input[name=radio_fkPmsProctrgCate]:checked").val();
	var procurementAmountValue = $("#procurementAmountValue").val();
	var isAwardDisability = $('input[name=isAwardDisability]:checked').val() == undefined? $('#isAwardDisability').val() : $('input[name=isAwardDisability]:checked').val();
	/**
	 * 標的分類為"財物類"及"勞務類"，且採購金額級距為"未達公告金額"，
	 * 則顯示「是否於招標文件載明優先決標予身心障礙福利機構團體或庇護工場」欄位。
	 * 2022/12/22 周會會議改為採購金額小 等 於1百萬者	 
	 * 2024/08/29 改為採購金額小 等 於1百50萬者,2024/10/22  改為採購金額小於150萬者
	*/
	if (fkPmsProctrgCate != "1" && procurementAmountValue < 1500000){
    	$("#rowIsAwardDisability").show();
    	if(isAwardDisability == 'Y'){
    		$('#rowPriorityCate').show();
    		$('#divIsAwardDisability_Y').show();
    	}
    }
	else{
		$("#rowIsAwardDisability").hide();
		$('#rowPriorityCate').hide();
		$('#divIsAwardDisability_Y').hide();
    }
	setIsDisabilityPriority(isAwardDisability);
}

function setIsDisabilityPriority(isAwardDisability){
	if( isAwardDisability == "Y" ) {
		//設定身心障礙福利機構團體或庇護工場生產物品及服務的隱藏欄位為是
		$("input[type=radio][name=isDisabilityPriority][value='Y']").prop("checked",true);
		$("input[type=radio][name=isDisabilityPriority][value='N']").prop("checked",false);
	} else if( isAwardDisability == "N" ) {
		//取消設定身心障礙福利機構團體或庇護工場生產物品及服務的隱藏欄位為是
		$("input[type=radio][name=isDisabilityPriority][value='Y']").prop("checked",false);
		$("input[type=radio][name=isDisabilityPriority][value='N']").prop("checked",true);
	}else{
		$("input[type=radio][name=isDisabilityPriority][value='Y']").prop("checked",false);
		$("input[type=radio][name=isDisabilityPriority][value='N']").prop("checked",false);
	}
}

// 對指定的 input 元素套用 byte 長度限制
function applyByteLengthLimit(elementId, maxBytes) {
	const input = document.getElementById(elementId);
	if (!input) {
		console.warn(`找不到元素：${elementId}`);
		return;
	}

	// 移除 HTML 原生的 maxlength，改由 byte 計算控制
	input.removeAttribute("maxlength");

	const encoder = new TextEncoder();

	// 計算字串的 UTF-8 byte 長度
	function getByteLength(str) {
		return encoder.encode(str).length;
	}

	// 將字串截斷至不超過指定 byte 數
	function trimToMaxBytes(str) {
		let byteCount = 0;
		let result = "";
		for (const ch of str) {
			const chBytes = getByteLength(ch);
			if (byteCount + chBytes > maxBytes) break;
			byteCount += chBytes;
			result += ch;
		}
		return result;
	}

	// 輸入法組字完成後，強制截斷超出的部分
	input.addEventListener("keyup", function (e) {
		const fixed = trimToMaxBytes(this.value);
		// 當輸入值超過10bytes時
		if (this.value !== fixed) {
			// 記錄當前游標位置，若無則預設為字串末尾
			const pos = this.selectionStart ?? fixed.length;
			// 將截斷後值寫回輸入框
			this.value = fixed;
			// 計算安全的游標位置，確保不會超過截斷後字串的長度
			const safePos = Math.min(pos, fixed.length);
			// 將游標移至安全位置
			this.setSelectionRange(safePos, safePos);
		}
	});

	// 攔截貼上操作，先截斷再寫入，避免貼上後才截斷造成的閃爍
	input.addEventListener("paste", function (e) {
		e.preventDefault();
		const pasted = e.clipboardData.getData("text");
		const start = this.selectionStart ?? this.value.length;
		const end = this.selectionEnd ?? this.value.length;
		const combined = this.value.slice(0, start) + pasted + this.value.slice(end);
		this.value = trimToMaxBytes(combined);
	});
}
