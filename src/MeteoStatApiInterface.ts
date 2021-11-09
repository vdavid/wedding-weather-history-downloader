/*
 * Docs (elaborate): https://dev.meteostat.net/api/point/hourly.html#endpoint
 * Docs (fancy): https://rapidapi.com/meteostat/api/meteostat/
 */

import https, {RequestOptions} from 'https';
import {MeteoStatApiArguments, MeteoStatRawApiResponse} from './types/MeteoStatTypes';

export default class MeteoStatApiInterface {
    async callPointHourlyApi(apiKey: string, meteoStatApiArguments: MeteoStatApiArguments): Promise<MeteoStatRawApiResponse> {
        const queryString = MeteoStatApiInterface.assembleQueryStringForHourlyPointApiEndpoint(meteoStatApiArguments);
        const options = {
            method: 'GET',
            hostname: 'meteostat.p.rapidapi.com',
            port: null,
            path: `/point/hourly?${queryString}`,
            headers: {
                'x-rapidapi-host': 'meteostat.p.rapidapi.com',
                'x-rapidapi-key': apiKey,
            },
        };
        const responseString = await this.makeRemoteCall(options);
        return JSON.parse(responseString);
    }

    private static assembleQueryStringForHourlyPointApiEndpoint(meteoStatApiArguments: MeteoStatApiArguments): string {
        return MeteoStatApiInterface.buildQueryArgumentsString({
            lat: meteoStatApiArguments.latitude,
            lon: meteoStatApiArguments.longitude,
            ...((meteoStatApiArguments.altitudeInMeters !== undefined) ? {alt: meteoStatApiArguments.altitudeInMeters} : {}),
            start: meteoStatApiArguments.startDateString,
            end: meteoStatApiArguments.endDateString,
            ...((meteoStatApiArguments.timeZone !== undefined) ? {tz: meteoStatApiArguments.timeZone} : {}),
            ...((meteoStatApiArguments.useModel !== undefined) ? {model: meteoStatApiArguments.useModel} : {}),
            ...((meteoStatApiArguments.frequency !== undefined) ? {freq: meteoStatApiArguments.frequency} : {}),
            ...((meteoStatApiArguments.units !== undefined) ? {units: meteoStatApiArguments.units} : {}),
        });
    }

    private static buildQueryArgumentsString(queryArguments: { [p: string]: string | number | boolean }): string {
        return Object.entries(queryArguments).map(([key, value]) => `${key}=${value}`).join('&');
    }

    private makeRemoteCall(options: RequestOptions): Promise<string> {
        return new Promise((resolve, reject) => {
            const request = https.request(options, (response) => {
                const chunks: any[] = [];

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