package tw.gov.pcc.tender.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "scraper")
public class ScraperProperties {

    private List<String> keywords;
    private String baseUrl;
    private String detailUrl;
    private String userAgent;
    private int requestTimeout = 30;
    private int requestDelay = 2;
    private String filterProcurementType = "工程";
    private int captchaMaxRetries = 5;
    private boolean headless = true;
    private String outputDir = "./output";
}
