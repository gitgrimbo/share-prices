const get = require("../http-get");
const props = require("./prop-utils");

/*
Sample JSON data:

{
    "Meta Data": {
        "1. Information": "Daily Prices (open, high, low, close) and Volumes",
        "2. Symbol": "HSBA.L",
        "3. Last Refreshed": "2018-12-20",
        "4. Output Size": "Compact",
        "5. Time Zone": "US/Eastern"
    },
    "Time Series (Daily)": {
        "2018-12-20": {
            "1. open": "640.2000",
            "2. high": "654.4000",
            "3. low": "636.8000",
            "4. close": "650.2000",
            "5. volume": "21142430"
        },
        "2018-12-19": {
*/
async function getLatestPrices(tickers, apikey) {
  // capture today here, in case the day changes after we make the API calls!
  let today = new Date();
  if (today.getHours() < 16) {
    today = new Date(today.getTime() - (24 * 60 * 60 * 1000));
  }
  const todayStr = today.toISOString().substring(0, 10);
  console.log(`Date used for prices is ${todayStr}`);

  async function getLatestPrice(ticker) {
    console.log(`getLatestPrice(${ticker})`);
    try {
      // Headers not required?
      // User-Agent: Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.108 Mobile Safari/537.36
      // Referer: https://uk.finance.yahoo.com/quote/HSBA.L?p=HSBA.L
      // Origin: https://uk.finance.yahoo.com
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?region=GB&lang=en-GB&includePrePost=false&interval=5m&range=1d&corsDomain=uk.finance.yahoo.com&.tsrc=finance`;
      const response = await get(url);
      const ob = JSON.parse(response);
      if (ob && ob.chart && ob.chart.error) {
        return {
          ticker,
          err: ob.chart.error,
        };
      }
      const high = props.get(ob, "chart.result[0].indicators.quote[0].high");
      const value = props.arrGetLastValidValue(high);
      return {
        ticker,
        value,
      };
    } catch (err) {
      return {
        ticker,
        err,
      };
    }
  };

  const promises = tickers.map((ticker) => getLatestPrice(ticker));

  const responses = [];
  for (let i = 0; i < promises.length; i++) {
    const promise = promises[i];
    console.log(`awaiting promise[${i}]: "${tickers[i]}"`);
    const response = await promise;
    console.log(`promise[${i}]: "${tickers[i]}" returned`);
    responses[i] = response;
  }

  return responses;
}

module.exports = {
  getLatestPrices,
};
