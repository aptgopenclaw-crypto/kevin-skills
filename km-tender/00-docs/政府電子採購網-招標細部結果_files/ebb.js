/**
 * 線上繳納押標金共用函數
 */
'use strict';

const imageType = /image.*/;
let rtnFormData = new FormData();
const hereContextRoot = "/qdcs"; // $("#contextRoot").val() ? $("#contextRoot").val() : getContextRoot();
let startRenderForm;

function setRtnFormData(field, val, append) {

	if (!val || !append) {
		rtnFormData.delete(field);
	}
	if (val) {
		rtnFormData.append(field, val);
	}

}

function setRtnBankbook(file, e) {

	if (file) {
		const limitSize = 300;
		if (file.type.match(imageType) && file.name && file.size < (limitSize * 1024)) {
			jsSetElVal("rtnBankbookId", "");
			jsSetElVal("imgDragName", file.name);
			setRtnFormData("rtnBankbook", file);
			$("#delBankbook").show();
			return;
		} else {
			alert("只能上傳圖片格式檔案並且檔案大小不超過【" + limitSize + "】kb");
		}
	}

	resetRtnBankBook();
	if (e) {
		e.preventDefault();
	}

}

function resetRtnFormData() {
	setRtnFormData("rtnBankId", null);
	setRtnFormData("rtnBankAccount", null);
	setRtnFormData("rtnAccountName", null);
	resetRtnBankBook();
}

function resetRtnBankBook() {

	jsSetElVal("rtnBankbookId", "");
	jsSetElVal("imgDragName", "");
	jsSetElVal("rtnBankbook", "");
	// jsGetById("rtnBankbook").value = "";
	setRtnFormData("rtnBankbook", null);
	$("#delBankbook").hide();
}

function htmlEncode(value) {
	return $('<div/>').text(value).html();
}

function getContextRoot() {

	let base = htmlEncode(document.URL);
	if (base) {
		base = base.substring(base.indexOf("//") + 2);
		base = base.substring(base.indexOf("/"));
		base = base.substring(0, base.indexOf("/", 1));
		return base;
	}

	return "";

}

function jsGetById(elId) {
	return document.getElementById(elId);
}

function jsAddEvent(elId, evtName, func) {
	const el = jsGetById(elId);
	if (el) {
		el.addEventListener(evtName, func);
	}
}

function jsSetElVal(elId, val) {
	const el = jsGetById(elId);
	if (el && el.tagName) {
		const tagName = el.tagName.toUpperCase();
		if (tagName === 'INPUT') {
			el.value = val;
		} else if (tagName === 'DIV' || tagName === 'SPAN') {
			el.innerText = val;
		}
	}
}

function getEbbInputForm(containerId, pkPmsMain, isNation, suppNo) {

	const urlElement = [hereContextRoot, "eqm", "ebb", "query", "supplier", "input"];
	const url = urlElement.join("/");
	$.ajax({
		url: url,
		type: "POST",
		cache: false,
		data: {
			'pkPmsMain': pkPmsMain,
			'isNation': isNation,
			'suppNo': suppNo
		},
		beforeSend: () => {
			$("#divBidBondForm").remove();
		}
	}).done((html) => {

		const container = document.getElementById(containerId);
		if (container) {
			const innerDiv = document.createElement("div");
			innerDiv.innerHTML = html;
			container.appendChild(innerDiv);
			startRenderForm = performance.now();
			window.requestAnimationFrame(initEbbFormAndEvent);
		}

	}).always(() => {
	});

}

