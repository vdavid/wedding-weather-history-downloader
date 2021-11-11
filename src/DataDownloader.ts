import fs from 'fs';
import config from './config';
import MeteoStatApiInterface from './MeteoStatApiInterface';
import {MeteoStatApiArguments, MeteoStatRawApiResponse} from './types/MeteoStatTypes';

export default class DataDownloader {
    private readonly weatherDataFolderPath: string;
    private readonly meteoStatApiInterface: MeteoStatApiInterface;

    constructor(weatherDataFolderPath: string, meteoStatApiInterface?: MeteoStatApiInterface) {
        this.weatherDataFolderPath = weatherDataFolderPath;
        this.meteoStatApiInterface = meteoStatApiInterface || new MeteoStatApiInterface();
    }

    async downloadDataAndSaveToFile({startYear, endYear, latitude, longitude, altitudeInMeters}:
                                        {
                                            startYear: number,
                                            endYear: number,
                                            latitude: number,
                                            longitude: number,
                                            altitudeInMeters?: number,
                                        }): Promise<number> {
        let requestCount = 0;

        /* Ensure that the data folder exists */
        await fs.promises.mkdir(this.weatherDataFolderPath, {recursive: true});

        /* Download the data for each year and save it to files. */
        for (let year = startYear; year <= endYear; year++) {
            const lastDayIndex = DataDownloader.getDaysInYear(year) - 1;
            const responsesForYear = [];
            /* Download in 30-day chunks, as that's the maximum for the API. */
            for (let dayIndex = 0; dayIndex <= lastDayIndex; dayIndex += 30) {
                const meteoStatApiArguments: MeteoStatApiArguments = {
                    latitude,
                    longitude,
                    altitudeInMeters,
                    startDateString: DataDownloader.getIsoDateStringFromDate(DataDownloader.createDateFromYearAndDay(year, dayIndex)),
                    endDateString: DataDownloader.getIsoDateStringFromDate(DataDownloader.createDateFromYearAndDay(year, Math.min(dayIndex + 29, lastDayIndex))),
                    timeZone: 'CET',
                    useModel: false,
                    frequency: 'H',
                    units: 'metric',
                };

                /* Better safe than sorry, give 500ms for a call rather than 333ms to surely not get rejected by the API limit. */
                const millisecondsForRequest = 1000 / (config.maximumRequestsPerSecond - 2);
                const startDateTimeInMilliseconds = new Date().getTime();
                responsesForYear.push(await this.meteoStatApiInterface.callPointHourlyApi(config.apiKey, meteoStatApiArguments));
                requestCount++;
                const elapsedMilliseconds = new Date().getTime() - startDateTimeInMilliseconds;
                const millisecondsToWait = Math.max(0, millisecondsForRequest - elapsedMilliseconds);
                await new Promise(resolve => setTimeout(resolve, millisecondsToWait));
            }

            /* Merge all data for the year in one common object */
            const mergedResponse: MeteoStatRawApiResponse = responsesForYear.reduce((mergedResponse, response) => {
                mergedResponse.data = [...mergedResponse.data, ...response.data];
                return mergedResponse;
            }, {meta: responsesForYear[0].meta, data: []});

            /* Write the object to a file */
            await DataDownloader.writeResultToFile(year, mergedResponse,
                this.weatherDataFolderPath);
        }

        return requestCount;
    }

    private static async writeResultToFile(year: number, response: MeteoStatRawApiResponse, folderPath: string): Promise<void> {
        const fileName = `${folderPath}${year}-01-01_${year}-12-31.json`;
        await fs.promises.writeFile(fileName, JSON.stringify(response));
    }

    private static getIsoDateStringFromDate(date: Date) {
        return date.getFullYear()+'-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0')
    }

    private static createDateFromYearAndDay(year: number, dayIndex: number) {
        return new Date(year, 0, dayIndex + 1);
    }

    private static getDaysInYear(year: number): number {
        return (new Date(year + 1, 0, 0).getTime() - new Date(year, 0, 0).getTime()) / 1000 / 60 / 60 / 24
    }
}