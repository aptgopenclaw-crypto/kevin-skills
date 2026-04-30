package tw.gov.pcc.tender.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import tw.gov.pcc.tender.config.ScraperProperties;
import tw.gov.pcc.tender.model.TenderRecord;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Excel 報表匯出
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final ScraperProperties scraperProps;

    private static final String[] HEADERS = {
            "項次", "機關名稱", "標案案號", "標案名稱", "傳輸次數",
            "招標方式", "採購性質", "公告日期", "截止投標", "預算金額",
            "機關代碼", "單位名稱", "機關地址", "聯絡人", "聯絡電話",
            "電子郵件信箱", "標的分類", "採購金額級距", "辦理方式", "決標方式",
            "招標狀態", "開標時間", "開標地點", "是否訂有底價", "履約地點",
            "關鍵字"
    };

    public Path export(List<TenderRecord> records) throws IOException {
        Path outputDir = Path.of(scraperProps.getOutputDir());
        Files.createDirectories(outputDir);

        String fileName = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "招標資料.xlsx";
        Path outputPath = outputDir.resolve(fileName);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("招標資料");

            // 標題列樣式
            CellStyle headerStyle = createHeaderStyle(workbook);

            // 寫入標題
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            // 寫入資料
            CellStyle dataStyle = createDataStyle(workbook);
            for (int i = 0; i < records.size(); i++) {
                TenderRecord r = records.get(i);
                Row row = sheet.createRow(i + 1);
                int col = 0;
                setCellValue(row, col++, String.valueOf(i + 1), dataStyle);
                setCellValue(row, col++, r.getOrgName(), dataStyle);
                setCellValue(row, col++, r.getCaseNo(), dataStyle);
                setCellValue(row, col++, r.getTenderName(), dataStyle);
                setCellValue(row, col++, r.getTransmissions(), dataStyle);
                setCellValue(row, col++, r.getTenderWay(), dataStyle);
                setCellValue(row, col++, r.getProcurementType(), dataStyle);
                setCellValue(row, col++, r.getAnnounceDate(), dataStyle);
                setCellValue(row, col++, r.getDeadline(), dataStyle);
                setCellValue(row, col++, r.getBudget(), dataStyle);
                setCellValue(row, col++, r.getOrgCode(), dataStyle);
                setCellValue(row, col++, r.getUnitName(), dataStyle);
                setCellValue(row, col++, r.getOrgAddress(), dataStyle);
                setCellValue(row, col++, r.getContactPerson(), dataStyle);
                setCellValue(row, col++, r.getContactPhone(), dataStyle);
                setCellValue(row, col++, r.getEmail(), dataStyle);
                setCellValue(row, col++, r.getTargetCategory(), dataStyle);
                setCellValue(row, col++, r.getBudgetRange(), dataStyle);
                setCellValue(row, col++, r.getHandleMethod(), dataStyle);
                setCellValue(row, col++, r.getAwardMethod(), dataStyle);
                setCellValue(row, col++, r.getTenderStatus(), dataStyle);
                setCellValue(row, col++, r.getOpenTime(), dataStyle);
                setCellValue(row, col++, r.getOpenPlace(), dataStyle);
                setCellValue(row, col++, r.getHasFloorPrice(), dataStyle);
                setCellValue(row, col++, r.getExecLocation(), dataStyle);
                setCellValue(row, col++, r.getKeyword(), dataStyle);
            }

            // 自動調整欄寬
            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
                int width = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.min(width + 512, 15000));
            }

            try (FileOutputStream fos = new FileOutputStream(outputPath.toFile())) {
                workbook.write(fos);
            }
        }

        log.info("已匯出: {} ({} 筆)", outputPath, records.size());
        return outputPath;
    }

    private void setCellValue(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        setBorders(style);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        setBorders(style);
        return style;
    }

    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }
}