function initEbbFormAndEvent(t) {

	const svgDel = document.getElementById("bid_free1");
	if (!svgDel) {
		if (t - startRenderForm > 3600) {
			return;
		} else {
			window.requestAnimationFrame(initEbbFormAndEvent);
		}
	}

	if (typeof convertHwToHtml === 'function') {
		convertHwToHtml(["tenderName"]);
	} else if (typeof replacePageCodeWithHardWordImg === 'function') {
		replacePageCodeWithHardWordImg($("#tenderNameHwSpan"));
	}

	$("#efcsTxnAmount").keydown(function(e) {
		return isNumber(e);
	});

	if ($("#rtnBankId").length>0) {

		const rtnBankbook = $('<input/>').attr('type', 'file').attr('name', 'rtnBankbook').attr('id', 'rtnBankbook').attr("accept", "image/png, image/gif, image/jpeg").attr("value", "");
		rtnBankbook.hide();
		$("#imgDragDiv").append(rtnBankbook);

		$("#rtnBankId,#rtnBankAccount").on("keydown", function(e) {
			return isNumber(e);
		});

		$("#rtnBankId,#rtnBankAccount").on("blur", () => {
			bankbookQuery();
		});

		jsAddEvent("imgDragDiv", "click", (e) => {
			const bankbook = jsGetById("rtnBankbook");
			if (bankbook) {
				jsGetById("rtnBankbook").click();
			}

			e.stopPropagation();
		});

		jsAddEvent("imgDragDiv", "dragover", (e) => e.preventDefault());
		jsAddEvent("imgDragDiv", "drop", (e) => {

			e.stopPropagation();
			e.preventDefault();

			const file = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files[0] : null;
			setRtnBankbook(file, e);

		});

		jsAddEvent("imgDragName", "click", (e) => {

			e.stopPropagation();
			e.preventDefault();

			const imgFile = rtnFormData.get("rtnBankbook");
			if (imgFile) {

				const reader = new FileReader();
				reader.readAsDataURL(imgFile);
				reader.onloadend = () => {
					const imgData = reader.result;

					const popPreview = window.open('', '');
					//popPreview.addEventListener('load', () => {
					const popImg = popPreview.document.createElement("img");
					popImg.src = imgData;
					popImg.alt = imgFile.name;
					popPreview.document.body.append(popImg);
					//}, true);
				};

			}

		});

		jsAddEvent("rtnBankbook", "change", (e) => {
			const file = e.target ? e.target.files[0] : null;
			setRtnBankbook(file, e);
		});

		jsAddEvent("delBankbook", "click", (e) => {
			doDelBankBook(e);
		});

	}
}

function doDelBankBook(e) {
	if (e && e.target) {
		e.stopPropagation();
		e.preventDefault();
	}
	resetRtnBankBook();
}

function confirmBidBond() {

	$.unblockUI();
	const modalHtml = composeModalHtml("", "線上繳納押標金提示",
		"不同廠商勿使用同一轉帳帳戶線上繳納押標金，以免造成政府採購法第50條第1項第5款之重大異常關聯情形",
		"confirmBidBondOk()", null);
	$.blockUI({
		message: modalHtml
	});

}

function fileUploadWarn() {

	$.unblockUI();
	const modalHtml = composeModalHtml("divFileUploadWarning", "單據傳輸提示",
		"繳納押標金之單據傳輸，一次僅可上傳一個檔案(但不限次)，傳輸完成後，無法再刪除，上傳前請確認。<br>傳輸之檔案應為<span class='yellow_warn' style='font-size:1.1em'>完成繳納之證明</span>，請勿傳輸支票、匯票等掃描影像檔", "chooseReceiptFile()", null);
	$.blockUI({
		message: modalHtml
	});

}

function confirmBidBondOk() {

	if ($("#directPayN").length > 0) {
		$("#directPayN").prop("checked", true);
	}

	$("#efcsTxnAmount").val("");
	/*
	$("#efcsTxnAmount").keydown(function(e) {
	  return isNumber(e);
	});*/
	$("#efcsBan").prop("maxlength", "10");
	clearErr("efcsTxnAmount");
	clearErr("efcsBan");
	resetRtnFormData();

	// calculate screen size
	const width = 640;
	const height = 550;
	const screenW = $(window).width();
	const screenH = $(window).height();
	const left = (screenW - width) / 2;
	const top = 20;

	if (screenW < width || screenH < height) {
		const modalHtml = composeModalHtml("", "螢幕解析度過低", "注意！您目前的螢幕解析度過小可能無法正常顯示繳納畫面，建議使用1024x768或更高。",
			"toBidBondForm(" + top + "," + left + "," + width + ")", null);
		$.blockUI({ message: modalHtml });

	} else {
		toBidBondForm(top, left, width);
	}

}

function toBidBondForm(top, left, width) {

	$.blockUI({
		message: $("#divBidBondForm"),
		css: {
			'width': '40vw',
			'padding': '0px',
			'top': '10vh',
			'left': '30vw',
			'height': '75vh',
			'min-width': '30em',
			'overflow-y': 'scroll',
			'border': '1px thin',
			'border-radius': '.2em',
			'box-shadow': '0 0 0 1px rgba(0,0,0,.2), 0 1em 2em -1em'
		},
		onBlock: efcsBanQuery
	});

}

