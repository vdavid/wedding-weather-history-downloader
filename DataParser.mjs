import fs from 'fs';

export default class DataParser {
    async parseData(startYear, endYear) {
        const years = Array.from(new Array(endYear - startYear + 1), (_item, key) => startYear + key);
        const temperatureMinimumData = await Promise.all(years.map(year => this.getDataForYear(year, this.temperatureMinimumMapper.bind(this))));
        await this.writeData(temperatureMinimumData, years, 'data/temperatureMinimums.csv');
        const temperatureMaximumData = await Promise.all(years.map(year => this.getDataForYear(year, this.temperatureMaximumMapper.bind(this))));
        await this.writeData(temperatureMaximumData, years, 'data/temperatureMaximums.csv');
        const rainfallData = await Promise.all(years.map(year => this.getDataForYear(year, this.rainfallMapper.bind(this))));
        await this.writeData(rainfallData, years, 'data/rainfall.csv');
        const windSpeedAverageData = await Promise.all(years.map(year => this.getDataForYear(year, this.windSpeedAverageMapper.bind(this))));
        await this.writeData(windSpeedAverageData, years, 'data/windSpeedAverage.csv');
        const windSpeedMaximumData = await Promise.all(years.map(year => this.getDataForYear(year, this.windSpeedMaximumMapper.bind(this))));
        await this.writeData(windSpeedMaximumData, years, 'data/windSpeedMaximum.csv');
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

    async getDataForYear(year, mapperFunction) {
        const weatherData = await this.loadWeatherData(year);
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

    windSpeedAverageMapper(entries) {
        const count = entries.filter(entry => entry.wspd !== null).length;
        return entries.reduce((windspeed, entry) => windspeed + entry.wspd, 0) / count;
    }

    rainfallMapper(entries) {
        return entries.reduce((rainfall, entry) => rainfall + entry.prcp, 0);
    }

    windSpeedMaximumMapper(entries) {
        return entries.reduce((maximum, entry) => ((entry.wspd !== null) && (entry.wspd > maximum)) ? entry.wspd : maximum, -Infinity);
    }

    async loadWeatherData(year) {
        const filePath = `${weatherDataFolderPath}${year}-09-01_${year}-09-30.json`;
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    }

}