import yfinance as yf

def get_twd_to_sgd_rate():
    """
    Fetch the latest TWD to SGD exchange rate using yfinance.

    Returns:
        float: The latest TWD/SGD exchange rate.
    """
    try:
        # Fetch TWD/SGD ticker data
        ticker = yf.Ticker("TWD=X")
        history = ticker.history(period="1d")

        # Extract the latest closing price
        current_fx = history['Close'].iloc[-1]
        print(f"Current TWD to SGD exchange rate: {current_fx}")
        return current_fx

    except Exception as e:
        print(f"Error fetching TWD to SGD rate: {e}")
        return None

if __name__ == "__main__":
    get_twd_to_sgd_rate()