function efcsBanQuery() {

	$("#efcsBan").off("blur");
	$("#efcsBan").on('blur', function() {

		const ban = $(this).val();
		if (!ban) {
			bankbookQuery();
			return;
		}

		//清除上次資料
		$("#efcsSuppName").val("");
		$('#branchList').html("").hide();

		$("#divBidBondForm input[id='confirmY']").prop("disabled", true);
		const urlElement = [hereContextRoot, "eqm", "equotation", "0", "get-company", ban];
		$.get({
			url: urlElement.join("/"),
			cache: false,
			beforeSend: function() {
				clearErr("efcsBan");
				generateErr("efcsBan", "以統編查詢廠商公司名稱...");
				$("#efcsSuppName").hide();
			}
		}).done(function(json) {

			clearErr("efcsBan");

			if (json && json.success) {
				if (json.companyList.length > 1) {
					let companyHtml = '<li>';
					for (let index in json.companyList) {
						companyHtml += '<div class="branchRow">';
						companyHtml += '<span class="branchImage"></span>';
						companyHtml += '<span class="branchName" onclick="putBranchName(\'' + json.companyList[index].name + '\', 6)" >';
						companyHtml += json.companyList[index].name;
						companyHtml += "</span>";
						companyHtml += "</div>";
					}
					companyHtml += "</li>";
					$("#efcsBan").addClass("branchDropDown");
					$('#branchList').html(companyHtml).fadeIn();
				} else {
					$("#efcsSuppName").val(json.companyList[0].name).prop("readonly", true).addClass("read_only");
				}
			} else {
				generateErr("efcsBan", "查詢公司資料失敗");
				$("#efcsSuppName").prop("readonly", false).removeClass("read_only");
			}

		}).fail(function() {
			clearErr("efcsBan");
			generateErr("efcsBan", "查詢公司資料發生錯誤");
			$("#efcsSuppName").prop("readonly", false).removeClass("read_only");
		}).always(function() {
			$("#divBidBondForm input[id='confirmY']").prop("disabled", false);
			$("#efcsSuppName").show();
			bankbookQuery();
		});

	})

	$("#efcsBan").trigger("blur");

}

function putBranchName(companyName, tabId) {
	if (tabId == 2) {
		$("#suppNo").removeClass("branchDropDown");
		$('#branchList').html("").hide();
		setAutoFilledField("suppName", companyName);
	} else {
		$("#efcsBan").removeClass("branchDropDown");
		$('#branchList').html("").hide();
		$("#efcsSuppName").val(companyName).prop("readonly", true).addClass("read_only");
	}
}

function toEfcsRegister() {

	let checkErr = false;
	const efcsTxnAmount = $("#efcsTxnAmount").val();
	if ("" == efcsTxnAmount) {
		generateErr("efcsTxnAmount", "必須輸入");
		checkErr = true;
	}

	clearErr("efcsTxnAmount");
	if (!isPositiveInteger(efcsTxnAmount) || parseInt(efcsTxnAmount, 10) <= 0
		|| parseInt(efcsTxnAmount, 10) > 2000000) {
		generateErr("efcsTxnAmount", "請輸入大於0且小於等於200萬之整數");
		checkErr = true;
	}

	clearErr("efcsBan");
	const efcsBan = $("#efcsBan").val();
	if ("" == efcsBan) {
		generateErr("efcsBan", "必須輸入");
		checkErr = true;
	}

	clearErr("efcsSuppName");
	const efcsSuppName = $("#efcsSuppName").val();
	if ("" == efcsSuppName) {
		generateErr("efcsSuppName", "必須輸入");
		checkErr = true;
	}

	if (checkErr) {
		return inputCheckWarn();
	}

	if (!checkRtnFormData()) {
		return;
	}

	const directPay = "true" == $("input[name='directPay']:checked").val();
	if (directPay) {
		getEfcsRegisterRequest(efcsBan, efcsTxnAmount, directPay);
		return;
	}

	if ("Y" === $("#isNationAcct").val()) {
		getCardPayRequest(efcsBan, efcsTxnAmount);
	} else {
		getEfcsRegisterRequest(efcsBan, efcsTxnAmount, directPay);
	}

}

