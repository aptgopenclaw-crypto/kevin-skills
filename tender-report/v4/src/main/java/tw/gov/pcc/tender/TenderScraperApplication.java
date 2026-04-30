package tw.gov.pcc.tender;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TenderScraperApplication {

    public static void main(String[] args) {
        SpringApplication.run(TenderScraperApplication.class, args);
    }
}
