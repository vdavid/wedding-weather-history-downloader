import fs from 'fs';
import DataDownloader from './DataDownloader.mjs';

const actions = {
    step1DownloadData: 'step1DownloadData',
    step2ParseResults: 'step2ParseResults',
}

/* Set action here */
const action = actions.step2ParseResults;

const startYear = 1980;
const endYear = 2021;
const weatherDataFolderPath = 'data/raw-weather-data/';

if (action === actions.step1DownloadData) {
    const dataDownloader = new DataDownloader();
    await dataDownloader.downloadData(startYear, endYear, weatherDataFolderPath)

} else if (action === actions.step2ParseResults) {
    const years = Array.from(new Array(endYear - startYear + 1), (_item, key) => startYear + key);
    const temperatureMinimumData = await Promise.all(years.map(year => getDataForYear(year, temperatureMinimumMapper)));
    await writeData(temperatureMinimumData, years, 'data/temperatureMinimums.csv');
    const temperatureMaximumData = await Promise.all(years.map(year => getDataForYear(year, temperatureMaximumMapper)));
    await writeData(temperatureMaximumData, years, 'data/temperatureMaximums.csv');
    const rainfallData = await Promise.all(years.map(year => getDataForYear(year, rainfallMapper)));
    await writeData(rainfallData, years, 'data/rainfall.csv');
    const windSpeedAverageData = await Promise.all(years.map(year => getDataForYear(year, windSpeedAverageMapper)));
    await writeData(windSpeedAverageData, years, 'data/windSpeedAverage.csv');
    const windSpeedMaximumData = await Promise.all(years.map(year => getDataForYear(year, windSpeedMaximumMapper)));
    await writeData(windSpeedMaximumData, years, 'data/windSpeedMaximum.csv');

    async function writeData(data, years, filePath) {
        const days = Array.from(new Array(30), (_item, key) => key + 1);
        const csvColumnHeaders = ['', ...days].join(',');
        const csvRows = data.reduce((result, row) => {
            result.push(row.join(','));
            return result;
        }, []);
        const csvRowsWithRowHeaders = csvRows.map((row, index) => `${years[index]},${row}`);
        const csvData = csvRowsWithRowHeaders.join('\n');

        await fs.promises.writeFile(filePath, csvColumnHeaders + '\n' + csvData);
    }

    async function getDataForYear(year, mapperFunction) {
        const weatherData = await loadWeatherData(year);
        const entries = weatherData.data;
        const days = {};
        entries.forEach(entry => {
            const dateString = entry.time.substring(0, 10);
            days[dateString] = days[dateString] || [];
            days[dateString].push(entry)
        });
        return Object.values(days).map(mapperFunction);
    }

    function temperatureMinimumMapper(entries) {
        return entries.reduce((minimum, entry) => ((entry.temp !== null) && (entry.temp < minimum)) ? entry.temp : minimum, Infinity);
    }

    function temperatureMaximumMapper(entries) {
        return entries.reduce((maximum, entry) => ((entry.temp !== null) && (entry.temp > maximum)) ? entry.temp : maximum, -Infinity);
    }

    function windSpeedAverageMapper(entries) {
        const count = entries.filter(entry => entry.wspd !== null).length;
        return entries.reduce((windspeed, entry) => windspeed + entry.wspd, 0) / count;
    }

    function rainfallMapper(entries) {
        return entries.reduce((rainfall, entry) => rainfall + entry.prcp, 0);
    }

    function windSpeedMaximumMapper(entries) {
        return entries.reduce((maximum, entry) => ((entry.wspd !== null) && (entry.wspd > maximum)) ? entry.wspd : maximum, -Infinity);
    }

    async function loadWeatherData(year) {
        const filePath = `${weatherDataFolderPath}${year}-09-01_${year}-09-30.json`;
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    }
}