function inputCheckWarn(isRtn) {

	let warnModel;
	if (!isRtn) {
		warnModel = composeModalHtml("inputCheckWarnPop", "押標金繳納資訊不完整",
			"請確認押標金繳納資訊是否填寫正確", "$('#divBidBondForm').unblock()", null);
	} else {
		warnModel = composeModalHtml("inputCheckWarnPop", "押標金退款資訊不完整",
			"請確認押標金退款資訊之帳號資訊與存摺圖片是否填寫正確", "$('#divBidBondForm').unblock()", null);
	}

	$("#divBidBondForm").block({
		message: warnModel
	});
	return false;
}

function bankbookQuery() {

	if ($("#rtnBankId").length > 0) {

		const suppNo = $("#efcsBan").val();
		const rtnBankId = $("#rtnBankId").val();
		const rtnBankAccount = $("#rtnBankAccount").val();

		if (suppNo && rtnBankId && (rtnBankId.length == 7) && rtnBankAccount && rtnBankAccount.length >= 12) {

			const warnModel = composeModalHtml("", "查詢退款帳號",
				"正在查詢是否有已新增過之退款帳號", "$('#divBidBondForm').unblock()", null);
			$("#divBidBondForm").block({
				message: warnModel
			});

			const urlElement = [hereContextRoot, "eqm", "ebb", "query", "supplier", "getReturnBankbook"];
			const url = urlElement.join("/");
			$.ajax({
				url: url,
				type: "POST",
				cache: false,
				data: {
					'suppNo': suppNo,
					'rtnBankId': rtnBankId,
					'rtnBankAccount': rtnBankAccount
				}
			}).done((json) => {

				if (json && json.rtnBankbookId) {
					jsSetElVal("rtnBankbookId", json.rtnBankbookId);
					jsSetElVal("rtnAccountName", json.accountName);
					jsSetElVal("imgDragName", json.fileName);
					setRtnFormData("rtnBankbook", base64ToFile(json.imageData, json.fileName, json.mimeType));
					$("#delBankbook").show();
				}

			}).always(() => {
				$("#divBidBondForm").unblock();
			});

		} else {
			doDelBankBook();
		}
	}
}

function base64ToFile(b64Str, filename, mime) {

	const byteStr = atob(b64Str);
	let n = byteStr.length;
	const u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = byteStr.charCodeAt(n);
	}

	return new File([u8arr], filename, {type:mime});
}

function checkRtnFormData() {

	if ($("#rtnBankId").length > 0) {

		const rtnBankId = $("#rtnBankId").val();
		const rtnBankAccount = $("#rtnBankAccount").val();
		const rtnAccountName = $("#rtnAccountName").val();
		const rtnBankbook = rtnFormData.get("rtnBankbook");
		if (!rtnBankId || !rtnBankAccount || !rtnAccountName || rtnBankId.length != 7 || rtnBankAccount.length < 12
			|| !rtnBankbook) {
			return inputCheckWarn(true);
		}

		setRtnFormData("rtnBankId", rtnBankId);
		setRtnFormData("rtnBankAccount", rtnBankAccount);
		setRtnFormData("rtnAccountName", rtnAccountName);
		setRtnFormData("rtnBankbookId", $("#rtnBankbookId").val());

	}
	return true;
}

function showErrorDialog(errMsg) {

	let html = '<div>';
	html += '<div class="cen4">';
	html += '<div class="title_1">發生錯誤</div>';
	html += '<div class="t_cen">';

	html += '<div style="margin-bottom: 10px">';
	if (errMsg) {
		html += errMsg;
	}
	html += '</div>';

	html += '<div>';
	html += '<input type="button" value="確定"';
	html += ' onClick="$.unblockUI()" ';
	html += '" class="btn_4c2" style="width: 50px; float: none; margin:10px">';
	html += '</div>';

	html += '</div>';

	html += '</div>';
	html += '</div>';

	$.blockUI({
		message: html,
		onOverlayClick: $.unblockUI
	});

}

