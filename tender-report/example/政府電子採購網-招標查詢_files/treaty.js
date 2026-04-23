var treatys = ["GPA", "GPA2", "ANZTEC", "ASTEP"];

function readyTreatyCheckText() {
	readyTreatyCheck(true);
}

function readyTreatyCheck() {
	var isCheck = false;
	var fkAtmLimitedLaw = $('#fkAtmLimitedLaw_tmp').val();
	if (arguments.length == 1) {
		isCheck = arguments[0];
	}
	//console.log($("#agreementJsonStr").val());
	if (isNotEmpty($("#agreementJsonStr").val())) {
		$.ajax({
			type : "POST",
			url : "/tps/treaty/getTreatyInfomation",
			data : {
				agreementJsonStr : $("#agreementJsonStr").val(),
				fkAtmLimitedLaw : fkAtmLimitedLaw
			},
			dataType: 'json',
			success : function(data) {
				var a = data;
				for (var i = 0; i < a.treatyList.length; i++) {
					var treatyWord = getTreatyWord(a.treatyList[i].type);
					var type = DOMPurify.sanitize(a.treatyList[i].type);
					var openSrvStr = DOMPurify.sanitize(a.treatyList[i].openSrvStr);
					var openProStr = DOMPurify.sanitize(a.treatyList[i].openProStr);
					var excldRsnStr = DOMPurify.sanitize(a.treatyList[i].excldRsnStr);
					var lawStr = DOMPurify.sanitize(a.treatyList[i].lawStr);

					if (a.treatyList[i].isApplied == "Y") {
						$("#" + type + "_IsAppliedDiv").html("是");
					}
					if (a.treatyList[i].isApplied == "N") {
						$("#" + type + "_IsAppliedDiv").html("否");
					}
					if (typeof(a.treatyList[i].openSrvStr) != 'undefined' && (a.treatyList[i].flag == "C" || a.treatyList[i].flag == "L" || a.treatyList[i].flag == "O" || a.treatyList[i].flag == "Y")) {
						$("#" + type + "_OpeningServiceItemDiv").show();
						$("#" + type + "_OpeningServiceItemTextDiv").html(openSrvStr);
					}
					if (typeof(a.treatyList[i].openProStr) != 'undefined' && (a.treatyList[i].flag == "C" || a.treatyList[i].flag == "L" || a.treatyList[i].flag == "O" || a.treatyList[i].flag == "Y")) {
						$("#" + type + "_OpeningPropertyItemDiv").show();
						$("#" + type + "_OpeningPropertyItemTextDiv").html(openProStr);
					}
					if (typeof(a.treatyList[i].excldRsnStr) != 'undefined') {
						if (a.treatyList[i].isApplied == "N") {
							if (a.treatyList[i].excldRsn != null && typeof(a.treatyList[i].excldRsn) != 'undefined' && !a.treatyList[i].isNotShowExcldRsn) {
								$("#" + type + "_ExcludeReasonTextDiv").show();
								if (isCheck) {
									$("#" + type + "_ExcludeReasonTextDiv").html("<b>[" + treatyWord + "排除理由]</b>" + excldRsnStr + "<br>");
								} else {
									$("#" + type + "_ExcludeReasonTextDiv").html(treatyWord + "排除理由：" + excldRsnStr);
								}
							}
						}
					}
					if (isNotEmpty(lawStr)) {
						if (a.treatyList[i].isApplied == "Y") {
							$("#" + type + "_LawTextDiv").show();
							if (isCheck) {
								$("#" + type + "_LawTextDiv").html("<b>[" + treatyWord + "依據條文]</b>" + lawStr + "<br>");
							} else {
								$("#" + type + "_LawTextDiv").html(treatyWord + "依據條文：" + lawStr);
							}
						}
					}
					if (a.treatyList[i].isNotShow) {
						$("#" + type + "_BlockDiv").hide();
					} else {
						if (fkAtmLimitedLaw != undefined && fkAtmLimitedLaw == 7  && a.treatyList[i].isApplied == 'Y') {
							$("#" + type + "_BlockDiv").hide();
						}else{
							$("#" + type + "_BlockDiv").show();
						}
							
					}
				}
				var isHide = true;
				for (var i = 0; i < treatys.length; i++) {
					if ($("#" + treatys[i] + "_BlockDiv").length) {
						if ($("#" + treatys[i] + "_BlockDiv").css("display") == "none") {
							isHide = isHide && true;
						} else {
							isHide = isHide && false;
						}
					}
				}
				if (isHide) {
					$("#trTreaty").hide();
				} else {
					$("#trTreaty").show();
				}
			},
			error : function(jqXHR) {
				alert("發生錯誤: " + jqXHR.status);
			}
		});
	}					
}

function readyTreaty(){
	try {
		var a = JSON.parse($("#agreementJsonStr").val());
		generatePanel(a);
		$("#temp_btn").click(function(){
			getTreatyFromGpa("GPA");
		});
		document.body.style.overflowY = "auto";
	} catch (e) {
		// TODO: handle exception
		console.log(e);
	}
}

