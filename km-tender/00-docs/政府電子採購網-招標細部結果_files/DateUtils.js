/**
 * 檢核等標期天數(目前僅適用公開招標)
 * 
 * @param seq 以序號判斷第幾次招標
 * @param procurementRange 採購金額級距 未達公告金額:1,公告金額以上未達查核金額:2,查核金額以上未達巨額:3,巨額:4
 * @param isEobtain 是否提供電子領標 是:Y,否:N
 * @param isEsubmit 是否提供電子投標 是:Y,否:N
 * @param isReadBid 是否已辦理公開閱覽 是:Y,否:N
 */
function getWaitingDay(seq, procurementRange, isEobtain, isEsubmit, isReadBid) {
	var Audit = 0;// 等標期下限
	if (seq > 1) {
		if (procurementRange == 1) {
			Audit = 3;
		} else {
			if ("Y" == isEobtain || "Y" == isEsubmit) {
				Audit = 5;
			} else {
				Audit = 7;
			}
		}
	} else {
		switch (procurementRange) {
		case 1:
			Audit = 7;
			break;
		case 2:
			Audit = 14;
			break;
		case 3:
			Audit = 21;
			break;
		case 4:
			Audit = 28;
			break;
		}
		if ("Y" == isEobtain)
			Audit = lessWaitDay(Audit, 3);
		if ("Y" == isEsubmit)
			Audit = lessWaitDay(Audit, 2);
		if ("Y" == isReadBid)
			Audit = lessWaitDay(Audit, 5);
	}
	return Audit;
}
/**
 * 等標期縮短，縮短後不得少於5日
 * 
 * @param num
 * @param minuend
 * @returns
 */
function lessWaitDay(num, minuend) {
	if (!num)
		return 0;
	else if (!minuend)
		return num;
	if (Math.abs(num - minuend) > 5)
		return Math.abs(num - minuend);
	else
		return 5;
}
/**
 * 把西元年換成民國年(日期)
 * 
 * @param date (String 例如: 2020/01/01 或 2020-01-01 或......)
 * @return MinGoDate (String 例如: 109/01/01)
 */