function getEfcsRegisterRequest(efcsBan, efcsTxnAmount, directPay) {

	const pkPmsMain = $("#efcsPkPmsMain").val();
	if (!pkPmsMain) {
		return;
	}

	if (!checkRtnFormData()) {
		return;
	}

	const modalHtml = composeModalHtml("", "", "正在處理票交所繳費資訊", null, null);
	$.blockUI({
		message: modalHtml
	});

	const urlElement = [hereContextRoot, "eqm", "ebb", "efcs", "register", pkPmsMain];
	const registerUrl = urlElement.join("/");

	$.ajax({
		url: registerUrl,
		type: "POST",
		cache: false,
		data: {
			'efcsTxnAmount': efcsTxnAmount,
			'efcsBan': efcsBan,
			'tenderOrgName': $("#efcsTenderOrgName").val(),
			'tenderCaseNo': $("#efcsTenderCaseNo").val(),
			'tenderName': $("#efcsTenderName").val(),
			'tenderSq': $("#efcsTenderSq").val(),
			'directPay': directPay,
			'pkPmsMain': pkPmsMain
		},
		beforeSend: function() {
		}
	}).done(function(registerRs) {

		$.unblockUI();
		if (!registerRs.success) {
			showErrorDialog(registerRs.errMsg ? registerRs.errMsg : "無法送出繳費請求，請稍後再試，如持續發生錯誤請洽客服專線(0800-080-512)。");
			return;
		}

		const resBody = JSON.parse(registerRs.resJson);
		$("#pagePay").attr("action", resBody.PAGEPAYURL);

		const ebbFormData = new FormData();
		for (const key of rtnFormData.keys()) {
			ebbFormData.append(key, rtnFormData.get(key));
		}

		ebbFormData.append("efcsTxnAmount", resBody.TXNAMOUNT);
		ebbFormData.append("efcsRegisterToken", resBody.REGISTERTOKEN);
		ebbFormData.append("efcsTokenNotAfter", resBody.TOKEN_NOTAFTER);
		ebbFormData.append("efcsBan", efcsBan);
		ebbFormData.append("efcsSuppName", $("#efcsSuppName").val());
		ebbFormData.append("txnNo", registerRs.txnNo);
		ebbFormData.append("additionalDesc", $("#additionalDesc").val());
		ebbFormData.append("efcsBillData", registerRs.efcsBillData);
		ebbFormData.append("directPay", registerRs.directPay);
		ebbFormData.append("pkPmsMain", pkPmsMain);

		const urlElement = [hereContextRoot, "eqm", "ebb", "efcs", "page-pay", pkPmsMain];
		const pagePayUrl = urlElement.join("/");
		$.ajax({
			url: pagePayUrl,
			type: "POST",
			cache: false,
			data: ebbFormData,
			processData: false,
			contentType: false,
			/*
			data: {
			  'efcsTxnAmount' : resBody.TXNAMOUNT,
			  'efcsRegisterToken' : resBody.REGISTERTOKEN,
			  'efcsTokenNotAfter': resBody.TOKEN_NOTAFTER,
			  'efcsBan' : efcsBan,
			  'efcsSuppName' : $("#efcsSuppName").val(),
			  'txnNo' : registerRs.txnNo,
			  'additionalDesc' : $("#additionalDesc").val(),
			  'efcsBillData' : registerRs.efcsBillData,
			  'directPay': registerRs.directPay,
			  'pkPmsMain' : pkPmsMain
			},*/
			beforeSend: function() {
			}
		}).done(function(pagePayRs) {

			$.unblockUI();
			if (!pagePayRs.success) {
				showErrorDialog(pagePayRs.errMsg ? pagePayRs.errMsg : "無法送出繳費請求，請稍後再試，如持續發生錯誤請洽客服專線(0800-080-512)。");
				return;
			}

			$("#pagePay input[name='data']").val(pagePayRs.resJson);
			toEfcsPagePay();

		}).fail(function(jqXHR, textStatus, errorThrown) {
			$.unblockUI();
			showErrorDialog("無法送出繳費請求，請稍後再試，如持續發生錯誤請洽客服專線(0800-080-512)。");
		}).always(function() {
		});

	}).fail(function(jqXHR, textStatus, errorThrown) {
		$.unblockUI();
		showErrorDialog("無法送出繳費請求，請稍後再試，如持續發生錯誤請洽客服專線(0800-080-512)。");
	}).always(function() {
	});

}

function toEfcsPagePay() {

	$("#pagePay input[name='method']").val("");
	confirmPagePayToEfcs();

}

