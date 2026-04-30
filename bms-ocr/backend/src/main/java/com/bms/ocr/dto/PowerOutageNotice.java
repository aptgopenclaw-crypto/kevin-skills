package com.bms.ocr.dto;

import lombok.Data;
import java.util.List;

@Data
public class PowerOutageNotice {
    private String date;             // 日期
    private String outageTime;       // 預計停電時間
    private String outageLocation;   // 停電路口
}
