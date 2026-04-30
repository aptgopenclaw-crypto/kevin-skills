package tw.gov.pcc.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tw.gov.pcc.tender.scheduler.ScraperScheduler;

import java.util.Map;

/**
 * REST API：手動觸發爬蟲
 */
@Slf4j
@RestController
@RequestMapping("/api/scraper")
@RequiredArgsConstructor
public class ScraperController {

    private final ScraperScheduler scheduler;

    @PostMapping("/run")
    public ResponseEntity<Map<String, String>> triggerScrape() {
        log.info("收到手動觸發爬蟲請求");
        scheduler.runScrape();
        return ResponseEntity.ok(Map.of("status", "completed"));
    }
}
