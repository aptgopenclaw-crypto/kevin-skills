"""
郵件寄送模組
將爬蟲結果摘要 + Excel 附件寄出
"""

import logging
import os
import smtplib
from datetime import date
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config import (
    MAIL_SMTP_HOST, MAIL_SMTP_PORT, MAIL_USER, MAIL_PASSWORD,
    MAIL_ALIAS, MAIL_RECIPIENTS, FILTER_PROCUREMENT_TYPE,
    SOLUTION_KEYWORD_MAP, KEYWORD_TO_SOLUTION,
)

logger = logging.getLogger(__name__)


def build_summary_html(keyword_counts: dict[str, int], total: int) -> str:
    """
    產生 HTML 郵件內容 — 依 Solution 分類顯示

    Args:
        keyword_counts: {關鍵字: 筆數}
        total: 總筆數
    """
    today = date.today().strftime("%Y/%m/%d")
    filter_note = f"（採購性質：{FILTER_PROCUREMENT_TYPE}）" if FILTER_PROCUREMENT_TYPE else ""

    # 依 Solution 彙總
    solution_counts = {}
    for solution, keywords in SOLUTION_KEYWORD_MAP.items():
        count = sum(keyword_counts.get(kw, 0) for kw in keywords)
        kw_display = ', '.join(f'"{kw}"' for kw in keywords)
        solution_counts[solution] = {'count': count, 'keywords': kw_display}

    rows_html = ""
    for solution, info in sorted(solution_counts.items(), key=lambda x: x[1]['count'], reverse=True):
        count = info['count']
        keywords = info['keywords']
        color = "#333" if count > 0 else "#999"
        bold = "font-weight:bold;" if count > 0 else ""
        rows_html += f"""
        <tr>
            <td style="padding:6px 12px;border:1px solid #ddd;{bold}color:{color}">{solution}</td>
            <td style="padding:6px 12px;border:1px solid #ddd;{bold}color:{color};font-size:12px">{keywords}</td>
            <td style="padding:6px 12px;border:1px solid #ddd;text-align:right;{bold}color:{color}">{count} 筆</td>
        </tr>"""

    html = f"""
    <html>
    <body style="font-family:'Microsoft JhengHei',Arial,sans-serif;color:#333">
        <h2 style="color:#2e6da4">📋 政府採購網招標資料日報</h2>
        <p>查詢日期：<b>{today}</b> {filter_note}</p>

        <table style="border-collapse:collapse;margin:16px 0">
            <thead>
                <tr style="background:#2e6da4;color:#fff">
                    <th style="padding:8px 12px;border:1px solid #ddd;text-align:left">相關產品</th>
                    <th style="padding:8px 12px;border:1px solid #ddd;text-align:left">關鍵字</th>
                    <th style="padding:8px 12px;border:1px solid #ddd;text-align:right">筆數</th>
                </tr>
            </thead>
            <tbody>
                <tr style="background:#f5f5f5;font-weight:bold">
                    <td style="padding:8px 12px;border:1px solid #ddd" colspan="2">合計</td>
                    <td style="padding:8px 12px;border:1px solid #ddd;text-align:right">{total} 筆</td>
                </tr>
                {rows_html}
            </tbody>
        </table>

        <p style="color:#888;font-size:12px">此為系統自動寄送，詳細資料請參閱附件 Excel。</p>
    </body>
    </html>
    """
    return html


def send_report_email(excel_path: str, keyword_counts: dict[str, int], total: int) -> bool:
    """
    寄送報表郵件

    Args:
        excel_path: Excel 檔案路徑
        keyword_counts: {關鍵字: 筆數}
        total: 總筆數

    Returns:
        True if sent successfully
    """
    if not MAIL_RECIPIENTS:
        logger.warning("未設定收件人，跳過寄信")
        return False

    if not os.path.exists(excel_path):
        logger.error(f"Excel 檔案不存在: {excel_path}")
        return False

    today = date.today().strftime("%Y/%m/%d")
    subject = f"【招標日報】{today} 政府採購網招標資料 ({total} 筆)"

    # 建立郵件
    msg = MIMEMultipart()
    msg["From"] = f"{MAIL_ALIAS} <{MAIL_USER}>"
    msg["To"] = ", ".join(MAIL_RECIPIENTS)
    msg["Subject"] = subject

    # HTML 內文
    html_body = build_summary_html(keyword_counts, total)
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    # Excel 附件
    filename = os.path.basename(excel_path)
    with open(excel_path, "rb") as f:
        attachment = MIMEApplication(f.read(), Name=filename)
    attachment["Content-Disposition"] = f'attachment; filename="{filename}"'
    msg.attach(attachment)

    # 寄送
    try:
        logger.info(f"寄送郵件至: {', '.join(MAIL_RECIPIENTS)}")
        with smtplib.SMTP(MAIL_SMTP_HOST, MAIL_SMTP_PORT, timeout=30) as server:
            server.starttls()
            server.login(MAIL_USER, MAIL_PASSWORD)
            server.sendmail(MAIL_USER, MAIL_RECIPIENTS, msg.as_string())
        logger.info("郵件寄送成功")
        return True
    except Exception as e:
        logger.error(f"郵件寄送失敗: {e}")
        return False
