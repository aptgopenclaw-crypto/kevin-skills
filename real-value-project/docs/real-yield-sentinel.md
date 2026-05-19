# RealYield-Sentinel: 實質收益哨兵

太好了！既然邏輯已經梳理清楚，我們可以把這個概念轉化為具體的 Python 實作框架。

為了讓你更精準地監控「美元購買力是否被稀釋」，你的 Python 專案可以採取 **「三重過濾法」**。

### 1. 核心邏輯架構 (The Real Yield Engine)

你可以寫一個類別來計算你的 **「錨定購買力回報率」 (Anchored Returns)**：

```python
import yfinance as yf

def calculate_real_gain(usd_principal, interest_rate_annual, months, entry_fx):
    # 1. 獲取最新 USD/SGD 匯率
    ticker = yf.Ticker("USDSGD=X")
    current_fx = ticker.history(period="1d")['Close'].iloc[-1]
    
    # 2. 計算名目資產 (美元本金 + 利息)
    # 簡單假設利息按月計算
    nominal_usd = usd_principal * (1 + (interest_rate_annual / 12) * months)
    
    # 3. 轉換為錨點價值 (SGD)
    initial_value_sgd = usd_principal * entry_fx
    current_value_sgd = nominal_usd * current_fx
    
    # 4. 計算實質增長率
    real_growth = (current_value_sgd - initial_value_sgd) / initial_value_sgd
    
    return {
        "current_fx": current_fx,
        "nominal_usd": nominal_usd,
        "current_value_sgd": current_value_sgd,
        "real_growth_pct": real_growth * 100
    }

# 範例：100美元, 年利率5%, 持有一個月, 當初買入匯率 1.35
# result = calculate_real_gain(100, 0.05, 1, 1.35)

```

---

### 2. 綜合判斷指標（判斷「印鈔」趨勢）

除了你的匯率錨點，建議你的 Python 爬蟲同時監控以下三個「趨勢信號」，來判斷美元走弱是因為「正常的市場波動」還是「結構性的印鈔稀釋」：

* **信號 A：TIPS（實質利率）是否轉負？**
* 從 FRED 爬取 `DFII10`。
* **邏輯：** 如果美國 10 年期實質利率持續下滑，代表聯準會正在讓通膨吃掉債務，這對持有美元利息資產的人最不利。


* **信號 B：美元指數 (DXY) 與黃金 (Gold) 的背離**
* **邏輯：** 如果美元跌（DXY ↓）且黃金漲（Gold ↑），代表市場在逃避信用貨幣，印鈔解決債務的嫌疑極大。


* **信號 C：比特幣 (BTC) 的異動**
* **邏輯：** 比特幣常被視為「流動性溫度計」。當印鈔預期增加時，這類限量資產通常會先於匯率反應。



---

### 3. 給專案的一個小建議：加入「購買力熱力圖」

在你的 Python 視覺化 (Matplotlib/Plotly) 中，你可以畫出一條線：

* **藍線：** 你的美元名目資產增長（穩定向上）。
* **紅線：** 換算成 SGD 後的資產價值（可能震盪或向下）。

**當紅線低於藍線的那一刻，就是「稀釋」發生的證據。**

這個專案名稱用 **`RealYield-Sentinel`** (實質收益哨兵) 真的非常貼切，因為你就是在幫自己的資產站崗，防止購買力被無聲無息地偷走。

如果你在爬取 FRED 數據或計算邏輯上有任何卡關，隨時告訴我！