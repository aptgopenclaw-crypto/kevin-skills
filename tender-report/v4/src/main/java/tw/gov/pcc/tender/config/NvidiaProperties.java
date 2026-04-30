package tw.gov.pcc.tender.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "nvidia")
public class NvidiaProperties {

    private String apiKey;
    private String baseUrl = "https://integrate.api.nvidia.com/v1";
    private String visionModel = "google/gemma-4-31b-it";
    private int timeout = 60;
}
