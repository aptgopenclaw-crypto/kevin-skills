package tw.gov.pcc.tender.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tw.gov.pcc.tender.model.TenderRecord;
import tw.gov.pcc.tender.service.ExcelExportService;
import tw.gov.pcc.tender.service.TenderScraperService;

import java.util.List;

/**
 * 排程任務：定期執行爬蟲並匯出 Excel
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "scheduler.enabled", havingValue = "true", matchIfMissing = true)
public class ScraperScheduler {

    private final TenderScraperService scraperService;
    private final ExcelExportService excelExportService;

    /**
     * 定時排程（預設：週一到週五 08:00）
     * 可在 application.yml 修改 scheduler.cron
     */
    @Scheduled(cron = "${scheduler.cron}")
    public void scheduledScrape() {
        log.info("排程任務啟動 —— 開始爬取招標資料");
        runScrape();
    }

    /**
     * 執行爬蟲 + 匯出（也可由 REST API 或 CLI 呼叫）
     */
    public void runScrape() {
        try {
            List<TenderRecord> records = scraperService.scrapeAll();

            if (records.isEmpty()) {
                log.warn("本次無任何標案資料");
                return;
            }

            excelExportService.export(records);
            log.info("排程任務完成，共 {} 筆", records.size());

        } catch (Exception e) {
            log.error("排程任務執行失敗: {}", e.getMessage(), e);
        }
    }
}
