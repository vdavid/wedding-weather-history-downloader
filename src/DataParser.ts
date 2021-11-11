import fs from 'fs';
import {MeteoStatApiRawResponseDailyData, MeteoStatRawApiResponse} from './types/MeteoStatTypes';

export default class DataParser {
    private readonly weatherDataFolderPath: string;
    private readonly startDayIndex: number;
    private readonly endDayIndex: number;

    constructor(weatherDataFolderPath: string, startDayIndex: number, endDayIndex: number) {
        this.weatherDataFolderPath = weatherDataFolderPath;
        this.startDayIndex = startDayIndex;
        this.endDayIndex = endDayIndex;
    }

    async parseData(startYear: number, endYear: number): Promise<void> {
        const years = Array.from(new Array(endYear - startYear + 1), (_item, key) => startYear + key);
        const weatherDataForYears = await Promise.all(years.map(year => this.loadWeatherData(year)));
        await this.parseOneAspect(years, weatherDataForYears, this.getMinimumTemperature.bind(this), 'data/temperatureMinimums.csv');
        await this.parseOneAspect(years, weatherDataForYears, this.getMaximumTemperature.bind(this), 'data/temperatureMaximums.csv');
        await this.parseOneAspect(years, weatherDataForYears, this.getDaytimeAverageTemperature.bind(this), 'data/temperatureDaytimeAverage.csv');
        await this.parseOneAspect(years, weatherDataForYears, this.getRainfall.bind(this), 'data/rainfall.csv');
        await this.parseOneAspect(years, weatherDataForYears, this.getWindSpeedAverage.bind(this), 'data/windSpeedAverage.csv');
        await this.parseOneAspect(years, weatherDataForYears, this.getMaximumWindSpeed.bind(this), 'data/windSpeedMaximum.csv');
    }

    private async parseOneAspect(years: number[], weatherDataForYears: MeteoStatRawApiResponse[], aggregatorFunction: DayAggregator, fileName: string): Promise<void> {
        const dataPerYearPerDay: number[][] = await Promise.all(years.map((year, index) => this.aggregateDataForDays(weatherDataForYears[index], aggregatorFunction.bind(this))));
        await this.writeData(dataPerYearPerDay, years, fileName);
    }

    private async writeData(dataPerYearPerDay: number[][], years: number[], filePath: string): Promise<void> {
        const dayIndexes = Array.from(new Array(this.endDayIndex - this.startDayIndex + 1), (_item, key) => this.startDayIndex + key);
        const csvColumnHeaders = ['', ...dayIndexes.map(dayIndex => DataParser.getIsoDateStringFromDate(DataParser.createDateFromYearAndDay(years[0], dayIndex + 1)).slice(5))].join(',');
        const csvRows: string[] = dataPerYearPerDay.reduce((result: string[], row) => {
            result.push(row.join(','));
            return result;
        }, []);
        const csvRowsWithRowHeaders = csvRows.map((row, index) => `${years[index]},${row}`);
        const csvData = csvRowsWithRowHeaders.join('\n');

        await fs.promises.writeFile(filePath, csvColumnHeaders + '\n' + csvData);
    }

    private async aggregateDataForDays(weatherData: MeteoStatRawApiResponse, mapperFunction: DayAggregator): Promise<number[]> {
        /* Group entries by days */
        const days: {[key: string]: MeteoStatApiRawResponseDailyData[]} = {};
        weatherData.data.forEach(entry => {
            const dateString = entry.time.substring(0, 10);
            days[dateString] = days[dateString] || [];
            days[dateString].push(entry)
        });
        const requiredDays = DataParser.sliceObject(days, this.startDayIndex, this.endDayIndex + 1);

        /* Aggregate entries for each day */
        return Object.values(requiredDays).map(mapperFunction);
    }

    private getMinimumTemperature: DayAggregator = (entries) => {
        return entries.reduce((minimum, entry) => ((entry.temp !== null) && (entry.temp < minimum)) ? entry.temp : minimum, Infinity);
    }

    private getMaximumTemperature: DayAggregator = (entries) => {
        return entries.reduce((maximum, entry) => ((entry.temp !== null) && (entry.temp > maximum)) ? entry.temp : maximum, -Infinity);
    }

    private getDaytimeAverageTemperature: DayAggregator = (entries) => {
        const count = entries.slice(9, 21).filter(entry => entry.temp !== null).length;
        return entries.slice(9, 21).reduce((sum, entry) => sum + entry.temp, 0) / count;
    }

    private getWindSpeedAverage: DayAggregator = (entries) => {
        const count = entries.filter(entry => entry.wspd !== null).length;
        return entries.reduce((sum, entry) => sum + entry.wspd, 0) / count;
    }

    private getRainfall: DayAggregator = (entries) => {
        return entries.reduce((rainfall, entry) => rainfall + entry.prcp, 0);
    }

    private getMaximumWindSpeed: DayAggregator = (entries) => {
        return entries.reduce((maximum, entry) => ((entry.wspd !== null) && (entry.wspd > maximum)) ? entry.wspd : maximum, -Infinity);
    }

    private async loadWeatherData(year: number): Promise<MeteoStatRawApiResponse> {
        const filePath = `${this.weatherDataFolderPath}${year}-01-01_${year}-12-31.json`;
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    }

    private static createDateFromYearAndDay(year: number, dayIndex: number) {
        return new Date(year, 0, dayIndex);
    }

    private static sliceObject<T>(object: {[key: string]: T}, startIndex: number, endIndex: number): {[key: string]: T} {
        return Object.keys(object).slice(startIndex, endIndex).reduce<{[key: string]: T}>((result, key) => {
            result[key] = object[key];

            return result;
        }, {});
    }

    private static getIsoDateStringFromDate(date: Date) {
        return date.getFullYear()+'-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0')
    }
}

type DayAggregator = (entries: MeteoStatApiRawResponseDailyData[]) => number;