function confirmPagePayToEfcs() {

	const modalHtml = composeModalHtml("", "導向繳費網頁提示", "即將連結到台灣票據交換所之繳費平台進行轉帳繳費",
		"confirmEfcsPagePay()", "confirmBidBondOk()");
	$.blockUI({
		message: modalHtml
	});

}

function confirmEfcsPagePay() {

	const method = $("#pagePay input[name='method']").prop("value");
	const data = $("#pagePay input[name='data']").prop("value");
	let url = $("#pagePay").attr("action");

	const directPay = $("input[name='directPay']:checked").val();
	if (directPay === "false") {
		url += "?";
		url += encodeURI("data=" + data + "&method=" + method);
	}

	window.open(url, '_blank', 'status=yes,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,width=800,height=700, noopener, noreferrer', true);

	$.unblockUI();

}

function getCardPayRequest(efcsBan, efcsTxnAmount) {

	const pkPmsMain = $("#efcsPkPmsMain").val();
	if (!pkPmsMain) {
		return;
	}

	if (!checkRtnFormData()) {
		return;
	}

	const modalHtml = composeModalHtml("", "", "正在處理臺灣銀行繳費資訊", null, null);
	$.blockUI({
		message: modalHtml
	});

	const ebbFormData = new FormData();
	for (const key of rtnFormData.keys()) {
		ebbFormData.append(key, rtnFormData.get(key));
	}

	ebbFormData.append("efcsTxnAmount", efcsTxnAmount);
	ebbFormData.append("efcsBan", efcsBan);
	ebbFormData.append("efcsSuppName", $("#efcsSuppName").val());
	ebbFormData.append("additionalDesc", $("#additionalDesc").val());
	ebbFormData.append("pkPmsMain", pkPmsMain);

	const urlElement = [hereContextRoot, "eqm", "ebb", "cardpay", "request", pkPmsMain];
	const cardPayReqUrl = urlElement.join("/");

	$.ajax({
		url: cardPayReqUrl,
		type: "POST",
		cache: false,
		data: ebbFormData,
		processData: false,
		contentType: false,
		/*
		data: {
			'efcsTxnAmount': efcsTxnAmount,
			'efcsBan': efcsBan,
			'efcsSuppName': $("#efcsSuppName").val(),
			'additionalDesc': $("#additionalDesc").val(),
			'pkPmsMain': pkPmsMain
		}, */
		beforeSend: function() {
		}
	}).done(function(pagePayReq) {

		$.unblockUI();
		try {

			if (pagePayReq.success) {

				const cardPayReqJson = JSON.parse(pagePayReq.resJson);

				$("#cardPay").attr("action", cardPayReqJson.cardPayUrl);
				const cardPayRq = cardPayReqJson.cardPayRq;

				$("#cardPay input[name='CardPayRq']").val(cardPayRq);
				confirmDeposite2Bot();

			} else {
				showErrorDialog(pagePayReq.errMsg ? pagePayReq.errMsg : "發生錯誤：無法送出繳費請求");
			}

		} catch (e) {
			showErrorDialog("發生錯誤：無法送出繳費請求");
		}

	}).fail(function(jqXHR, textStatus, errorThrown) {
		$.unblockUI();
		showErrorDialog("無法送出繳費請求，請稍後再試，如持續發生錯誤請洽客服專線(0800-080-512)。");
	}).always(function() {
	});

}

function confirmDeposite2Bot() {

	const modalHtml = composeModalHtml("", "", "即將連結到臺灣銀行之繳費平台進行轉帳繳費", "confirmBotCardPay()", "confirmBidBondOk()");
	$.blockUI({
		message: modalHtml
	});

}

function confirmBotCardPay() {

	const screenW = $(window).width();
	let newWindowWidth = 1024;
	if (screenW < 1024) {
		newWindowWidth = 800;
	}

	window.open('about:blank', 'cardPayPopUp',
		'status=yes,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,width=' + newWindowWidth + ',height=600', true);
	$("#cardPay").attr("target", "cardPayPopUp");
	$("#cardPay").submit();
	$.unblockUI();

}

function clearErr(elId) {

	if (typeof elId !== "string") {
		if (typeof elId === "object") {
			$(elId).siblings(".red_3_err").remove();
		} else {
			// to be fixed
			appendDebugInfo("unknown object: " + elId);
		}
	} else {
		$("#" + elId).siblings(".red_3_err").remove();
	}

}

