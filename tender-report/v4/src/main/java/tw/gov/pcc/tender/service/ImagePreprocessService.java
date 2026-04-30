package tw.gov.pcc.tender.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * 驗證碼圖片前處理
 * 移除非標準撲克牌顏色的干擾線（同 Python v2 的 preprocess_captcha_image）
 */
@Slf4j
@Service
public class ImagePreprocessService {

    /**
     * 移除非黑/非紅的干擾線，將其替換為白色。
     * <p>
     * 撲克牌只有兩種顏色：
     * - 黑色系（黑桃♠、梅花♣）：接近純黑
     * - 紅色系（紅心♥、方塊♦）：接近純紅
     * <p>
     * 干擾線是同花色形狀但用其他顏色（綠、藍、紫、黃等），替換為白色。
     */
    public byte[] removeInterferenceLines(byte[] imageBytes) throws IOException {
        BufferedImage img = ImageIO.read(new ByteArrayInputStream(imageBytes));
        if (img == null) {
            throw new IOException("無法讀取圖片");
        }

        int width = img.getWidth();
        int height = img.getHeight();

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int rgb = img.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;

                boolean isBlack = r < 80 && g < 80 && b < 80;
                boolean isRed = r > 150 && g < 80 && b < 80;
                boolean isWhite = r > 200 && g > 200 && b > 200;
                boolean isGray = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && r < 200;

                if (!(isBlack || isRed || isWhite || isGray)) {
                    // 干擾線 → 設為白色
                    img.setRGB(x, y, 0xFFFFFFFF);
                }
            }
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, "png", out);
        return out.toByteArray();
    }
}
