/* Copy this file to config.ts and set the API key */

const config = {
    apiKey: '{TODO: Add your api key here from https://rapidapi.com/meteostat/api/meteostat/}',
    weatherDataFolderPath: 'data/raw-weather-data/',
    /* Useful tool – day of year calendar: https://www.esrl.noaa.gov/gmd/grad/neubrew/Calendar.jsp */
    startDayIndex: 105, /* Mid-April */
    endDayIndex: 105 + 6 * 30 - 1, /* Mid-October */
    maximumRequestsPerSecond: 3, /* Must be minimum 2! There are 3 in the free plan: https://rapidapi.com/meteostat/api/meteostat/pricing */
}

export default config;