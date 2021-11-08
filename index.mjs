import DataDownloader from './DataDownloader.mjs';

const actions = {
    step1DownloadData: 'step1DownloadData',
    step2ParseResults: 'step2ParseResults',
}

/* Set action here */
const action = actions.step2ParseResults;

if (action === actions.step1DownloadData) {
    const dataDownloader = new DataDownloader();
    await dataDownloader.downloadData(1980, 2021, 'data/raw-weather-data/')
} else if (action === actions.step2ParseResults) {

}
