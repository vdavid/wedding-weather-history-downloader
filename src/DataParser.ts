import fs from 'fs';
import {MeteoStatApiRawResponseDailyData, MeteoStatRawApiResponse} from './types/MeteoStatTypes';

export default class DataParser {
    private readonly weatherDataFolderPath: string;

    constructor(weatherDataFolderPath: string) {
        this.weatherDataFolderPath = weatherDataFolderPath;
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

    async parseOneAspect(years: number[], weatherDataForYears: MeteoStatRawApiResponse[], aggregatorFunction: DayAggregator, fileName: string): Promise<void> {
        const data: number[][] = await Promise.all(years.map((year, index) => this.getDataForYear(year, weatherDataForYears[index], aggregatorFunction.bind(this))));
        await this.writeData(data, years, fileName);
    }

    async writeData(data: number[][], years: number[], filePath: string): Promise<void> {
        const days = Array.from(new Array(30), (_item, key) => key + 1);
        const csvColumnHeaders = ['', ...days].join(',');
        const csvRows: string[] = data.reduce((result: string[], row) => {
            result.push(row.join(','));
            return result;
        }, []);
        const csvRowsWithRowHeaders = csvRows.map((row, index) => `${years[index]},${row}`);
        const csvData = csvRowsWithRowHeaders.join('\n');

        await fs.promises.writeFile(filePath, csvColumnHeaders + '\n' + csvData);
    }

    async getDataForYear(year: number, weatherData: MeteoStatRawApiResponse, mapperFunction: DayAggregator): Promise<number[]> {
        const entries = weatherData.data;
        const days: {[key: string]: MeteoStatApiRawResponseDailyData[]} = {};
        entries.forEach(entry => {
            const dateString = entry.time.substring(0, 10);
            days[dateString] = days[dateString] || [];
            days[dateString].push(entry)
        });
        return Object.values(days).map(mapperFunction);
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

    async loadWeatherData(year: number): Promise<MeteoStatRawApiResponse> {
        const filePath = `${this.weatherDataFolderPath}${year}-09-01_${year}-09-30.json`;
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    }

}

type DayAggregator = (entries: MeteoStatApiRawResponseDailyData[]) => number;