function generatePanel(a){
//	console.log("-=-=- generatePanel:" + JSON.stringify(a));
	var isShowAll = false;
	for (var i = 0; i < a.agreementList.length; i++) {
		// 20210805 資安風險修正
		var treaty = $('<div>').text(a.agreementList[i].type).html();
		// 20210805 資安風險修正
		var treatyWord = $('<div>').text(getTreatyWord(treaty)).html();
		// 20210805 資安風險修正
		var excldRsn = $('<div>').text(a.agreementList[i].excldRsn).html();
		var openPro = a.agreementList[i].openPro;
		// 20210805 資安風險修正
		var openSrv = $('<div>').text(a.agreementList[i].openSrv).html();
		var isDefaultNotTreaty = a.agreementList[i].isDefaultNotTreaty;
		var isDefaultYesTreaty = a.agreementList[i].isDefaultYesTreaty;
		var isDefaultNotTreatyModifyRsn = a.agreementList[i].isDefaultNotTreatyModifyRsn;
		var isDefaultNotTreatyModifyApplied = a.agreementList[i].isDefaultNotTreatyModifyApplied;
		var isShowAgreementLaw = a.agreementList[i].isShowAgreementLaw;
		var isShowPropertyItemList = a.agreementList[i].isShowPropertyItemList;
		var isShowServiceItemList = a.agreementList[i].isShowServiceItemList;
		var isSameOpen = a.agreementList[i].isSameOpen;
		var isConverFromGPA = a.agreementList[i].isConverFromGPA;
		var isConvertToOther = a.agreementList[i].isConvertToOther;
		var isShowTreaty = a.agreementList[i].isShowTreaty;		
		// for 2217, & 40.非屬適用機關
		var isNotShow = a.agreementList[i].isNotShow;
		var isApplied = a.agreementList[i].isApplied;
		var tempAppliedValue = $("#hidden_" + treaty + "_isApplied").val(); 
		
		$("#hidden_" + treaty + "_flag").val(a.agreementList[i].flag);
		$("#hidden_" + treaty + "_excldRsn").val(a.agreementList[i].excldRsn);
		$("#hidden_" + treaty + "_openPro").val(a.agreementList[i].openPro);
		$("#hidden_" + treaty + "_openSrv").val(openSrv);
		$("#hidden_" + treaty + "_law").val(a.agreementList[i].law);
		$("#hidden_" + treaty + "_threshold").val(a.agreementList[i].threshold);
		$("#hidden_" + treaty + "_isApplied").val(isApplied);
		$("#hidden_" + treaty + "_isDefaultNotTreaty").val(isDefaultNotTreaty);
		$("#hidden_" + treaty + "_isDefaultYesTreaty").val(isDefaultYesTreaty);
		$("#hidden_" + treaty + "_isDefaultNotTreatyModifyRsn").val(isDefaultNotTreatyModifyRsn);
		$("#hidden_" + treaty + "_isDefaultNotTreatyModifyApplied").val(isDefaultNotTreatyModifyApplied);
		$("#hidden_" + treaty + "_isShowAgreementLaw").val(isShowAgreementLaw);
		$("#hidden_" + treaty + "_isConvertToOther").val(isConvertToOther);
		$("#hidden_" + treaty + "_isConverFromGPA").val(isConverFromGPA);
		$("#hidden_" + treaty + "_isShowTreaty").val(isShowTreaty);
		$("#hidden_" + treaty + "_isSameOpen").val(isSameOpen);
		$("#hidden_" + treaty + "_isShowServiceItemList").val(isShowServiceItemList);
		$("#hidden_" + treaty + "_isShowPropertyItemList").val(isShowPropertyItemList);
		$("#hidden_" + treaty + "_isNotShow").val(isNotShow);
		
		if (treaty == "GPA2") {
			$("#hidden_GPA_flag").val(a.agreementList[i].flag);
			$("#hidden_GPA_excldRsn").val(a.agreementList[i].excldRsn);
			$("#hidden_GPA_openPro").val(a.agreementList[i].openPro);
			$("#hidden_GPA_openSrv").val(openSrv);
			$("#hidden_GPA_law").val(a.agreementList[i].law);
			$("#hidden_GPA_threshold").val(a.agreementList[i].threshold);
			$("#hidden_GPA_isApplied").val(isApplied);
			$("#hidden_GPA_isDefaultNotTreaty").val(isDefaultNotTreaty);
			$("#hidden_GPA_isDefaultYesTreaty").val(isDefaultYesTreaty);
			$("#hidden_GPA_isDefaultNotTreatyModifyRsn").val(isDefaultNotTreatyModifyRsn);
			$("#hidden_GPA_isDefaultNotTreatyModifyApplied").val(isDefaultNotTreatyModifyApplied);
			$("#hidden_GPA_isShowAgreementLaw").val(isShowAgreementLaw);
			$("#hidden_GPA_isConvertToOther").val(isConvertToOther);
			$("#hidden_GPA_isConverFromGPA").val(isConverFromGPA);
			$("#hidden_GPA_isShowTreaty").val(isShowTreaty);
			$("#hidden_GPA_isSameOpen").val(isSameOpen);
			$("#hidden_GPA_isShowServiceItemList").val(isShowServiceItemList);
			$("#hidden_GPA_isShowPropertyItemList").val(isShowPropertyItemList);
			$("#hidden_GPA_isNotShow").val(isNotShow);
		}
		
		$("#radio_" + treaty + "_isApplied").prop("checked", false);
		$("[name='radio_" + treaty + "_isApplied']").unbind();
		$("[name='radio_" + treaty + "_isApplied']").click(function() {
			var treatyIn = $(this).attr("id").replace("radio_", "").replace("_isApplied", "");
			if ($("#hidden_" + treatyIn + "_isDefaultNotTreaty").val() == "false"
					&& $("#hidden_" + treatyIn + "_isDefaultYesTreaty").val() == "false"
					&& $("#hidden_" + treatyIn + "_isConverFromGPA").val() == "false") {
				getExcldReasonTable(treatyIn, true);
			}

			var thisAppliedResult = $(this).val();
			var oriAppliedResult = $("#hidden_" + treaty + "_isApplied").val();
			//只有資料不一致時，_isChanged的資料才設定為Y
			if (thisAppliedResult != oriAppliedResult){
				$("#hidden_" + treatyIn + "_isChanged").val("Y");
			}else{
				$("#hidden_" + treatyIn + "_isChanged").val("N");
			}
		});
		
		$("[name='radio_" + treaty + "_fkOpProItem']").unbind();
		$("[name='radio_" + treaty + "_fkOpProItem']").on("click", function() {
			showOpeningPropertyItemTable($(this).attr("id"));
		});

		$("#sel_" + treaty + "_fkExcldRsn").unbind();
		$("#sel_" + treaty + "_fkExcldRsn").click(function() {
			var treatyIn = $(this).attr("id").replace("sel_", "").replace("_fkExcldRsn", "");
			$("#sel_" + treatyIn + "_fkExcldRsn").hide();
			if ($("#hidden_" + treatyIn + "_isDefaultNotTreaty").val() == "false" 
					&& $("#hidden_" + treatyIn + "_isDefaultYesTreaty").val() == "false"
					&& $("#hidden_" + treatyIn + "_isConverFromGPA").val() == "false") {
				getExcldReasonTable(treatyIn, true);
			}
		});

		checkOpProItem(treaty);

		if (isNotEmpty(openSrv)) {
			$("[name='radio_" + treaty + "_fkOpSerItem'][value='" + openSrv + "']").prop("checked", true);
			var word = $("#value_" + treaty + "_openSrv_" + openSrv).val();
			// 20210804 資安風險修正
			$("#" + treaty + "OpenServiceItemText").html($('<div>').text(word).html());
		} else {
			$("#" + treaty + "OpenServiceItemText").html("請選擇");
		}
		$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("disabled", false);
		$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("disabled", false);
		$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("checked", false);
		$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("checked", false);
		$("#span_" + treaty + "_isApplied").hide();
		$("#span_" + treaty + "_isApplied2").hide();
		
//		var isOpenSrvChanged = $("#hidden_" + treaty + "_isOpenSrvChanged").val();
//		console.log("-=-=- " + treaty + ", openSrv:" + openSrv + ", isOpenSrvChanged:" + isOpenSrvChanged);
//		if (isOpenSrvChanged == "Y" && openSrv > 0) {
//			isApplied = "Y";
//		}

//		if (isApplied == "N") {
		var isChanged = $("#hidden_" + treaty + "_isChanged").val();
		var treatyIsApplied = (isChanged == "Y") ? tempAppliedValue : a.agreementList[i].isApplied;
		if (treatyIsApplied == "N") {
			$("#span_" + treaty + "_isApplied").hide();
			$("#" + treaty + "_error_msg_div").hide();
			$("#span_" + treaty + "_isApplied2").show();
			$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("checked", true);
			var excldRsnWord = $("#value_" + treaty + "_excldRsn_" + excldRsn).val();
			if (typeof (excldRsnWord) == 'undefined') {
				if (typeof (a.treatyList) != 'undefined') {
					excldRsnWord = a.treatyList[i].excldRsnWord;
					if (typeof (excldRsnWord) == 'undefined') {
						excldRsnWord = "請選擇";
						excldRsn = "";
					}
				} else {
					excldRsnWord = "請選擇";
					excldRsn = "";
				}
			}
			// 20210806 資安風險修正
			excldRsnWord = $('<div>').text(excldRsnWord).html();
			$("#sel_" + treaty + "_fkExcldRsn > option").remove();
			$("#sel_" + treaty + "_fkExcldRsn").append("<option value='" + excldRsn + "'>" + excldRsnWord + "</option>");
			$("#span_single_" + treaty + "_fkExcldRsn").html(treatyWord + "排除理由：" + excldRsnWord);
			$("#span_single_" + treaty + "_fkExcldRsn").hide();
			$("#span_multi_" + treaty + "_fkExcldRsn").hide();
			
			if (isDefaultNotTreaty == "true") {
				$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("disabled", true);
				if (excldRsn != "") {
					if (excldRsn != $("#" + treaty + "noReachThresholdExcldRsn").val()) {
						$("#span_single_" + treaty + "_fkExcldRsn").show();
					}
				}
			} else {
				$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("disabled", false);
				$("#span_multi_" + treaty + "_fkExcldRsn").show();
			}
			
			if (isDefaultNotTreatyModifyRsn == "true") {
				$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("disabled", true);
			}
			
			if (excldRsn == $("#" + treaty + "otherNotOpenExcldRsn").val()) {
				$("#span_" + treaty + "_GPAotherNotOpenExcldRsn").show();
			} else {
				$("#span_" + treaty + "_GPAotherNotOpenExcldRsn").hide();
			}
		} else if (treatyIsApplied == "Y") {
			$("#span_" + treaty + "_isApplied2").hide();
			$("#" + treaty + "_error_msg_div").show();
			$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("checked", true);
			if (isDefaultYesTreaty == "true") {
				$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("disabled", true);
			} else {
				$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("disabled", false);
			}
			if (isDefaultNotTreatyModifyApplied == "true") {
				if (treaty == "GPA") {
					$("#" + treaty + "_error_msg_div").html("適用GPA第15條之限制性招標，勿以公告方式徵求供應商，以免造成誤解。");
				} else if (treaty == "GPA2" || treaty == "ASTEP") {
					$("#" + treaty + "_error_msg_div").html("適用GPA第13條之限制性招標，勿以公告方式徵求供應商，以免造成誤解。");
				}
			} else {
				$("#" + treaty + "_error_msg_div").html("");
			}
			if (isShowAgreementLaw == "true") {
				$("#span_" + treaty + "_isApplied").show();
				if (typeof (a.treatyList) != 'undefined' && typeof (a.treatyList[i].lawStr) != 'undefined') {
					// 20210804 資安風險修正
					$("#span_" + treaty + "_law").html($('<div>').text(a.treatyList[i].lawStr).html());
				}
			} else {
				$("#span_" + treaty + "_isApplied").hide();
			}
		} else {
			$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("disabled", true);
			$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("disabled", true);
		}
		$("#hidden_" + treaty + "_isChanged").val("N");
		
		if (isShowPropertyItemList == "true") {
			$("#" + treaty + "OpenPropertyBlockDiv").show();
			if (isSameOpen == "true") {
				if (isConverFromGPA == "true") {
					$("#" + treaty + "OpenPropertyItemListDiv").hide();
					$("#" + treaty + "OpenPropertyItemTextDiv").show();
				} else {
					$("#" + treaty + "OpenPropertyItemListDiv").show();
					$("#" + treaty + "OpenPropertyItemTextDiv").hide();
				}
			} else {
				$("#" + treaty + "OpenPropertyItemListDiv").show();
				$("#" + treaty + "OpenPropertyItemTextDiv").hide();
			}
		} else {
			$("#" + treaty + "OpenPropertyBlockDiv").hide();
		}
		
		if (isShowServiceItemList == "true") {
			$("#" + treaty + "OpenServiceBlockDiv").show();
			$("[name^='radio_" + treaty + "_fkOpSerItem']").prop("disabled", false);
			if (isSameOpen == "true") {
				if (isConverFromGPA == "true") {
					$("#" + treaty + "OpenServiceItemList").hide();
					$("#" + treaty + "OpenServiceItemText").show();
				} else {
					$("#" + treaty + "OpenServiceItemList").show();
					$("#" + treaty + "OpenServiceItemText").hide();
				}
			} else {
				if (isConvertToOther == "false") {
					var openSrvValueObj = $("[name^='value_GPA_openSrv_']");
					var compareWith = "GPA";
					if (isEmpty(openSrvValueObj) || openSrvValueObj.length == 0) {
						openSrvValueObj = $("[name^='value_GPA2_openSrv_']");
						compareWith = "GPA2";
					}
					if (isNotEmpty(openSrvValueObj) && $("#" + compareWith + "OpenServiceBlockDiv").css("display") != "none") {
						for (j = 0; j < openSrvValueObj.length; j++) {
							var value = openSrvValueObj[j].value;
							var value2 = $("[name^='value_" + treaty + "_openSrv_'][value='" + value + "']").attr("name");
							if (isNotEmpty(value2)) {
								$("[name^='radio_" + treaty + "_fkOpSerItem'][value='" + value2.replace("value_" + treaty + "_openSrv_", "") + "']").prop("disabled", true);
							}
						}
					}
				}
				$("#" + treaty + "OpenServiceItemList").show();
				$("#" + treaty + "OpenServiceItemText").hide();
			}
		} else {
			$("#" + treaty + "OpenServiceBlockDiv").hide();
		}
		
		if (isConverFromGPA == "true") {
			if (treatyIsApplied == "N") {
				$("#span_" + treaty + "_isApplied2").show();
				$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("checked", true);
				$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("disabled", true);
				$("#span_single_" + treaty + "_fkExcldRsn").show();
				$("#span_multi_" + treaty + "_fkExcldRsn").hide();
			} else if (treatyIsApplied == "Y") {
				$("#span_" + treaty + "_isApplied").show();
				$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("checked", true);
				$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("disabled", true);
				if (isShowAgreementLaw == "true") {
					$("#span_" + treaty + "_isApplied").show();
				} else {
					$("#span_" + treaty + "_isApplied").hide();
				}
			}
		}
		
		if (isShowTreaty == "true" || $("#isCorp").val() == "true") {
			$("#" + treaty + "_BlockDiv").show();
			isShowAll = true;
		} else {
			$("#" + treaty + "_BlockDiv").hide();
		}
	}
	saveExcldReason();
	if(isShowAll){
		//$('tr[id="tr_isApplied"]').show();
		hideTreatyView();
	}else{
		$('tr[id="tr_isApplied"]').hide();
	}
	
	if ($(".blockUI.blockMsg").length > 0) {
		$.unblockUI();
	}
	
	//hideTreatyView();
}