function dateTransMinGo(date) {
	var year, month, day;
	var MinGoDate = "";
	if (date !== null && date !== undefined && !date.replace(/(^s*)|(s*$)/g, "").length == 0) {
		if(date.indexOf('-') > 0) {
			date = date.replace(/-/g, '/');
		}
		var ShiYuanDate = new Date(date);
		year = ShiYuanDate.getFullYear();
		month = ShiYuanDate.getMonth() + 1;
		day = ShiYuanDate.getDate();
		year = year - 1911;
		if(year >= 100){
			year = year;
		}else{
			year = "0" + year;
		}
		if(month >= 10){
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
	return MinGoDate;
}
/**
 * 把西元年換成民國年(日期和時間)
 * 
 * @param date (String 例如: 2020-01-01 17:30)
 * @returns dateTime (String 例如: 109/01/01 17:30)
 */
function dateTimeTransMinGo(date) {
	var dateTime = "";
	if (date.replace(/(^s*)|(s*$)/g, "").length != 0 && date != null) {
		dateTime = date;
		var spdt = SplitDate(dateTime);
		dateTime = (spdt[0] - 1911) + "/" + spdt[1] + "/" + spdt[2] + " "
				+ spdt[3] + ":" + spdt[4];
	}
	return dateTime
}

/**
 * 把民國年換成西元年(日期)
 * 
 * @param date (String 例如: 109/01/01 或 109-01-01 或......)
 * @return ShiYuanDate (String 例如: 2020/01/01)
 */
function dateTransShiYuan(date) {
	var year, month, day;
	var ShiYuanDate = "";
	if(date != null){
		if (!date.replace(/(^s*)|(s*$)/g, "").length == 0) {
			var MinGoDate = date.split("/");
			console.log(MinGoDate);
			year = MinGoDate[0];
			month = MinGoDate[1];
			day = MinGoDate[2];
			var yearInt;
			if (year.length < 4) {
				yearInt = parseInt(year) + 1911;
			} else {
				yearInt = parseInt(year);
			}
			if (month.length > 1) {
				month = month;
			} else {
				month = "0" + month;
			}
			if (day.length > 1) {
				day = day;
			} else {
				day = "0" + day;
			}
			ShiYuanDate = yearInt + "/" + month + "/" + day;
		}
	}
	
	return ShiYuanDate;
}
// 把日期和時間的字串 轉換成陣列
function SplitDate(str) {
	var DateArray = new Array();
	DateArray = str.split(/[ :-]/);// 以 空白 和「:」和「-」來切割字串
	console.log(DateArray);
	return DateArray;
}

// 日期轉字串
function dateToString(date) {
	var dateStr = "";
	var year, month, day;
	year = date.getFullYear();
	month = date.getMonth() + 1;
	day = date.getDate();
	dateStr = year.toString();
	dateStr += (month.toString().length > 1) ? "-" + month : "-0" + month;
	dateStr += (day.toString().length > 1) ? "-" + day : "-0" + day;
	return dateStr;
}

// 檢核公告日是否晚於預設公告日
function checkTargetDay(targetDate, publishDate) {
	var targetValue = dateToString(targetDate);
	var publishValue = dateToString(publishDate);
	var addDay = 0;
	var targetisWorkDay = isWorkDay(CalculateAddDays(targetValue.valueOf(), 1));
	targetisWorkDay == false ? addDay = 3 : addDay = 1;
	if(publishValue.valueOf() == CalculateAddDays(targetValue.valueOf(), addDay)){
		return true;
	}else if(publishValue.valueOf() > targetValue.valueOf()) {
		return false;
	} else {
		return null;
	}
}
/**
 * 是否為工作天 for TpRead
 * 
 * @param date (String 例如: 2020/01/01 或 2020-01-01 或......)
 * @param type (可選參數)(String 例如: 需要檢查假日之開關 bidOpen 或 不傳入參數)
 * @returns 是工作天: true 是假日: false
 */
function isWorkDayForTpRead(date, type = "default") {
	var checkIsWorkDay = null;
	var calendar = new Date(date);
	var dateString = dateToString(calendar);
	console.log("Tp isWorkDay dateString : "+ dateString);
	$.ajax({
		async: false,
		type: "POST",
		url: "/tps/DateUtil/checkIsWorkDay",
	    dataType: "json",
	    data: {
	    	dateString: dateString,
	    	type: type
	    },
	    success: function(data) {
			if(data.error){
				console.log("判斷工作天發生錯誤");
				checkIsWorkDay = null;
				return;
			}
			
	    	var isWorkDay = data.isWorkDay;
	    	var needCheck = data.needCheck;
		    checkIsWorkDay = isWorkDay;
		    
		    console.log("是否為工作天: " + isWorkDay);
		    console.log("是否需檢查不可為例假日 : " + needCheck);
		    
		    if(needCheck){
		    	checkIsWorkDay = isWorkDay;
		    	if(!isWorkDay){
		    		console.log("不可為假日");
		    	}
		    }else{
		    	checkIsWorkDay = true;
		    	if(!isWorkDay){
		    		console.log("不可為假日(練習區不受此檢核限制)");
		    	}
		    }
		},
		error: function(error) {
            console.log("發生錯誤: " + error);
            checkIsWorkDay = null;
		}
	});
	
	return checkIsWorkDay;
}

/**
 * 是否為工作天
 * 
 * @param date (String 例如: 2020/01/01 或 2020-01-01 或......)
 * @returns 是工作天: true 是假日: false
 */
function isWorkDay(date) {
	var checkIsWorkDay = null;
	var calendar = new Date(date);
	var dateString = dateToString(calendar);
	console.log("isWorkDay dateString : "+ dateString);
	$.ajax({
		async: false,
		type: "POST",
		url: "/tps/TenderManagement/new/checkIsWorkDay",
	    dataType: "json",
	    data: {
	    	dateString: dateString
	    },
	    success: function(data) {
	    	var isWorkDay = data.isWorkDay;
		    console.log("是否為工作天 : " + isWorkDay);
		    
		    var needCheck = data.needCheck;
		    console.log("是否需檢查開標不可為例假日 : " + needCheck);
		    
		    if(needCheck){
		    	checkIsWorkDay = data.isWorkDay;
		    	if(!isWorkDay){
		    		console.log("不可為假日");
		    	}
		    }else{
		    	checkIsWorkDay = true;
		    	if(!isWorkDay){
		    		console.log("不可為假日(練習區不受此檢核限制)");
		    	}
		    }
		},
		error: function(res) {
			console.log("發生錯誤: " + res);
		}
	});
	
	return checkIsWorkDay;
}
// 取得公報日期
function getBulletinPublishDate() {
	var cal = new Date();
	var sep = ":";
	var calStr = "";
	calStr = dateToString(cal);
	var newDay;
	var newCal = new Date();
	if (isWorkDay(calStr)) {
		if ((cal.getHours() >= 18)
				|| ((cal.getHours() == 17) && (cal.getMinutes() >= 30))) {
			newDay = addBusinessDate(cal.getTime(), 2);
		} else {
			newDay = addBusinessDate(cal.getTime(), 1);
		}
	} else {
		newDay = addBusinessDate(cal.getTime(), 2);
	}
	newCal.setTime(newDay);
	newCal.setHours(0);
	newCal.setMinutes(0);
	newCal.setSeconds(0);
	newCal.setMilliseconds(0);
	return newCal.getTime();
}
Date.prototype.addDays = function(days) {
	this.setDate(this.getDate() + days);
	return this;
}
// 加工作天
function addBusinessDate(startDate, businessDays) {
	if (startDate == null)
		return null;
	var calendar = new Date();
	calendar.setTime(startDate);
	calendar.setHours(0);
	calendar.setMinutes(0);
	calendar.setSeconds(0);
	calendar.setMilliseconds(0);
	var sign = businessDays < 0 ? -1 : 1;
	businessDays = Math.abs(businessDays);

	var tryCnt = 0;
	for (var i = 0; i < businessDays;) {
		calendar.addDays(sign);
		if (!isWorkDay(calendar.getTime())) {
			tryCnt++;
			if (tryCnt > 10) {
				console.log("can't find workday after 10 tries.");
				break;
			}
		} else {
			tryCnt = 0;
			i++;
		}
	}
	return calendar.getTime();

}

//加天
function CalculateAddDays(startDate, add_Days) {
	if (startDate == null){
		return null;
	}
	if(startDate.toString().indexOf('-') > 0) {
		startDate = startDate.replace(/-/g, '/');
	}
	var calendar = new Date(startDate);
	calendar.addDays(add_Days);
	// calendar.addDays(-1); // 包含本日
	var year,month,day;
	var sysDatStr;
	year = calendar.getFullYear();
	month = calendar.getMonth()+1;
	day = calendar.getDate();
	sysDatStr = year.toString();
	sysDatStr += (month.toString().length>1) ? "-"+month : "-0"+month ;
	sysDatStr += (day.toString().length>1) ? "-"+day : "-0"+day ;
	return sysDatStr;

}

/**
 * 功能：民國年字串轉日期物件 格式：102/12/31
 */
function transChinese2Date(dtDate) {
	var date = new Date();
	date.setFullYear(parseInt(dtDate.substr(0, 3), 10) + 1911); // 年設定
	date.setMonth(parseInt(dtDate.substr(4, 2) - 1, 10)); // 月設定
	date.setDate(parseInt(dtDate.substr(7, 2), 10)); // 日設定
	return date;
}

/**
 * 功能：西元年字串轉日期物件 格式：2020/12/31
 */
function trans2Date(dtDate) {
	var date = new Date();
	date.setYear(parseInt(dtDate.substr(0, 4), 10)); // 年設定
	date.setMonth(parseInt(dtDate.substr(5, 2) - 1, 10)); // 月設定
	date.setDate(parseInt(dtDate.substr(8, 2), 10)); // 日設定
	return date;
}

/**
 * 民國年(日期時間)轉日期
 * @param dtDate
 * @returns
 */
function transChinese2DateTime(dtDate){
	var date = new Date();
	
	date.setFullYear(parseInt(dtDate.substr(0,3),10) + 1911); //年設定	
	date.setMonth(parseInt(dtDate.substr(4,2)-1,10)); //月設定
	date.setDate(parseInt(dtDate.substr(7,2),10)); //日設定
	date.setHours(parseInt(dtDate.substr(10,2),10)); //時設定
	date.setMinutes(parseInt(dtDate.substr(13,2),10)); //分設定
	date.setSeconds(0);
	return date;
}

/**
 * 西元年(日期時間)轉日期
 * @param dtDate
 * @returns
 */
function transShiYuan2DateTime(dtDate){
	var date = new Date();
	
	date.setFullYear(parseInt(dtDate.substr(0,4),10)); //年設定	
	date.setMonth(parseInt(dtDate.substr(5,2)-1,10)); //月設定
	date.setDate(parseInt(dtDate.substr(8,2),10)); //日設定
	date.setHours(parseInt(dtDate.substr(11,2),10)); //時設定
	date.setMinutes(parseInt(dtDate.substr(14,2),10)); //分設定
	date.setSeconds(0);
	return date;
}

/**
 * //日期相差多久
 */
function DateDiff(interval, date1, date2) {
	var part = date2.getTime() - date1.getTime(); //相差毫秒
	switch (interval.toLowerCase()) {
	case "y":
		return parseFloat(date2.getFullYear() - date1.getFullYear());
	case "m":
		return parseFloat((date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth()));
	case "d":
		return parseFloat(part / 1000 / 60 / 60 / 24);
	case "w":
		return parseFloat(part / 1000 / 60 / 60 / 24 / 7);
	case "h":
		return parseFloat(part / 1000 / 60 / 60);
	case "n":
		return parseFloat(part / 1000 / 60);
	case "s":
		return parseFloat(part / 1000);
	case "l":
		return parseFloat(part);
	}
}

/**
 * 取得系統時間
 * @returns string (例:2020/05/01 )
 */
function getSysDate(){
	var sysDate = new Date();
	var year,month,day;
	var sysDatStr;
	year = sysDate.getFullYear();
	month = sysDate.getMonth()+1;
	day = sysDate.getDate();
	sysDatStr = year.toString();
	sysDatStr += (month.toString().length>1) ? "/"+month : "/0"+month ;
	sysDatStr += (day.toString().length>1) ? "/"+day : "/0"+day ;
	return sysDatStr
}

// 加工作天 for Appeal
function addBusinessDateForAppeal(startDate, businessDays) {
	if (startDate == null)
		return null;
	var calendar = new Date();
	calendar.setTime(startDate);
	calendar.setHours(0);
	calendar.setMinutes(0);
	calendar.setSeconds(0);
	calendar.setMilliseconds(0);
	var sign = businessDays < 0 ? -1 : 1;
	businessDays = Math.abs(businessDays);

	var tryCnt = 0;
	for (var i = 0; i < businessDays;) {
		calendar.addDays(sign);
		if (!isWorkDayForAppeal(calendar.getTime())) {
			tryCnt++;
			if (tryCnt > 10) {
				console.log("can't find workday after 10 tries.");
				break;
			}
		} else {
			tryCnt = 0;
			i++;
		}
	}
	return calendar.getTime();

}

/**
 * 是否為工作天 for Appeal
 * *
 *  * @param date (String 例如: 2020/01/01 或 2020-01-01 或......)
 *  * @param type (noticeDate)
 *  * @returns 是工作天: true 是假日: false
 *  */
function isWorkDayForAppeal(date) {
	var checkIsWorkDay = false;
	var calendar = new Date(date);
	var dateString = dateToString(calendar);
	console.log("isWorkDayForAppeal dateString : "+ dateString);
	$.ajax({
		async: false,
		type: "POST",
		url: "/tps/DateUtil/checkIsWorkDay",
		dataType: "json",
		data: {
			dateString: dateString,
			type: "noticeDate"
		},
		success: function(data) {
			if(data.error){
				console.log("判斷工作天發生錯誤");
				return;
			}

			var isWorkDay = data.isWorkDay;
			var needCheck = data.needCheck;
			checkIsWorkDay = isWorkDay;

			console.log("是否為工作天: " + isWorkDay);
			console.log("是否需檢查不可為例假日 : " + needCheck);

			if(needCheck){
				checkIsWorkDay = isWorkDay;
				if(!isWorkDay){
					console.log("不可為假日");
				}
			}else{
				checkIsWorkDay = true;
				if(!isWorkDay){
					console.log("不可為假日(練習區不受此檢核限制)");
				}
			}
		},
		error: function(res) {
			console.log("發生錯誤: " + res);
		}
	});

	return checkIsWorkDay;
}