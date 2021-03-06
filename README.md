This is a very simple CLI tool to download and parse weather data.

The project is to check how the weather was at a location which we're considering for our wedding.
It can be used for other POIs too.

## How to use

1. Make sure you have an API key for MeteoStat. Get one [here](https://rapidapi.com/meteostat/api/meteostat/).
2. Copy the `config.TEMPLATE.ts` file to `config.ts`, and set the API key
3. Also set the date range you want to parse for. (The whole year(s) will be downloaded though, so re-parsing is easy.) 
4. Run the script by `npm run dev`.
5. Open [http://localhost:3000](http://localhost:3000)

## The tech stack

 - Node.js (v14.16.0)
 - TypeScript
 - [Next.js](https://nextjs.org/) (bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app))

## Links
- [MeteoStat Docs (elaborate)](https://dev.meteostat.net/api/point/hourly.html#endpoint)
- [MeteoStat Docs (fancy)](https://rapidapi.com/meteostat/api/meteostat/)
- [Pricing](https://rapidapi.com/meteostat/api/meteostat/pricing)
  - 500 requests / month are free.