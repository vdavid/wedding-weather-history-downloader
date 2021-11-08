/*
 * Docs (elaborate): https://dev.meteostat.net/api/point/hourly.html#endpoint
 * Docs (fancy): https://rapidapi.com/meteostat/api/meteostat/
 */

import https from 'https';

export default class MeteoStatInterface {
    async callApi(meteoStatApiArguments, apiKey) {
        const queryString = this.assembleQueryStringForHourlyPointApiEndpoint(meteoStatApiArguments);
        const options = {
            method: 'GET',
            hostname: 'meteostat.p.rapidapi.com',
            port: null,
            path: `/point/hourly?${queryString}`,
            headers: {
                'x-rapidapi-host': 'meteostat.p.rapidapi.com',
                'x-rapidapi-key': apiKey,
                'useQueryString': true,
            },
        };
        const responseString = await this.makeRemoteCall(options);
        return JSON.parse(responseString);
    }

    assembleQueryStringForHourlyPointApiEndpoint({
                                                     latitude,
                                                     longitude,
                                                     altitudeInMeters,
                                                     startDateString,
                                                     endDateString,
                                                     timeZone = 'CET',
                                                     useModel = false,
                                                     frequency = 'H',
                                                     units = 'metric',
                                                 }) {
        const queryArguments = {
            lat: latitude,
            lon: longitude,
            alt: altitudeInMeters,
            start: startDateString,
            end: endDateString,
            tz: timeZone,
            model: useModel,
            freq: frequency,
            units: units,
        };
        return this.buildQueryArgumentsString(queryArguments);
    }

    buildQueryArgumentsString(queryArguments) {
        return Object.entries(queryArguments).map(([key, value]) => `${key}=${value}`).join('&');
    }

    makeRemoteCall(options) {
        return new Promise((resolve, reject) => {
            const request = https.request(options, (response) => {
                const chunks = [];

                response.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                response.on('end', () => {
                    const body = Buffer.concat(chunks);
                    resolve(body.toString());
                });

                response.on('error', (error) => {
                    reject(error);
                });
            });
            request.end();
        });
    }

}