/**
 * 限制性法條2217 當三個條約都隱藏時，隱藏整個欄位
 * 
 * @returns
 */
function hideTreatyView() {
	try {
		var agreementJsonStr = $('#agreementJsonStr').val();
		var agreementList = JSON.parse(agreementJsonStr).agreementList;
		var fkAtmLimitedLaw = $('#fkAtmLimitedLaw').val();
		console.log("hideTreatyView @@");
		// 條約為 2217
		if (fkAtmLimitedLaw != undefined && fkAtmLimitedLaw == 7) {
			var isAllHide = false;
			if (agreementList != undefined && agreementList.length > 0) {
				let treatyCount = 0;
				// 如果有一個條約要顯示就跳出迴圈
				for (let i = 0; i < agreementList.length; i++) {
					console.log(agreementList[i].isNotShow);
					if (agreementList[i].isApplied == 'Y' || $("#isCorp").val() == "true") {
						$("#" + agreementList[i].type + "_BlockDiv").hide();
						// isAllHide = false;
						// break;
						treatyCount++;
					}
				}
				if (treatyCount == agreementList.length) {
					isAllHide = true;
				}
			}
			console.log("isAllHide:" + isAllHide);
			if (isAllHide == true) {
				$('tr[id="tr_isApplied"]').hide();
			} else {
				$('tr[id="tr_isApplied"]').show();
			}
		} else {
			$('tr[id="tr_isApplied"]').show();
		}
	} catch (e) {
		// TODO: handle exception
		console.log(e);
	}
}

function getTreatyThreshold() {
	// debugger;
	console.log(arguments);
	console.log("Call getTreatyThreshold");
	var fkTpamHowBid, tenderOrgId, bidstr, criticalDate, targetDate, procurementAmount, fkPmsProctrgCate, cpcCode, fkPmsTenderWay, pccLawCode, type;
	if (arguments.length == 9) {
		fkTpamHowBid = arguments[0];
		tenderOrgId = arguments[1];
		bidstr = arguments[2];
		criticalDate = arguments[3];
		procurementAmount = arguments[4];
		fkPmsProctrgCate = arguments[5];
		cpcCode = arguments[6];
		fkPmsTenderWay = arguments[7];
		pccLawCode = arguments[8];
		type = "award";
	}
	if (arguments.length == 10) {
		fkTpamHowBid = arguments[0];
		tenderOrgId = arguments[1];
		bidstr = arguments[2];
		criticalDate = arguments[3];
		targetDate = arguments[4];
		procurementAmount = arguments[5];
		fkPmsProctrgCate = arguments[6];
		cpcCode = arguments[7];
		fkPmsTenderWay = arguments[8];
		pccLawCode = arguments[9];
		type = "tender";
	}
	if (typeof (criticalDate) == 'undefined' || criticalDate == null  || criticalDate == '' || /\d{3}\/\d{2}\/\d{2}/.test(criticalDate) == false) {
		criticalDate = toTwString(new Date());
	}
	if (typeof (targetDate) == 'undefined' || targetDate == null || targetDate == '' || /\d{3}\/\d{2}\/\d{2}/.test(targetDate) == false) {
		targetDate = toTwString(new Date());
	}
	if (isNotEmpty(fkPmsTenderWay) && ((fkPmsTenderWay != 2 && fkPmsTenderWay != "2") || (fkPmsTenderWay != 12 && fkPmsTenderWay != "12"))) {
		// 判斷條約或協定適用性(fkTpamHowBid,tenderOrgId,bidstr,criticalDate,procurementAmount,fkPmsProctrgCate)
		if (isNotEmpty(fkTpamHowBid) && isNotEmpty(tenderOrgId) 
				&& (fkTpamHowBid != "2" || (fkTpamHowBid == "2" && isNotEmpty(bidstr)))
				&& isNotEmpty(criticalDate) && isNotEmpty(targetDate) 
				&& isNotEmpty(procurementAmount) && isNotEmpty(fkPmsProctrgCate)
				&& isNotEmpty(cpcCode) && isNotEmpty(fkPmsTenderWay)
				&& ((fkPmsTenderWay != "4" && fkPmsTenderWay != "6") || ((fkPmsTenderWay == "4" || fkPmsTenderWay == "6") && isNotEmpty(pccLawCode)))
				&& (($("#input_treaty_fkTpamHowBid").val() != fkTpamHowBid) || ($("#input_treaty_tenderOrgId").val() != tenderOrgId)
						|| (fkTpamHowBid == "2" && $("#input_treaty_bidstr").val() != bidstr)
						|| ($("#input_treaty_criticalDate").val() != criticalDate)
						|| ($("#input_treaty_targetDate").val() != targetDate)
						|| ($("#input_treaty_procurementAmount").val() != procurementAmount)
						|| ($("#input_treaty_fkPmsProctrgCate").val() != fkPmsProctrgCate)
						|| ($("#input_treaty_cpcCode").val() != cpcCode)
						|| ($("#input_treaty_fkPmsTenderWay").val() != fkPmsTenderWay) 
						|| ((fkPmsTenderWay == "4" || fkPmsTenderWay == "6") && $("#input_treaty_pccLawCode").val() != pccLawCode))) {
			// alert("checkTreatyFlagAndThreshold");
			getTreatyFlagAndThreshold(fkTpamHowBid, tenderOrgId, bidstr, criticalDate, targetDate, procurementAmount, fkPmsProctrgCate, cpcCode, fkPmsTenderWay, pccLawCode, type);
		}
		$("#input_treaty_fkTpamHowBid").val(fkTpamHowBid);
		$("#input_treaty_tenderOrgId").val(tenderOrgId);
		$("#input_treaty_bidstr").val(bidstr);
		$("#input_treaty_criticalDate").val(criticalDate);
		$("#input_treaty_targetDate").val(targetDate);
		$("#input_treaty_procurementAmount").val(procurementAmount);
		$("#input_treaty_fkPmsProctrgCate").val(fkPmsProctrgCate);
		$("#input_treaty_cpcCode").val(cpcCode);
		$("#input_treaty_fkPmsTenderWay").val(fkPmsTenderWay);
		$("#input_treaty_pccLawCode").val(pccLawCode);
		saveExcldReason();
	}
}

