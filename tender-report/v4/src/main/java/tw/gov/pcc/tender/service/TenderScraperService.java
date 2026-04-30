package tw.gov.pcc.tender.service;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.LoadState;
import com.microsoft.playwright.options.WaitUntilState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tw.gov.pcc.tender.config.NvidiaProperties;
import tw.gov.pcc.tender.config.ScraperProperties;
import tw.gov.pcc.tender.model.TenderRecord;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 政府採購網爬蟲（Playwright Java 版）
 * 完整流程：搜尋列表 → 撲克牌驗證碼 → 詳細頁 → 回傳資料
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TenderScraperService {

    private final ScraperProperties scraperProps;
    private final NvidiaProperties nvidiaProps;
    private final CaptchaSolverService captchaSolver;
    private final DetailParserService detailParser;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    /**
     * 爬取所有關鍵字的標案資料
     */
    public List<TenderRecord> scrapeAll() {
        LocalDate today = LocalDate.now();
        String startDate = today.format(DATE_FMT);
        String endDate = today.format(DATE_FMT);

        log.info("=".repeat(60));
        log.info("政府採購網招標資料爬蟲 V4 (Spring Boot)");
        log.info("關鍵字數量: {}", scraperProps.getKeywords().size());
        log.info("查詢日期: {} ~ {}", startDate, endDate);
        log.info("過濾採購性質: {}", scraperProps.getFilterProcurementType().isEmpty()
                ? "不過濾" : scraperProps.getFilterProcurementType());
        log.info("=".repeat(60));

        List<TenderRecord> allRecords = new ArrayList<>();

        try (Playwright pw = Playwright.create()) {
            Browser browser = pw.chromium().launch(new BrowserType.LaunchOptions()
                    .setHeadless(scraperProps.isHeadless())
                    .setArgs(List.of("--no-sandbox", "--disable-blink-features=AutomationControlled")));

            BrowserContext context = browser.newContext(new Browser.NewContextOptions()
                    .setUserAgent(scraperProps.getUserAgent())
                    .setViewportSize(1280, 900)
                    .setLocale("zh-TW"));

            Page page = context.newPage();

            List<String> keywords = scraperProps.getKeywords();
            for (int i = 0; i < keywords.size(); i++) {
                String keyword = keywords.get(i);
                log.info("進度: {}/{}", i + 1, keywords.size());

                List<TenderRecord> tenders = scrapeListPage(page, keyword, startDate, endDate);
                allRecords.addAll(tenders);

                if (i < keywords.size() - 1) {
                    page.waitForTimeout(scraperProps.getRequestDelay() * 1000L);
                }
            }

            log.info("列表頁共取得 {} 筆標案", allRecords.size());

            // 取得每筆標案的詳細資料
            if (!allRecords.isEmpty()) {
                log.info("=".repeat(60));
                log.info("開始取得詳細頁資料...");
                log.info("=".repeat(60));

                for (int i = 0; i < allRecords.size(); i++) {
                    TenderRecord record = allRecords.get(i);
                    log.info("詳細頁進度: {}/{}", i + 1, allRecords.size());
                    solveCaptchaAndGetDetail(page, record);
                    page.waitForTimeout(scraperProps.getRequestDelay() * 1000L);
                }
            }

            context.close();
            browser.close();
        }

        log.info("=".repeat(60));
        log.info("爬蟲完成: 共 {} 筆", allRecords.size());
        return allRecords;
    }

    /**
     * 爬取搜尋列表頁
     */
    List<TenderRecord> scrapeListPage(Page page, String keyword, String startDate, String endDate) {
        String url = buildSearchUrl(keyword, startDate, endDate);
        log.info("搜尋關鍵字: '{}'", keyword);

        try {
            page.navigate(url, new Page.NavigateOptions()
                    .setWaitUntil(WaitUntilState.NETWORKIDLE)
                    .setTimeout(scraperProps.getRequestTimeout() * 1000L));
            page.waitForTimeout(1000);
        } catch (Exception e) {
            log.error("載入列表頁失敗 ({}): {}", keyword, e.getMessage());
            return List.of();
        }

        // 解析列表表格
        List<ElementHandle> rows = page.querySelectorAll("table.tb_01 tbody tr, table#tpam tbody tr, tr.tb_b2");
        List<TenderRecord> tenders = new ArrayList<>();
        String filterType = scraperProps.getFilterProcurementType();

        for (ElementHandle row : rows) {
            List<ElementHandle> cols = row.querySelectorAll("td");
            if (cols.size() < 9) continue;

            // 提取 detail URL
            String detailUrl = "";
            ElementHandle viewLink = row.querySelector("a[href*='tpam?pk='], a[href*='urlSelector']");
            if (viewLink == null) {
                viewLink = row.querySelector("a:has-text('檢視')");
            }
            if (viewLink != null) {
                String href = viewLink.getAttribute("href");
                if (href != null && !href.isBlank()) {
                    detailUrl = href.startsWith("http") ? href : "https://web.pcc.gov.tw" + href;
                }
            }

            // 取各欄位
            String[] colTexts = new String[cols.size()];
            for (int i = 0; i < cols.size(); i++) {
                colTexts[i] = cols.get(i).innerText().trim();
            }

            String procurementType = colTexts.length > 5 ? colTexts[5] : "";

            // 過濾採購性質
            if (!filterType.isEmpty() && !procurementType.contains(filterType)) {
                continue;
            }

            // 拆分案號 / 名稱
            String col2Text = colTexts.length > 2 ? colTexts[2] : "";
            // 嘗試從 script 取標案名稱
            String tenderNameFromScript = "";
            ElementHandle scriptEl = cols.size() > 2 ? cols.get(2).querySelector("script") : null;
            if (scriptEl != null) {
                String scriptText = scriptEl.innerHTML();
                Matcher m = Pattern.compile("pageCode2Img\\(\"([^\"]+)\"\\)").matcher(scriptText);
                if (m.find()) {
                    tenderNameFromScript = m.group(1);
                }
            }

            String[] parts = col2Text.split("\\n");
            List<String> cleanParts = new ArrayList<>();
            for (String p : parts) {
                String trimmed = p.trim();
                if (!trimmed.isEmpty()) cleanParts.add(trimmed);
            }

            TenderRecord record = new TenderRecord();
            record.setKeyword(keyword);
            record.setOrgName(colTexts.length > 1 ? colTexts[1] : "");
            record.setCaseNo(cleanParts.isEmpty() ? "" : cleanParts.get(0));
            record.setTenderName(!tenderNameFromScript.isEmpty() ? tenderNameFromScript
                    : (cleanParts.size() > 1 ? String.join(" ", cleanParts.subList(1, cleanParts.size())) : ""));
            record.setTransmissions(colTexts.length > 3 ? colTexts[3] : "");
            record.setTenderWay(colTexts.length > 4 ? colTexts[4] : "");
            record.setProcurementType(procurementType);
            record.setAnnounceDate(colTexts.length > 6 ? colTexts[6] : "");
            record.setDeadline(colTexts.length > 7 ? colTexts[7] : "");
            record.setBudget(colTexts.length > 8 ? colTexts[8] : "");
            record.setDetailUrl(detailUrl);

            tenders.add(record);
        }

        log.info("  關鍵字 '{}': 過濾後 {} 筆", keyword, tenders.size());
        return tenders;
    }

    /**
     * 前往 detail URL → 處理撲克牌驗證碼 → 解析詳細頁
     */
    void solveCaptchaAndGetDetail(Page page, TenderRecord record) {
        String detailUrl = record.getDetailUrl();
        log.info("  嘗試取得詳細資料: {} / {}", record.getOrgName(), record.getCaseNo());

        if (detailUrl == null || detailUrl.isBlank()) {
            log.warn("  沒有 detail URL: {}", record.getCaseNo());
            return;
        }

        try {
            page.navigate(detailUrl, new Page.NavigateOptions()
                    .setWaitUntil(WaitUntilState.NETWORKIDLE)
                    .setTimeout(scraperProps.getRequestTimeout() * 1000L));
            page.waitForTimeout(1000);
        } catch (Exception e) {
            log.error("  載入 detail URL 失敗: {}", e.getMessage());
            return;
        }

        String pageText = page.textContent("body");
        if (pageText == null) pageText = "";

        // 已進入詳細頁（無驗證碼）
        if (pageText.contains("機關資料") || pageText.contains("招標資料") || pageText.contains("機關代碼")) {
            log.info("  直接進入詳細頁（無驗證碼）");
            detailParser.parseAndFill(page.content(), record);
            return;
        }

        // 檢查是否為驗證碼頁
        boolean hasCaptcha = pageText.contains("A區") || pageText.contains("撲克牌")
                || pageText.contains("防止惡意程式") || pageText.contains("驗證");
        if (!hasCaptcha) {
            log.warn("  頁面既非詳細頁也非 CAPTCHA: {}", page.url());
            saveDebugScreenshot(page, "unknown_" + record.getCaseNo());
            return;
        }

        // ── Vision AI 辨識模式 ──
        for (int attempt = 0; attempt < scraperProps.getCaptchaMaxRetries(); attempt++) {
            log.info("  驗證碼嘗試 {}/{}", attempt + 1, scraperProps.getCaptchaMaxRetries());

            byte[] screenshot = page.screenshot(new Page.ScreenshotOptions().setFullPage(true));
            saveDebugScreenshot(screenshot, "captcha_" + record.getCaseNo() + "_" + attempt);

            List<Integer> matches = captchaSolver.solve(screenshot);

            if (matches.isEmpty()) {
                log.warn("  Vision AI 未回傳配對結果，重試...");
                clickRefresh(page);
                continue;
            }

            // 點擊 B區匹配的牌
            List<ElementHandle> checkboxes = page.querySelectorAll("input[name='choose']");
            if (checkboxes.size() >= 6) {
                // 清除所有 checkbox
                for (ElementHandle cb : checkboxes) {
                    cb.evaluate("el => el.checked = false");
                }
                // 點擊匹配的牌
                for (int idx : matches) {
                    if (idx < checkboxes.size()) {
                        String cbId = checkboxes.get(idx).getAttribute("id");
                        if (cbId != null) {
                            ElementHandle label = page.querySelector("label[for='" + cbId + "']");
                            if (label != null) {
                                label.click();
                                page.waitForTimeout(300);
                            } else {
                                checkboxes.get(idx).evaluate("el => el.checked = true");
                            }
                        } else {
                            checkboxes.get(idx).evaluate("el => el.checked = true");
                        }
                        log.info("  已點擊 B區第 {} 張牌", idx);
                    }
                }
            }

            // 送出
            ElementHandle submitBtn = page.querySelector("#b_submit, input[value='確認送出']");
            if (submitBtn == null) {
                submitBtn = page.querySelector("button:has-text('送出'), text=確認送出");
            }
            if (submitBtn != null) {
                submitBtn.click();
                log.info("  已點擊確認送出");
            } else {
                log.warn("  找不到確認送出按鈕");
                continue;
            }

            page.waitForTimeout(3000);
            try {
                page.waitForLoadState(LoadState.NETWORKIDLE,
                        new Page.WaitForLoadStateOptions().setTimeout(10000));
            } catch (Exception ignored) {
            }

            // 檢查結果
            String newText = page.textContent("body");
            if (newText == null) newText = "";

            if (newText.contains("機關資料") || newText.contains("招標資料") || newText.contains("機關代碼")) {
                log.info("  ✓ 驗證碼通過，成功取得詳細頁");
                detailParser.parseAndFill(page.content(), record);
                return;
            }

            // 仍在 CAPTCHA 頁
            log.warn("  驗證失敗 (matches={})，重試...", matches);
            clickRefresh(page);
        }

        log.error("  ✗ 驗證碼嘗試 {} 次均失敗: {}", scraperProps.getCaptchaMaxRetries(), record.getCaseNo());
    }

    private void clickRefresh(Page page) {
        ElementHandle refreshBtn = page.querySelector("text=重新產生");
        if (refreshBtn == null) {
            refreshBtn = page.querySelector("text=重新整理");
        }
        if (refreshBtn != null) {
            refreshBtn.click();
            page.waitForTimeout(2000);
        }
    }

    private String buildSearchUrl(String keyword, String startDate, String endDate) {
        return scraperProps.getBaseUrl() + "?" + String.join("&",
                "firstSearch=true",
                "searchType=basic",
                "isBinding=N",
                "isLogIn=N",
                "orgName=",
                "orgId=",
                "tenderName=" + URLEncoder.encode(keyword, StandardCharsets.UTF_8),
                "tenderId=",
                "tenderType=TENDER_DECLARATION",
                "tenderWay=TENDER_WAY_ALL_DECLARATION",
                "dateType=isNow",
                "tenderStartDate=" + startDate,
                "tenderEndDate=" + endDate,
                "radProctrgCate=",
                "policyAdvocacy="
        );
    }

    private void saveDebugScreenshot(Page page, String name) {
        saveDebugScreenshot(page.screenshot(new Page.ScreenshotOptions().setFullPage(true)), name);
    }

    private void saveDebugScreenshot(byte[] screenshot, String name) {
        try {
            Path debugDir = Path.of(scraperProps.getOutputDir(), "debug");
            Files.createDirectories(debugDir);
            Path path = debugDir.resolve(name + ".png");
            Files.write(path, screenshot);
            log.info("  截圖已儲存: {}", path);
        } catch (IOException e) {
            log.warn("  儲存截圖失敗: {}", e.getMessage());
        }
    }
}
