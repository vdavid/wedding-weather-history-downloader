import fs from 'fs';

export default class DataParser {
    constructor(weatherDataFolderPath) {
        this.weatherDataFolderPath = weatherDataFolderPath;
    }
    async parseData(startYear, endYear) {
        const years = Array.from(new Array(endYear - startYear + 1), (_item, key) => startYear + key);
        const weatherDataForYears = await Promise.all(years.map(year => this.loadWeatherData(year)));
        await this.parseOneAspect(years, weatherDataForYears, this.temperatureMinimumMapper.bind(this), 'data/temperatureMinimums.csv');
        await this.parseOneAspect(years, weatherDataForYears, this.temperatureMaximumMapper.bind(this), 'data/temperatureMaximums.csv');
        await this.parseOneAspect(years, weatherDataForYears, this.temperatureDaytimeAverageMapper.bind(this), 'data/temperatureDaytimeAverage.csv');
        await this.parseOneAspect(years, weatherDataForYears, this.rainfallMapper.bind(this), 'data/rainfall.csv');
        await this.parseOneAspect(years, weatherDataForYears, this.windSpeedAverageMapper.bind(this), 'data/windSpeedAverage.csv');
        await this.parseOneAspect(years, weatherDataForYears, this.windSpeedMaximumMapper.bind(this), 'data/windSpeedMaximum.csv');
    }

    async parseOneAspect(years, weatherDataForYears, mapper, fileName) {
        const data = await Promise.all(years.map((year, index) => this.getDataForYear(year, weatherDataForYears[index], mapper.bind(this))));
        await this.writeData(data, years, fileName);
    }

    async writeData(data, years, filePath) {
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

    async getDataForYear(year, weatherData, mapperFunction) {
        const entries = weatherData.data;
        const days = {};
        entries.forEach(entry => {
            const dateString = entry.time.substring(0, 10);
            days[dateString] = days[dateString] || [];
            days[dateString].push(entry)
        });
        return Object.values(days).map(mapperFunction);
    }

    temperatureMinimumMapper(entries) {
        return entries.reduce((minimum, entry) => ((entry.temp !== null) && (entry.temp < minimum)) ? entry.temp : minimum, Infinity);
    }

    temperatureMaximumMapper(entries) {
        return entries.reduce((maximum, entry) => ((entry.temp !== null) && (entry.temp > maximum)) ? entry.temp : maximum, -Infinity);
    }

    temperatureDaytimeAverageMapper(entries) {
        const count = entries.slice(9, 21).filter(entry => entry.temp !== null).length;
        return entries.slice(9, 21).reduce((sum, entry) => sum + entry.temp, 0) / count;
    }

    windSpeedAverageMapper(entries) {
        const count = entries.filter(entry => entry.wspd !== null).length;
        return entries.reduce((sum, entry) => sum + entry.wspd, 0) / count;
    }

    rainfallMapper(entries) {
        return entries.reduce((rainfall, entry) => rainfall + entry.prcp, 0);
    }

    windSpeedMaximumMapper(entries) {
        return entries.reduce((maximum, entry) => ((entry.wspd !== null) && (entry.wspd > maximum)) ? entry.wspd : maximum, -Infinity);
    }

    async loadWeatherData(year) {
        const filePath = `${this.weatherDataFolderPath}${year}-09-01_${year}-09-30.json`;
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    }

}