function saveExcldReason() {
	var obj = {};
	var agreementListArry = [];
	for (var i = 0; i < treatys.length; i++) {
//		console.log("#hidden_" + treatys[i] + "_flag" + $("#hidden_" + treatys[i] + "_flag").val());
//		console.log("#hidden_" + treatys[i] + "_type" + $("#hidden_" + treatys[i] + "_type").val());
//		console.log("#hidden_" + treatys[i] + "_excldRsn" + $("#hidden_" + treatys[i] + "_excldRsn").val());
//		console.log("#hidden_" + treatys[i] + "_openPro" + $("#hidden_" + treatys[i] + "_openPro").val());
//		console.log("#hidden_" + treatys[i] + "_openSrv" + $("#hidden_" + treatys[i] + "_openSrv").val());
//		console.log("#hidden_" + treatys[i] + "_law" + $("#hidden_" + treatys[i] + "_law").val());
//		console.log("#hidden_" + treatys[i] + "_threshold" + $("#hidden_" + treatys[i] + "_threshold").val());
//		console.log("#hidden_" + treatys[i] + "_isApplied:" + $("#hidden_" + treatys[i] + "_isApplied").val());
//		console.log("#hidden_" + treatys[i] + "_isDefaultNotTreaty" + $("#hidden_" + treatys[i] + "_isDefaultNotTreaty").val());
//		console.log("#hidden_" + treatys[i] + "_isDefaultYesTreaty" + $("#hidden_" + treatys[i] + "_isDefaultYesTreaty").val());
//		console.log("#hidden_" + treatys[i] + "_isDefaultNotTreatyModifyRsn" + $("#hidden_" + treatys[i] + "_isDefaultNotTreatyModifyRsn").val());
//		console.log("#hidden_" + treatys[i] + "_isDefaultNotTreatyModifyApplied" + $("#hidden_" + treatys[i] + "_isDefaultNotTreatyModifyApplied").val());
//		console.log("#hidden_" + treatys[i] + "_isShowAgreementLaw" + $("#hidden_" + treatys[i] + "_isShowAgreementLaw").val());
//		console.log("#hidden_" + treatys[i] + "_isConvertToOther" + $("#hidden_" + treatys[i] + "_isConvertToOther").val());
//		console.log("#hidden_" + treatys[i] + "_isConverFromGPA" + $("#hidden_" + treatys[i] + "_isConverFromGPA").val());
//		console.log("#hidden_" + treatys[i] + "_isShowTreaty" + $("#hidden_" + treatys[i] + "_isShowTreaty").val());
//		console.log("#hidden_" + treatys[i] + "_isSameOpen" + $("#hidden_" + treatys[i] + "_isSameOpen").val());
//		console.log("#hidden_" + treatys[i] + "_isShowServiceItemList" + $("#hidden_" + treatys[i] + "_isShowServiceItemList").val());
//		console.log("#hidden_" + treatys[i] + "_isShowPropertyItemList" + $("#hidden_" + treatys[i] + "_isShowPropertyItemList").val());
		if ($("#hidden_" + treatys[i] + "_flag").val() == "C" || $("#hidden_" + treatys[i] + "_flag").val() == "L"
				|| $("#hidden_" + treatys[i] + "_flag").val() == "O" || $("#hidden_" + treatys[i] + "_flag").val() == "Y"
				|| $("#hidden_" + treatys[i] + "_flag").val() == "N") {
			var agreementObj = new AgreementObj($("#hidden_" + treatys[i] + "_flag").val(), $("#hidden_" + treatys[i] + "_type").val()
									, $("#hidden_" + treatys[i] + "_excldRsn").val(), $("#hidden_" + treatys[i] + "_openPro").val()
									, $("#hidden_" + treatys[i] + "_openSrv").val(), $("#hidden_" + treatys[i] + "_law").val()
									, $("#hidden_" + treatys[i] + "_threshold").val(), $("#hidden_" + treatys[i] + "_isApplied").val()
									, $("#hidden_" + treatys[i] + "_isDefaultNotTreaty").val(), $("#hidden_" + treatys[i] + "_isDefaultYesTreaty").val()
									, $("#hidden_" + treatys[i] + "_isDefaultNotTreatyModifyRsn").val(), $("#hidden_" + treatys[i] + "_isDefaultNotTreatyModifyApplied").val()
									, $("#hidden_" + treatys[i] + "_isShowAgreementLaw").val(), $("#hidden_" + treatys[i] + "_isConvertToOther").val()
									, $("#hidden_" + treatys[i] + "_isConverFromGPA").val(), $("#hidden_" + treatys[i] + "_isShowTreaty").val()
									, $("#hidden_" + treatys[i] + "_isSameOpen").val(), $("#hidden_" + treatys[i] + "_isShowServiceItemList").val()
									, $("#hidden_" + treatys[i] + "_isShowPropertyItemList").val(), $("#hidden_" + treatys[i] + "_isNotShow").val());
			agreementListArry.push(agreementObj);
		}
	}
	obj.agreementList = agreementListArry;
	$("#input_treaty_json").val(JSON.stringify(obj));
	processTreatPurc();
}

function selectOpProItem(openPro, treaty, isCloseBlockui) {
	$("#hidden_" + treaty + "_openPro").val(openPro);
	if (treaty == "GPA2") {
		$("#hidden_GPA_openPro").val(openPro);
	}
	checkOpProItem(treaty);
	getExcldReasonTable(treaty, false);
	if (isCloseBlockui) {
		$.unblockUI();
	}
	saveExcldReason();
}

function selectOpSerItem(openSrv, treaty) {
	$("#hidden_" + treaty + "_openSrv").val(openSrv);
	if (treaty == "GPA2") {
		$("#hidden_GPA_openSrv").val(openSrv);
	}
	$("[name='radio_" + treaty + "_fkOpSerItem'][value='" + openSrv + "']").prop("checked", true);
	getExcldReasonTable(treaty, false);
	
	var word = $("#value_" + treaty + "_openSrv_" + openSrv).val();
	// 20210804 資安風險修正
	$("#" + treaty + "OpenServiceItemText").html($('<div>').text(word).html());
	saveExcldReason();
	
	if (treaty == "ASTEP") {
		treatyLoadingNoAutoClose();
		getTreatyFromGpa("GPA"); 
	} 
//	else {
//		$("#hidden_" + treaty + "_isOpenSrvChanged").val("Y");		
//	}
	
//	if (treaty == "GPA2") {
//		$("#hidden_ASTEP_isOpenSrvChanged").val("Y");
//	}
}

