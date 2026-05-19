import yfinance as yf

def get_usd_to_sgd_rate():
    """
    Fetch the latest USD to SGD exchange rate using yfinance.

    Returns:
        float: The latest USD/SGD exchange rate.
    """
    try:
        # Fetch USD/SGD ticker data
        ticker = yf.Ticker("USDSGD=X")
        history = ticker.history(period="1d")

        # Extract the latest closing price
        current_fx = history['Close'].iloc[-1]
        print(f"Current USD to SGD exchange rate: {current_fx}")
        return current_fx

    except Exception as e:
        print(f"Error fetching USD to SGD rate: {e}")
        return None

if __name__ == "__main__":
    get_usd_to_sgd_rate()