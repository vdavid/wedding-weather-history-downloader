import DataDownloader from './DataDownloader.mjs';
import DataParser from './DataParser.mjs';

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
    const dataDownloader = new DataDownloader(weatherDataFolderPath);
    await dataDownloader.downloadData(startYear, endYear)

} else if (action === actions.step2ParseResults) {
    const dataParser = new DataParser(weatherDataFolderPath);
    await dataParser.parseData(startYear, endYear);
}