function setTreatPurc(isApplied, excldRsn, excldRsnWord, isDefaultYesTreaty, isDefaultNotTreaty, isDefaultNotTreatyModifyRsn, isDefaultNotTreatyModifyApplied, treaty, isRunConvert) {
//	debugger;
//	console.log("-=-=-");
//	console.log("isApplied:" + isApplied);
//	console.log("excldRsn:" + excldRsn);
//	console.log("excldRsnWord:" + excldRsnWord);
//	console.log("isDefaultYesTreaty:" + isDefaultYesTreaty);
//	console.log("isDefaultNotTreaty:" + isDefaultNotTreaty);
//	console.log("isDefaultNotTreatyModifyRsn:" + isDefaultNotTreatyModifyRsn);
//	console.log("isDefaultNotTreatyModifyApplied:" + isDefaultNotTreatyModifyApplied);
//	console.log("treaty:" + treaty);
//	console.log("isRunConvert:" + isRunConvert);
//	console.log("-=-=-");
	// 20210806 資安風險修正
	excldRsn = $('<div>').text(excldRsn).html();
	// 20210806 資安風險修正
	excldRsnWord = $('<div>').text(excldRsnWord).html();
	// 20210806 資安風險修正
	treaty = $('<div>').text(treaty).html();
	// 20210806 資安風險修正
	var treatyWord = $('<div>').text(getTreatyWord(treaty)).html();
	$("#hidden_" + treaty + "_isApplied").val(isApplied);
	$("#hidden_" + treaty + "_isDefaultNotTreaty").val(isDefaultNotTreaty);
	
	if (treaty == "GPA2") {
		$("#hidden_GPA_isApplied").val(isApplied);
	}
	$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("disabled", false);
	$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("disabled", false);
	$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("checked", false);
	$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("checked", false);
	$("#span_" + treaty + "_isApplied").hide();
	$("#span_" + treaty + "_isApplied2").hide();
	$("#span_single_" + treaty + "_fkExcldRsn").hide();
	$("#span_multi_" + treaty + "_fkExcldRsn").hide();
	
	if (isApplied == "N") {
		$("#" + treaty + "_error_msg_div").hide();
		$("#span_" + treaty + "_isApplied2").show();
		$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("checked", true);
		$("#hidden_" + treaty + "_excldRsn").val(excldRsn);
		$("#hidden_" + treaty + "_excldRsnWord").val(excldRsnWord);
		if (treaty == "GPA2") {
			$("#hidden_GPA_excldRsn").val(excldRsn);
		}
		$("#sel_" + treaty + "_fkExcldRsn > option").remove();
		$("#sel_" + treaty + "_fkExcldRsn").append("<option value='" + excldRsn + "'>" + excldRsnWord + "</option>");
		$("#span_single_" + treaty + "_fkExcldRsn").html(treatyWord + "排除理由：" + excldRsnWord);
		if (isDefaultNotTreaty || isDefaultNotTreatyModifyRsn) {
			$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("disabled", true);
			if (isDefaultNotTreatyModifyRsn) {
				if (excldRsn != $("#" + treaty + "noReachThresholdExcldRsn").val()) {
					$("#span_multi_" + treaty + "_fkExcldRsn").show();
				}
			} else {
				if (excldRsn != "") {
					if (excldRsn != $("#" + treaty + "noReachThresholdExcldRsn").val()) {
						$("#span_single_" + treaty + "_fkExcldRsn").show();
					}
				}
			}
		} else {
			if (excldRsn != $("#" + treaty + "noReachThresholdExcldRsn").val()) {
				$("#span_multi_" + treaty + "_fkExcldRsn").show();
			}
		}
		if (excldRsn == $("#" + treaty + "otherNotOpenExcldRsn").val()) {
			$("#span_" + treaty + "_GPAotherNotOpenExcldRsn").show();
		} else {
			$("#span_" + treaty + "_GPAotherNotOpenExcldRsn").hide();
		}
	} else if (isApplied == "Y") {
		$("#" + treaty + "_error_msg_div").show();
		$("#span_" + treaty + "_isApplied").show();
		$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("checked",
				true);
		$("#hidden_" + treaty + "_excldRsn").val("");
		if (treaty == "GPA2") {
			$("#hidden_GPA_excldRsn").val("");
		}
		if (isDefaultYesTreaty) {
			$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("disabled", true);
		}
		if ($("#hidden_" + treaty + "_isShowAgreementLaw").val() == "true") {
			$("#span_" + treaty + "_isApplied").show();
		} else {
			$("#span_" + treaty + "_isApplied").hide();
		}
		if ($("#hidden_" + treaty + "_isDefaultNotTreatyModifyApplied").val() == "true") {
			if (treaty == "GPA") {
				$("#" + treaty + "_error_msg_div").html("適用GPA第15條之限制性招標，勿以公告方式徵求供應商，以免造成誤解。");
			} else if (treaty == "GPA2" || treaty == "ASTEP") {
				$("#" + treaty + "_error_msg_div").html("適用GPA第13條之限制性招標，勿以公告方式徵求供應商，以免造成誤解。");
			}
		} else {
			$("#" + treaty + "_error_msg_div").html("");
		}
	} else {
		$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("disabled", true);
		$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("disabled", true);
	}
	
	if ($("#hidden_" + treaty + "_isConverFromGPA").val() == "true") {
		if (isApplied == "N") {
			$("#span_" + treaty + "_isApplied2").show();
			$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("checked", true);
			$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("disabled", true);
			$("#span_single_" + treaty + "_fkExcldRsn").show();
			$("#span_multi_" + treaty + "_fkExcldRsn").hide();
		} else if (isApplied == "Y") {
			$("#span_" + treaty + "_isApplied").show();
			$("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("checked", true);
			$("[name='radio_" + treaty + "_isApplied'][value='N']").prop("disabled", true);
			if ($("#hidden_" + treaty + "_isShowAgreementLaw").val() == "true") {
				$("#span_" + treaty + "_isApplied").show();
			} else {
				$("#span_" + treaty + "_isApplied").hide();
			}
		}
	}
	
	saveExcldReason();
	if (isRunConvert) {
		getTreatyFromGpa(treaty);
	}
}

function getTreatyFromGpa(treaty) {
	if (treaty == "GPA" || treaty == "GPA2") {
		var queryObj = new TreatyFlagThresholdQueryObj($("#input_treaty_fkTpamHowBid").val(), $("#input_treaty_tenderOrgId").val()
							, $("#input_treaty_bidstr").val(), $("#input_treaty_criticalDate").val()
							, $("#input_treaty_targetDate").val(), $("#input_treaty_procurementAmount").val()
							, $("#input_treaty_fkPmsProctrgCate").val(), $("#input_treaty_cpcCode").val()
							, $("#input_treaty_fkPmsTenderWay").val(), $("#input_treaty_pccLawCode").val()
							, isNotEmpty($("#input_treaty_json").val()) ? $("#input_treaty_json").val() : "", "tender");
		$.ajax({
			type : "POST",
			url : "/tps/treaty/treatyConvert",
			data : {
				jsonString : JSON.stringify(queryObj)
			},
			dataType : 'json',
			success : function(data) {
				var a = data;
				generatePanel(a);
			},
			error : function(jqXHR) {
				alert("發生錯誤: " + jqXHR.status);
			}
		});
	}
}

function checkOpProItem(treaty) {
	// 20210805 資安風險修正
	treaty = $('<div>').text(treaty).html();
	// 20210805 資安風險修正
	var openPro = $('<div>').text($("#hidden_" + treaty + "_openPro").val()).html();
	// 20210805 資安風險修正
	var word = $('<div>').text($("#value_" + treaty + "_openPro_" + openPro).val()).html();
	// 20210805 資安風險修正
	var treatyWord = $('<div>').text(getTreatyWord(treaty)).html();
	$("#" + treaty + "OpenPropertyItemText-1").hide();
	$("#" + treaty + "OpenPropertyItemText-2").hide();
	if (typeof (openPro) == 'undefined' || openPro == '' || openPro == null) {
		$("#" + treaty + "OpenPropertyItemText-1").html("<span style='color:red;font-size:12px'>請選擇</span>");
		$("#" + treaty + "OpenPropertyItemText-1").show();
	} else {
		$("#" + treaty + "OpenPropertyItemTextDiv").html(word);
		if (openPro > 0) {
			$("#" + treaty + "OpenPropertyItemText-1").html("<input type='radio' id='radio_" + treaty + "_fkOpProItem' name='radio_" + treaty + "_fkOpProItem' value='" + openPro + "' checked>" + word);
			$("#" + treaty + "OpenPropertyItemText-1").show();
		} else {
			$("#" + treaty + "OpenPropertyItemText-2").html("<hr width=\"200\" align=\"left\"><input type='radio' id='radio_" + treaty + "_fkOpProItem' name='radio_" + treaty + "_fkOpProItem' value='" + openPro + "' checked>非屬" + treatyWord + "開放財物項目，本案不適用" + treatyWord + "，排除理由為「10.國防部不適用" + treaty + "之財物採購」");
			$("#" + treaty + "OpenPropertyItemText-2").show();
		}
	}
}

function getExcldReasonTable(treaty, isShowTable) {
	// 20210805 資安風險修正
	treaty = $('<div>').text(treaty).html();
	var fkTpamHowBid = $("#input_treaty_fkTpamHowBid").val();
	var tenderOrgId = $("#input_treaty_tenderOrgId").val();
	var bidstr = $("#input_treaty_bidstr").val();
	var criticalDate = $("#input_treaty_criticalDate").val();
	var cpcCode = $("#input_treaty_cpcCode").val();
	var fkPmsProctrgCate = $("#input_treaty_fkPmsProctrgCate").val();
	var pccLawCode = $("#input_treaty_pccLawCode").val();
	var pkDmsOpSerItem = "";
	var excldRsn = $("#hidden_" + treaty + "_excldRsn").val();
	var isApplied = $("#hidden_" + treaty + "_isApplied").val();

	if (isNotEmpty(fkTpamHowBid) && isNotEmpty(tenderOrgId)
			&& (fkTpamHowBid != "2" || (fkTpamHowBid == "2" && isNotEmpty(bidstr)))
			&& isNotEmpty(criticalDate) && isNotEmpty(fkPmsProctrgCate) && isNotEmpty(cpcCode)) {
		
		pccLawCode = isEmpty(pccLawCode) ? "" : pccLawCode;
		pkDmsOpSerItem = (fkPmsProctrgCate == "2" || fkPmsProctrgCate == "3") ? $("#hidden_" + treaty + "_openPro").val() : "";
		pkDmsOpSerItem = isEmpty(pkDmsOpSerItem) ? "" : pkDmsOpSerItem;
		excldRsn = isEmpty(excldRsn) ? "" : excldRsn;
		isApplied = isEmpty(isApplied) ? "" : isApplied;
		
		var queryObj = new TreatyExcludeReasonQueryObj(treaty, fkTpamHowBid, tenderOrgId, bidstr, criticalDate, cpcCode, pccLawCode, pkDmsOpSerItem, isApplied, excldRsn);
		if (isShowTable) {
			treatyLoading();
		}

		$.ajax({
			type : "POST",
			url : "/tps/treaty/queryTreatyExcludeReasons",
			data : {
				jsonString : JSON.stringify(queryObj)
			},
			dataType : 'json',
			success : function(data) {
				var a = data;
			
				if (typeof(a.excludeReasonVoList) != 'undefined' && a.excludeReasonVoList.length > 0) {
					$("#" + treaty + "_ExcludeReasonListTable").children().remove();
					var text = "";
					for (var i = 0; i < a.excludeReasonVoList.length; i++) {
						var trcolor = (i % 2 == 1) ? "#D6FAC5" : "#FFFFFF";
						var purifyExcludeReasonLabel = DOMPurify.sanitize(a.excludeReasonVoList[i].label);
						var purifyExcludeReasonValue = DOMPurify.sanitize(a.excludeReasonVoList[i].value);
						text += "<tr bgcolor=\"" + trcolor + "\" onmouseover=\"treatyovercss(this)\" onmouseout=\"treatyoutcss(this,'" + trcolor + "')\" style=\"background-color:'" + trcolor + "'\" onClick=\"setTreatPurc('N','" + purifyExcludeReasonValue + "', '" + purifyExcludeReasonLabel + "',false,false,false,false,'" + treaty + "',true);$.unblockUI();\">" +
								"	<td align=\"center\" valign=\"middle\" style=\"width: 30px;\">" +
								"		<input type=\"radio\" name=\"" + treaty + "_popup_radio_excldRsn\" value=\"" + purifyExcludeReasonValue + "\">" +
								"	</td>" +
								"	<td>" + 
								"		<span title='flag4UptChgBgColor' style='display:none'></span>" + purifyExcludeReasonLabel + "<input type=\"hidden\" id=\"value_" + treaty + "_excldRsn_" + purifyExcludeReasonValue + "\" name=\"value_" + treaty + "_excldRsn_" + purifyExcludeReasonValue + "\" value=\"" + purifyExcludeReasonLabel + "\">" +
								"	</td>" +
								"</tr>";
					}
					$("#" + treaty + "_ExcludeReasonListTable").append(text);
					
				}
				
				if (isShowTable) {
					var height = Math.floor($(window).height()*0.8);
					var width = Math.floor($(window).width()*0.8);
					var top = Math.floor($(window).height()*0.1);
					var left = Math.floor($(window).width()*0.1);
					$.blockUI({ 
						message: $("#"+treaty+"_excldReason_PopupDiv"), 
						css: {
							left:left,
							top:top,
							margin:'0', 
							width: width ,
							height:height, 
							padding:15,
							overflow:'auto'
						},
						focusInput:false,
						onBlock:function(){
							$("#sel_" + treaty + "_fkExcldRsn").show();
							var isAppliedResult = $("[name='radio_" + treaty + "_isApplied']:checked").val();
							$("#hidden_" + treaty + "_isChanged").val("Y");
							$("[name='" + treaty + "_radio_popup_isApplied']").prop("checked", false);
							$("[name='" + treaty + "_popup_radio_excldRsn']").prop("checked", false);
							
							if ($("[name='radio_" + treaty + "_isApplied'][value='Y']").prop("disabled")) {
								$("[name='" + treaty + "_radio_popup_isApplied']").prop("disabled", true);
							} else {
								$("[name='" + treaty + "_radio_popup_isApplied']").prop("disabled", false);
							}
							if (isAppliedResult == 'Y') {
								$("[name='" + treaty + "_radio_popup_isApplied']").prop("checked",true);
								setTreatPurc(isAppliedResult, "", "", $("#hidden_" + treaty + "_isDefaultYesTreaty").val() == "true", false, $("#hidden_" + treaty + "_isDefaultNotTreatyModifyRsn").val() == "true", $("#hidden_" + treaty + "_isDefaultNotTreatyModifyApplied").val() == "true", treaty, false);
							} else if(isAppliedResult == 'N') {
								// 20210806 資安風險修正
								$("[name='" + treaty + "_popup_radio_excldRsn'][value='" + $('<div>').text($("#hidden_" + treaty + "_excldRsn").val()).html() + "']").prop("checked", true);
								var excldRsnWord = $("#value_" + treaty + "_excldRsn_" + excldRsn).val();
								if (typeof (excldRsnWord) == 'undefined') {
									excldRsnWord = "請選擇";
								}
								console.log("value_" + treaty + "_excldRsn_" + excldRsn);
								setTreatPurc(isAppliedResult, $("#hidden_" + treaty + "_excldRsn").val(), excldRsnWord, $("#hidden_"+treaty+"_isDefaultYesTreaty").val()=="true",$("#hidden_"+treaty+"_isDefaultNotTreaty").val()=="true",$("#hidden_" + treaty + "_isDefaultNotTreatyModifyRsn").val() == "true", $("#hidden_" + treaty + "_isDefaultNotTreatyModifyApplied").val() == "true", treaty, false);
							}
						}
					});
				} else {
					setTreatPurc(a.isApplied, a.excldRsn, a.excldRsnWord, $("#hidden_" + treaty + "_isDefaultYesTreaty").val() == "true", a.isTreatyDefaultNotApplied, $("#hidden_" + treaty + "_isDefaultNotTreatyModifyRsn").val() == "true", $("#hidden_" + treaty + "_isDefaultNotTreatyModifyApplied").val() == "true", treaty, true);
				}
				$("#hidden_"+treaty+"_isDefaultNotTreaty").val(a.isTreatyDefaultNotApplied);
			},
			error : function(jqXHR) {
				alert("發生錯誤: " + jqXHR.status);
			}
		});
	}
}

function showOpeningPropertyItemTable(treaty) {
	treaty = treaty.replace("radio_", "").replace("_fkOpProItem", "");
	var height = Math.floor($(window).height() * 0.8);
	var width = Math.floor($(window).width() * 0.8);
	var top = Math.floor($(window).height() * 0.1);
	var left = Math.floor($(window).width() * 0.1);
	$.blockUI({
		message : $("#" + treaty + "_openPropertyList_PopupDiv"),
		css : {
			left : left,
			top : top,
			margin : '0',
			width : width,
			height : height,
			padding : 15,
			overflow : 'auto'
		},
		focusInput : false,
		onBlock : function() {
			$("[name='popup_" + treaty + "_fkOpProItem']").prop("checked", false);
			// 20210806 資安風險修正
			$("[name='popup_" + treaty + "_fkOpProItem'][value='" + $('<div>').text($("#hidden_" + treaty + "_openPro").val()).html() + "']").prop("checked", true);
		}
	});
}

function getTreatyFlagAndThreshold(fkTpamHowBid, tenderOrgId, bidstr, criticalDate, targetDate, procurementAmount, fkPmsProctrgCate, cpcCode, fkPmsTenderWay, pccLawCode, type) {
	var queryObj = new TreatyFlagThresholdQueryObj(fkTpamHowBid, tenderOrgId, bidstr, criticalDate, targetDate, procurementAmount, fkPmsProctrgCate, cpcCode, fkPmsTenderWay, pccLawCode, isNotEmpty($("#input_treaty_json").val()) ? $("#input_treaty_json").val() : "", type);
	treatyLoading();
	$.ajax({
		type : "POST",
		url : "/tps/treaty/getTreatyFlagAndThreshold",
		data : {
			jsonString : JSON.stringify(queryObj)
		},
		dataType: 'json',
		success : function(data) {
			var a = data;
			for(var i = 0 ; i < a.treatyList.length; i++){
				let purifyType = DOMPurify.sanitize(a.agreementList[i].type);
				let purifyFlag = DOMPurify.sanitize(a.agreementList[i].flag);
				let purifyThreshold = DOMPurify.sanitize(a.agreementList[i].threshold);
				let purifyIsShowServiceItemList = DOMPurify.sanitize(a.agreementList[i].isShowServiceItemList);
				let purifyIsShowPropertyItemList = DOMPurify.sanitize(a.agreementList[i].isShowPropertyItemList);
				var treatyWord = getTreatyWord(purifyType);
				if (fkTpamHowBid == 1 || fkTpamHowBid == 3) {
					$("#" + purifyType + "organizationTitleSpan").html("機關");
				} else if(fkTpamHowBid==2) {
					$("#" + purifyType + "organizationTitleSpan").html("洽辦機關");
				}
				
				if (purifyFlag == "C" || purifyFlag == "L" || purifyFlag == "O" || purifyFlag == "Y") {
					$("#" + purifyType + "FlagDiv").html("屬於我國簽署" + treatyWord + "承諾市場開放清單之適用機關<br><table cellpadding='0' cellspacing='1' border='0'><tr><td valign='top' class='newstop'>本年度門檻金額為</td><td class='newstop'><span title='flag4UptChgBgColor' style='display:none'></span>" + displayCurrency(purifyThreshold) + "元<br>" + toChineseNumber(purifyThreshold.toString(), "<span style='color:red'>", "</span>") + "元</td></tr></table>");
				} else {
					$("#" + purifyType + "FlagDiv").html("不屬於我國簽署" + treatyWord + "承諾市場開放清單之適用機關");
				}
				
				if (purifyIsShowServiceItemList == "true") {
					$("#" + purifyType + "OpenServiceItemList").html("");
					var text = "";
					var count = 0;
					for (var j = 0 ; j < a.treatyList[i].openItemList.length ; j++) {
						let purifyOpenItemListValue = DOMPurify.sanitize(a.treatyList[i].openItemList[j].value);
						let purifyOpenItemListLabel = DOMPurify.sanitize(a.treatyList[i].openItemList[j].label);
						let purifyOpenItemListSn = DOMPurify.sanitize(a.treatyList[i].openItemList[j].sn);
						if (j == a.treatyList[i].openItemList.length - 1) {
							text += "<hr width=\"200\"  align=\"left\">";
						}
						text += "<input type=\"radio\" name=\"radio_" + purifyType + "_fkOpSerItem\" value=\"" + purifyOpenItemListValue + "\"  onClick=\"selectOpSerItem('" + purifyOpenItemListValue + "','" + purifyType + "')\" ";
						if ($("#hidden_" + purifyType + "_openSrv").val() != "" && purifyOpenItemListValue == $("#hidden_" + purifyType + "_openSrv").val()){
							text += " checked ";
						}
						text += " > <input type=\"hidden\" id=\"value_" + purifyType + "_openSrv_" + purifyOpenItemListValue + "\" name=\"value_" + purifyType + "_openSrv_"+purifyOpenItemListValue + "\" value=\"" + purifyOpenItemListSn + purifyOpenItemListLabel + "\">" + purifyOpenItemListSn + purifyOpenItemListLabel + "<br>";
					}
					$("#" + purifyType + "OpenServiceItemList").html(text);
				}
				
				if(purifyIsShowPropertyItemList == "true"){
					$("#"+purifyType+"OpenPropertyItemList").html("");
					var text = "";
					for(var j=0;j<a.treatyList[i].openItemList.length;j++){
						let purifyOpenItemListValue = DOMPurify.sanitize(a.treatyList[i].openItemList[j].value);
						let purifyOpenItemListLabel = DOMPurify.sanitize(a.treatyList[i].openItemList[j].label);
						let purifyOpenItemListSn = DOMPurify.sanitize(a.treatyList[i].openItemList[j].sn);
						var trcolor = "#FFFFFF";
						if(j%2==1){
							trcolor = "#D6FAC5";
						}
						text += "<tr bgcolor=\""+trcolor+"\" onmouseover=\"treatyovercss(this)\" onmouseout=\"treatyoutcss(this,'"+trcolor+"')\" style=\"background-color:'"+trcolor+"'\" onClick=\"selectOpProItem('"+purifyOpenItemListValue+"','"+purifyType+"',true)\">"+
								"	<td align=\"center\" valign=\"middle\" style=\"width: 30px;\"><input type=\"radio\" name=\"popup_"+purifyType+"_fkOpProItem\" value=\""+purifyOpenItemListValue+"\" ";
						if(purifyOpenItemListValue!="" && purifyOpenItemListValue==$("#hidden_"+purifyType+"_openPro").val()){
							text += " checked ";
						}
						text += "	></td>"+
								"	<td style=\"width: 120px;\" align=\"center\"><span title='flag4UptChgBgColor' style='display:none'></span>"+purifyOpenItemListSn+"</td>"+
								"	<td style=\"width: 600px;\">"+purifyOpenItemListLabel+"<input type=\"hidden\" id=\"value_"+purifyType+"_openPro_"+purifyOpenItemListValue+"\" name=\"value_"+purifyType+"_openPro_"+purifyOpenItemListValue+"\" value=\""+purifyOpenItemListSn+purifyOpenItemListLabel+"\"></td>"+
								"	</td>"+
								"</tr>";
					}
					$("#"+purifyType+"OpenPropertyItemList").html(text);
				}
			}
			generatePanel(a);
			saveExcldReason();
//			$.unblockUI();
			$('body').css('overflow', 'auto'); // 讓本體的捲軸恢復。
		},
		error : function(jqXHR) {
			alert("發生錯誤: " + jqXHR.status);
		}
	});
}

//Dwr Object
function AgreementObj(flag, type, excldRsn, openPro, openSrv, law, threshold, isApplied, isDefaultNotTreaty, isDefaultYesTreaty, isDefaultNotTreatyModifyRsn, isDefaultNotTreatyModifyApplied, isShowAgreementLaw, isConvertToOther, isConverFromGPA, isShowTreaty, isSameOpen, isShowServiceItemList, isShowPropertyItemList, isNotShow) {
	this.flag = flag;
	this.type = type;
	this.excldRsn = excldRsn;
	this.openPro = openPro;
	this.openSrv = openSrv;
	this.law = law;
	this.threshold = threshold;
	this.isApplied = isApplied;
	this.isDefaultNotTreaty = isDefaultNotTreaty;
	this.isDefaultYesTreaty = isDefaultYesTreaty;
	this.isDefaultNotTreatyModifyRsn = isDefaultNotTreatyModifyRsn;
	this.isDefaultNotTreatyModifyApplied = isDefaultNotTreatyModifyApplied;
	this.isShowAgreementLaw = isShowAgreementLaw;
	this.isConvertToOther = isConvertToOther;
	this.isConverFromGPA = isConverFromGPA;
	this.isShowTreaty = isShowTreaty;
	this.isSameOpen = isSameOpen;
	this.isShowServiceItemList = isShowServiceItemList;
	this.isShowPropertyItemList = isShowPropertyItemList;
	this.isNotShow = isNotShow;
}

function TreatyFlagThresholdQueryObj(fkTpamHowBid, tenderOrgId, bidstr, criticalDate, targetDate, procurementAmount, fkPmsProctrgCate, cpcCode, fkPmsTenderWay, pccLawCode, agreementJsonStr, type) {
	this.fkTpamHowBid = fkTpamHowBid;
	this.tenderOrgId = tenderOrgId;
	this.bidstr = bidstr;
	this.criticalDate = criticalDate;
	this.targetDate = targetDate;
	this.procurementAmount = procurementAmount;
	this.fkPmsProctrgCate = fkPmsProctrgCate;
	this.cpcCode = cpcCode;
	this.fkPmsTenderWay = fkPmsTenderWay;
	this.pccLawCode = pccLawCode;
	this.agreementJsonStr = agreementJsonStr;
	this.type = type;
}

function TreatyExcludeReasonQueryObj(type, fkTpamHowBid, tenderOrgId, bidstr, criticalDate, cpcCode, pccLawCode, pkDmsOpSerItem, isApplied, excldRsn) {
	this.type = type;
	this.fkTpamHowBid = fkTpamHowBid;
	this.tenderOrgId = tenderOrgId;
	this.bidstr = bidstr;
	this.criticalDate = criticalDate;
	this.cpcCode = cpcCode;
	this.pccLawCode = pccLawCode;
	this.pkDmsOpSerItem = pkDmsOpSerItem;
	this.isApplied = isApplied;
	this.excldRsn = excldRsn;
}

//commonScript
function toTwString(date) {
	var year = date.getFullYear() - 1911;
	var month = date.getMonth();
	var day = date.getDate();
	if (year < 100) {
		year = "0" + year;
	}
	if (month < 9) {
		month = "0" + (month + 1);
	} else {
		month = month + 1;
	}
	if (day < 10) {
		day = "0" + day;
	}
	return year + "/" + month + "/" + day;
}

function treatyLoading() {
	if ($('#treaty_show').length == 0) {
		$("body").append("<div id='treaty_show' style='display:none;'></div>");
	}
	if(arguments.length == 3) {
		$.blockUI({ message: $('#treaty_show'), css: {padding:'0px', overflow:'hidden' }, timeout: 2000, fadeIn: 500, fadeOut: 0 });
		$('#treaty_show').html(arguments[0]);
		height = Math.floor(arguments[1] + 10);
		width = Math.floor(arguments[2] + 10);
	} else if(arguments.length == 4) {
		var time = arguments[3];
		$.blockUI({ message: $('#treaty_show'), css: {padding:'5px', overflow:'scroll' }, fadeIn: 500, fadeOut: 0 });
		$('#treaty_show').html(arguments[0]);
		height = Math.floor(arguments[1] + 10);
		width = Math.floor(arguments[2] + 10);
	} else {
		$.blockUI({ message: $('#treaty_show'), css: {padding:'0px', overflow:'hidden' }, timeout: 2000, fadeIn: 500, fadeOut: 0 });
		$('#treaty_show').html("<img id='loading_img' src='/tps/images/ajax-loader.gif'>");
		height = Math.floor(40);
		width = Math.floor(40);
	}
	var top = Math.floor(($(window).height()-height) * 0.5);
	var left = Math.floor(($(window).width()-width) * 0.5);
	//2020.09.11 cavin 移除blockPage的css  
	//blockPage 內容  min-height: 120px;
	$(".blockUI.blockMsg").removeClass("blockPage");
	$('.blockUI.blockMsg').css("width", width);
	$('.blockUI.blockMsg').css("height", height);
	$('.blockUI.blockMsg').css("left", left);
	$('.blockUI.blockMsg').css("top", top);
	document.body.style.overflowY = "auto";
}

function treatyovercss(obj) {
	obj.style.backgroundColor = "#FFDBA6";
	obj.style.color = "#FF0000";
}

function treatyoutcss(obj, color) {
	obj.style.backgroundColor = color;
	obj.style.color = "#000000";
}

function isNotEmpty(obj) {
	if (typeof (obj) != 'undefined' && obj != null && obj != '') {
		return true;
	}
	return false;
}

function isEmpty(obj) {
	if (typeof (obj) != 'undefined' && obj != null && obj != '') {
		return false;
	}
	return true;
}

function getTreatyWord(treaty) {
	if (treaty == "GPA" || treaty == "GPA2") {
		return "WTO政府採購協定";
	}
	if (treaty == "ANZTEC") {
		return "臺紐經濟合作協定";
	}
	if (treaty == "ASTEP") {
		return "臺星經濟夥伴協定";
	}
	return "";
}

function getTreatyColumnName(treaty) {
	if (treaty == "GPA" || treaty == "GPA2") {
		treaty = "GPA";
	}
	return "是否適用" + getTreatyWord(treaty) + "(" + treaty + ")";
}

function processTreatPurc() {
	$("#agreementJsonStr").val($("#input_treaty_json").val());
	/*
	if(isShowCpcCheckBlockUI){
		isShowCpcCheckBlockUI=false;
		setTimeout("showCpcCheckBlockUI()",5000);
	}
	if(isShowCpcCheckProcurementBlockUI){
		isShowCpcCheckProcurementBlockUI=false
		setTimeout("showCpcCheckProcurementBlockUI()",5000);
	}
	 */
	showTreatPurc();
}

function showTreatPurc() {
	var treatPurc = "N";
	try {
		var a = JSON.parse($("#agreementJsonStr").val());
		for (var i = 0; i < a.agreementList.length; i++) {
			// 20210805 資安風險修正
			var treaty = $('<div>').text(a.agreementList[i].type).html();
			if (treaty == "GPA2" || treaty == "ASTEP") {
				if (a.agreementList[i].isApplied == "Y") {
					treatPurc = "Y";
				}
			}
			$("#div_predict_" + treaty + "_warning").hide();
			if (isNotEmpty($("#isAppliedPredict" + treaty).val())) {
				if ($("#isAppliedPredict" + treaty).val() != a.agreementList[i].isApplied) {
					var answer = "";
					if ($("#isAppliedPredict" + treaty).val() == "Y") {
						answer = "是";
					}
					if ($("#isAppliedPredict" + treaty).val() == "N") {
						answer = "否";
					}
					$("#div_predict_" + treaty + "_warning").html("政府採購預告之「" + getTreatyColumnName(treaty) + "」選取為「" + answer + "」<br>");
					$("#div_predict_" + treaty + "_warning").show();
				}
			}
		}
		if (treatPurc == "Y") {
			$("#tr_isEauction").show();
			$("#tr_isCommercial").show();
			$("#tr_isInviteCertainVendor").show();
			$("#tr_isTure").show(); // 後續邀標才會顯示
		} else {
			$("#tr_isEauction").hide();
			$("#tr_isCommercial").hide();
			$("#tr_isInviteCertainVendor").hide();
			$("#tr_isTure").hide();
		}
	} catch (e) {
		// TODO: handle exception
		console.log(e);
	}
}

function treatyLoadingNoAutoClose(){
	$.blockUI({ message: $('#treaty_show'), css: {padding:'0px', overflow:'hidden' }, fadeIn: 500, fadeOut: 0 });
	$('#treaty_show').html("<img id='loading_img' src='/tps/images/ajax-loader.gif'>");
	height = Math.floor(40);
	width = Math.floor(40);
	var top = Math.floor(($(window).height()-height) * 0.5);
	var left = Math.floor(($(window).width()-width) * 0.5);
	//2020.09.11 cavin 移除blockPage的css  
	//blockPage 內容  min-height: 120px;
	$(".blockUI.blockMsg").removeClass("blockPage");
	$('.blockUI.blockMsg').css("width", width);
	$('.blockUI.blockMsg').css("height", height);
	$('.blockUI.blockMsg').css("left", left);
	$('.blockUI.blockMsg').css("top", top);
	document.body.style.overflowY = "auto";
}