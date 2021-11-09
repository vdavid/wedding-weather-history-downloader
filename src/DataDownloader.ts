import fs from 'fs';
import MeteoStatApiInterface from './MeteoStatApiInterface';
import config from './config';
import {MeteoStatApiArguments, MeteoStatRawApiResponse} from './types/MeteoStatTypes';

export default class DataDownloader {
    private readonly weatherDataFolderPath: string;
    private readonly meteoStatApiInterface: MeteoStatApiInterface;

    constructor(weatherDataFolderPath: string, meteoStatApiInterface?: MeteoStatApiInterface) {
        this.weatherDataFolderPath = weatherDataFolderPath;
        this.meteoStatApiInterface = meteoStatApiInterface || new MeteoStatApiInterface();
    }

    async downloadDataAndSaveToFile({startYear, endYear, latitude, longitude, altitudeInMeters}: { startYear: number, endYear: number, latitude: number, longitude: number, altitudeInMeters?: number }): Promise<void> {
        /* Ensure that the data folder exists */
        await fs.promises.mkdir(this.weatherDataFolderPath, {recursive: true});

        /* Download the data for each year and save it to files. */
        for (let year = startYear; year <= endYear; year++) {
            const meteoStatApiArguments: MeteoStatApiArguments = {
                latitude,
                longitude,
                altitudeInMeters,
                startDateString: `${year}-09-01`,
                endDateString: `${year}-09-30`,
                timeZone: 'CET',
                useModel: false,
                frequency: 'H',
                units: 'metric',
            };
            const response = await this.meteoStatApiInterface.callPointHourlyApi(config.apiKey, meteoStatApiArguments);
            await DataDownloader.writeResultToFile(meteoStatApiArguments.startDateString, meteoStatApiArguments.endDateString, response, this.weatherDataFolderPath);
        }
    }

    private static async writeResultToFile(startDateString: string, endDateString: string, response: MeteoStatRawApiResponse, folderPath: string): Promise<void> {
        const fileName = `${folderPath}${startDateString}_${endDateString}.json`;
        await fs.promises.writeFile(fileName, JSON.stringify(response));
    }
}