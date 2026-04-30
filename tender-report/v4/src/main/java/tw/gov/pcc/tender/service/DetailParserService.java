package tw.gov.pcc.tender.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import tw.gov.pcc.tender.model.TenderRecord;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 詳細頁 HTML 解析器
 * 從政府採購網詳細頁 HTML 中提取結構化資料（同 Python v2 的 detail_parser.py）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DetailParserService {

    /**
     * 解析詳細頁 HTML，將結果寫入 TenderRecord
     */
    public void parseAndFill(String html, TenderRecord record) {
        Map<String, String> fields = parseDetailPage(html);

        record.setOrgCode(fields.getOrDefault("機關代碼", ""));
        record.setOrgName(firstNonEmpty(fields.get("機關名稱"), record.getOrgName()));
        record.setUnitName(fields.getOrDefault("單位名稱", ""));
        record.setOrgAddress(fields.getOrDefault("機關地址", ""));
        record.setContactPerson(fields.getOrDefault("聯絡人", ""));
        record.setContactPhone(fields.getOrDefault("聯絡電話", ""));
        record.setEmail(fields.getOrDefault("電子郵件信箱", ""));
        record.setCaseNo(firstNonEmpty(fields.get("標案案號"), record.getCaseNo()));
        record.setTenderName(firstNonEmpty(fields.get("標案名稱"), record.getTenderName()));
        record.setTargetCategory(fields.getOrDefault("標的分類", ""));
        record.setBudgetRange(fields.getOrDefault("採購金額級距", ""));
        record.setHandleMethod(fields.getOrDefault("辦理方式", ""));
        record.setBudget(firstNonEmpty(fields.get("預算金額"), record.getBudget()));
        record.setTenderWay(firstNonEmpty(fields.get("招標方式"), record.getTenderWay()));
        record.setAwardMethod(fields.getOrDefault("決標方式", ""));
        record.setTenderStatus(fields.getOrDefault("招標狀態", ""));
        record.setAnnounceDate(firstNonEmpty(fields.get("公告日"), record.getAnnounceDate()));
        record.setDeadline(firstNonEmpty(fields.get("截止投標"), record.getDeadline()));
        record.setOpenTime(fields.getOrDefault("開標時間", ""));
        record.setOpenPlace(fields.getOrDefault("開標地點", ""));
        record.setHasFloorPrice(fields.getOrDefault("是否訂有底價", ""));
        record.setExecLocation(fields.getOrDefault("履約地點", ""));
    }

    /**
     * 解析詳細頁 HTML，回傳 key-value map
     */
    Map<String, String> parseDetailPage(String html) {
        Document doc = Jsoup.parse(html);
        Map<String, String> result = new LinkedHashMap<>();

        // 解析各區塊表格
        parseTableSection(doc, "機關資料", result);
        parseTableSection(doc, "採購資料", result);
        parseTableSection(doc, "招標資料", result);
        parseTableSection(doc, "領投開標", result);
        parseTableSection(doc, "其他", result);

        // 用 id 抓特定欄位
        parseById(doc, result);

        return result;
    }

    private void parseTableSection(Document doc, String sectionName, Map<String, String> result) {
        Element table = doc.selectFirst("table[summary=" + sectionName + "]");
        if (table == null) return;

        for (Element row : table.select("tr")) {
            Elements cells = row.select("td");
            if (cells.size() < 2) continue;

            Element labelCell = null;
            Element valueCell = null;

            for (Element cell : cells) {
                String cls = cell.className();
                if (cls.contains("tbg_1") || cls.contains("tbg_4") || cls.contains("tbg_5")
                        || cls.contains("tbg_6") || cls.contains("tbg_7")) {
                    labelCell = cell;
                } else if (cls.contains("tbg_2") || cls.contains("tbg_4R")) {
                    valueCell = cell;
                }
            }

            if (labelCell != null && valueCell != null) {
                String label = cleanText(labelCell.text());
                String value = cleanText(valueCell.text());
                if (!label.isEmpty() && !value.isEmpty()) {
                    result.put(label, value);
                }
            }
        }
    }

    private void parseById(Document doc, Map<String, String> result) {
        Map<String, String> idMap = Map.ofEntries(
                Map.entry("fkPmsTenderWay", "招標方式"),
                Map.entry("fkPmsAwardWay", "決標方式"),
                Map.entry("fkTpamTenderStatus", "招標狀態"),
                Map.entry("targetDate", "公告日"),
                Map.entry("isGovernmentEstimate", "是否訂有底價"),
                Map.entry("fkPmsProcurementRange", "採購金額級距"),
                Map.entry("fkTpamHowBid", "辦理方式"),
                Map.entry("fkPmsExecuteLocation", "履約地點"),
                Map.entry("tenderNameText", "標案名稱"),
                Map.entry("spdt", "截止投標")
        );

        for (var entry : idMap.entrySet()) {
            Element el = doc.getElementById(entry.getKey());
            if (el != null) {
                String text = cleanText(el.text());
                if (!text.isEmpty()) {
                    result.put(entry.getValue(), text);
                }
            }
        }

        // 預算金額（hidden input）
        Element budgetInput = doc.getElementById("budget");
        if (budgetInput != null && !budgetInput.val().isEmpty()) {
            result.put("預算金額", budgetInput.val());
        }

        // 開標時間 / 開標地點（文字搜尋）
        for (Element td : doc.select("td")) {
            String tdText = td.text();
            if (tdText.contains("開標時間")) {
                Element next = td.nextElementSibling();
                if (next != null) result.putIfAbsent("開標時間", cleanText(next.text()));
            }
            if (tdText.contains("開標地點")) {
                Element next = td.nextElementSibling();
                if (next != null) result.putIfAbsent("開標地點", cleanText(next.text()));
            }
        }
    }

    private String cleanText(String text) {
        if (text == null) return "";
        return text.replaceAll("\\s+", " ").trim();
    }

    private String firstNonEmpty(String... values) {
        for (String v : values) {
            if (v != null && !v.isEmpty()) return v;
        }
        return "";
    }
}
