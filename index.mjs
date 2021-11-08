import fs from 'fs';
import config from './config.mjs';
import MeteoStatInterface from './MeteoStatInterface.mjs';

const meteoStatInterface = new MeteoStatInterface();

const losiMajorCoordinates = {
    latitude: 47.8326126,
    longitude: 19.0728598,
    altitudeInMeters: 160,
};

for(let year = 1980; year <= 2019; year++) {
    const meteoStatApiArguments = {
        ...losiMajorCoordinates,
        startDateString: `${year}-09-01`,
        endDateString: `${year}-09-30`,
    };
    const response = await meteoStatInterface.callApi(meteoStatApiArguments, config.apiKey);
    await writeResultToFile(meteoStatApiArguments.startDateString, meteoStatApiArguments.endDateString, response);
}

async function writeResultToFile(startDateString, endDateString, response) {
    const fileName = `data/raw-weather-data/${startDateString}_${endDateString}.json`;
    await fs.promises.writeFile(fileName, JSON.stringify(response));
}