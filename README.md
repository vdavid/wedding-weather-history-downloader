This is a very simple CLI tool to download and parse weather data.

The project is to check how the weather was at a location which we're considering for our wedding.
A pretty self-centered project, but well, it's a fun one.

## How to use

1. Make sure you have an API key for MeteoStat. Get one [here](https://rapidapi.com/meteostat/api/meteostat/).
2. Copy the `config.TEMPLATE.mjs` file to `config.mjs`, and set the API key
3. In index.mjs, set the action to one of the action constants.
4. Run the script by `node index.mjs`.