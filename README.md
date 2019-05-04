# Example App

```js
const sharePrices = require("d:/dev/git_repos/share-prices/");

// alphavantage key
const apikey = "xxx";
const tickers = [
  "aaa.L",
  "bbb.L",
  "ccc.L",
];

async function main(args) {
  const argv = sharePrices.makeArgv(args);

  argv.source = argv.source || "yahoo";
  argv.apiKey = argv.apiKey || apikey;
  argv.tickers = sharePrices.makeTickers(argv.tickers) || tickers;

  console.log(argv);

  const source = sharePrices.getSource(argv.source);
  if (!source) {
    console.error(`Share price source "${argv.source}" not valid. Valid sources are "${sharePrices.getSources().join(", ")}"`);
    return;
  }

  if (!argv.tickers) {
    console.error(`No tickers provided. Use "--tickers=ABC.L,DEF.L,..." arg.`);
    return;
  }

  const latestPrices = await source.getLatestPrices(argv.tickers, argv.apikey);
  latestPrices.forEach(({ ticker, value, err }) => {
    console.log(ticker, value || err);
  });
}

main(process.argv.slice(2))
  .catch((err) => console.error(err));
```

# Example Use

`node share-prices.js --source=yahoo`
