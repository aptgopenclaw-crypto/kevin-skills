/**
 * 開啟 文件傳輸程式安裝檔 的下載視窗，5秒後自動關閉
 */
var flyingwin;
function installerWindow(url){
	flyingwin = window.open(url,'_blank');
	//5秒鐘後關閉視窗
	setTimeout("windowClose()",5000);
}

function windowClose() {
	flyingwin.close();
	return;
}