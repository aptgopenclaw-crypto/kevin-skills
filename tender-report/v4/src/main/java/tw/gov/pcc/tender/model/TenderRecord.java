package tw.gov.pcc.tender.model;

import lombok.Data;

/**
 * 標案資料（列表頁 + 詳細頁合併）
 */
@Data
public class TenderRecord {

    // ── 列表頁欄位 ──
    private String keyword;       // 搜尋關鍵字
    private String orgName;       // 機關名稱
    private String caseNo;        // 標案案號
    private String tenderName;    // 標案名稱
    private String transmissions; // 傳輸次數
    private String tenderWay;     // 招標方式
    private String procurementType; // 採購性質
    private String announceDate;  // 公告日期
    private String deadline;      // 截止投標
    private String budget;        // 預算金額
    private String detailUrl;     // 詳細頁 URL

    // ── 詳細頁欄位 ──
    private String orgCode;       // 機關代碼
    private String unitName;      // 單位名稱
    private String orgAddress;    // 機關地址
    private String contactPerson; // 聯絡人
    private String contactPhone;  // 聯絡電話
    private String email;         // 電子郵件信箱
    private String targetCategory; // 標的分類
    private String budgetRange;   // 採購金額級距
    private String handleMethod;  // 辦理方式
    private String awardMethod;   // 決標方式
    private String tenderStatus;  // 招標狀態
    private String openTime;      // 開標時間
    private String openPlace;     // 開標地點
    private String hasFloorPrice; // 是否訂有底價
    private String execLocation;  // 履約地點
}
