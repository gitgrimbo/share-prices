const throttler = require("../throttler");
const get = require("../http-get");

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
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apikey}`;
      const response = await get(url);
      const ob = JSON.parse(response);
      const days = ob["Time Series (Daily)"];
      if (!days) {
        return {
          ticker,
          err: `Unknown response: ${JSON.stringify(ob)}`,
        };
      }
      if (todayStr in days) {
        const todaysPrices = days[todayStr];
        if ("4. close" in todaysPrices) {
          return {
            ticker,
            value: todaysPrices["4. close"],
          };
        }
        return {
          ticker,
          err: `"4. close" key not in ${JSON.stringify(todaysPrices)}`,
        };
      }
      return {
        ticker,
        err: `${todayStr} not in ${Object.keys(days)}`,
      };
    } catch (err) {
      return {
        ticker,
        err,
      };
    }
  };

  const requestsPerPeriod = 5;
  const period = 60 * 1000;
  const thr = throttler(requestsPerPeriod, period);
  // -1 because the first set of requests is 'free' wrt time (i.e. immediate)
  const estimatedTime = ((tickers.length / 5) - 1) * period;

  console.log(`${tickers.length} tickers will take approximately ${estimatedTime}ms`);

  const promises = tickers.map((ticker) => thr.add(() => getLatestPrice(ticker), ticker));

  const responses = [];
  for (let i = 0; i < promises.length; i++) {
    const promise = promises[i];
    console.log(`awaiting promise[${i}]: "${promise.name}"`);
    const response = await promise;
    console.log(`promise[${i}]: "${promise.name}" returned`);
    console.log(`throttler state: ${thr.getState()}`);
    responses[i] = response;
  }

  return responses;
}

module.exports = {
  getLatestPrices,
};
