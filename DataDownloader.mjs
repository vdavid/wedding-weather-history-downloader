import fs from 'fs';
import MeteoStatInterface from './MeteoStatInterface.mjs';
import config from './config.mjs';

export default class DataDownloader {
    constructor(weatherDataFolderPath, meteoStatInterface) {
        this.weatherDataFolderPath = weatherDataFolderPath;
        this.meteoStatInterface = meteoStatInterface || new MeteoStatInterface();
    }

    async downloadData(startYear, endYear) {
        const losiMajorCoordinates = {
            latitude: 47.8326126,
            longitude: 19.0728598,
            altitudeInMeters: 160,
        };

        for(let year = startYear; year <= endYear; year++) {
            const meteoStatApiArguments = {
                ...losiMajorCoordinates,
                startDateString: `${year}-09-01`,
                endDateString: `${year}-09-30`,
            };
            const response = await this.meteoStatInterface.callApi(meteoStatApiArguments, config.apiKey);
            await this.writeResultToFile(meteoStatApiArguments.startDateString, meteoStatApiArguments.endDateString, response, this.weatherDataFolderPath);
        }
    }

    async writeResultToFile(startDateString, endDateString, response, folderPath) {
        const fileName = `${folderPath}${startDateString}_${endDateString}.json`;
        await fs.promises.writeFile(fileName, JSON.stringify(response));
    }}