function generateErr(elId, msg) {

	clearErr(elId);

	const err = $("<span>");
	err.addClass("red_3_err");
	err.html(msg);

	if (typeof elId !== "string") {
		if (typeof elId === "object") {
			$(elId).parent().append(err);
		} else {
			// to be fixed
			appendDebugInfo("unknown object: " + elId);
		}
	} else {
		$("#" + elId).parent().append(err);
	}

}

function isPositiveInteger(n) {
	return /^\d+$/.test(n);
}

function appendDebugInfo(msg) {
	if (window.console) {
		console.log(msg);
	}
}

//押標金單據上傳
function chooseReceiptFile() {
	$.unblockUI();
	$('#receiptFile').trigger('click');
}

function receiptFileUpload(fkPmsMain) {
	if (!validateFileType()) {
		return;
	}
	if ("" != $("#receiptFile").val()) {
		appendDebugInfo("start uploading...");

		const csrfTkn = $("#eqmQuotationForm input[name='_csrf']").val();
		const csrfParam = "?_csrf=" + encodeURIComponent(csrfTkn);
		const urlElement = [hereContextRoot, "eqm", "ebb", "uploadReceipt", fkPmsMain];
		$("#receiptUploadForm").attr('action', urlElement.join("/") + csrfParam);
		setTimeout(function(){
			window.open(null, 'ReceiptUploadPop', 'status=yes,toolbar=no,menubar=no,popup=yes,location=no,resizable=yes,scrollbars=yes,width=850,height=350', true);
			$("#receiptUploadForm").submit();
			$("#receiptFile").val("");
		}, 500);

	} else {
		appendDebugInfo("no file to be uploaded");
	}
}

function validateFileType() {

	const fileName = $("#receiptFile").val();
	const idxDot = fileName.lastIndexOf(".") + 1;
	const extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
	if (extFile == "exe" || extFile == "com") {
		const modalHtml = composeModalHtml("", "錯誤", "不允許上傳執行檔", null, "");
		$.blockUI({
			message: modalHtml
		});

		$("#receiptFile").val("");  // Reset the input so no files are uploaded
		return false;
	}
	return true;
}

function printBySuppNo(pkEqmMain, suppNo) {

	const pkPmsMain = $("[name=pkPmsMain]").prop("value");
	if (!suppNo) {
		suppNo = "@";
	}
	const urlElement = [hereContextRoot, "eqm", "ebb", "view-detail", "supplier", pkPmsMain, pkEqmMain, suppNo];
	const url = urlElement.join("/");

	window
		.open(
			url,
			'_blank',
			'status=yes,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,width=850,height=700, noopener, noreferrer',
			true);

}

function composeModalHtml(modalId, title, message, confirmFunc, cancelFunc) {

	let html = '<div>';
	if (modalId) {
		html = '<div id="' + modalId + '">';
	}
	html += '<div class="cen4">';
	if (title) {
		html += '<div class="title_1">' + title + '</div>';
	}
	html += '<div class="t_cen">';
	html += '<div style="margin-bottom: 10px">';
	if (message) {
		html += message;
	}
	html += '</div>';
	html += '<div>';

	if (confirmFunc) {
		html += '<input type="button" value="確定"';
		html += ' onClick="' + confirmFunc + '" ';
		html += ' class="btn_4c2 click_cursor" style="width: 50px; float: none; margin:10px">';
	}

	if (cancelFunc !== null) {

		if (cancelFunc) {
			html += '<input type="button" value="取消"';
			html += '  onClick="' + cancelFunc + '" ';
		} else {
			html += '<input type="button" value="關閉"';
			html += '  onClick="$.unblockUI()" ';
		}
		html += ' class="btn_4c2 click_cursor" style="width: 50px; float: none; margin:10px">';

	}

	html += '</div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';

	return html;
}

function isNumber(evt) {

	evt = (evt) ? evt : window.event;
	const charCode = (evt.which) ? evt.which : evt.keyCode;

	if (!!evt.shiftKey) {
		return false;
	}

	if (charCode == 8 || charCode == 46 || charCode == 110 || charCode == 190) {
		// backspace/delete/dot/tab(9)
		return true;
	}

	if (charCode > 34 && charCode < 41) {
		// home/end/up/down/left/right
		return true;
	}

	if (charCode > 47 && charCode < 58) {
		// 0~9
		return true;
	}

	return (charCode > 94 && charCode < 106);

}