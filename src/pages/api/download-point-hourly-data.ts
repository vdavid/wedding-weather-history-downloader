// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next';
import DataDownloader from '../../DataDownloader';
import config from '../../config';

type Response = {
    success: boolean
    message: string
}

export default async function handler(request: NextApiRequest, response: NextApiResponse<Response>) {
    /* Parse input */
    const startYear = parseNumberInput(request.body.startYear);
    const endYear = parseNumberInput(request.body.endYear);
    const latitude = parseNumberInput(request.body.latitude);
    const longitude = parseNumberInput(request.body.longitude);
    const altitudeInMeters = parseNumberInput(request.body.altitudeInMeters);

    /* Check input */
    if (startYear === undefined || endYear === undefined || latitude === undefined || longitude === undefined || altitudeInMeters === undefined) {
        response.status(400).json({success: false, message: 'Missing required input.'});
    } else if (startYear < 1979) {
        response.status(400).json({success: false, message: 'Start year must be 1979 or later.'});
    } else if (endYear > new Date().getFullYear()) {
        response.status(400).json({success: false, message: 'End year must be less than or equal to current year.'});
    } else if (endYear < startYear) {
        response.status(400).json({success: false, message: 'End year must be greater than start year.'});
    } else if (latitude < -90 || latitude > 90) {
        response.status(400).json({success: false, message: 'Latitude must be between -90 and 90.'});
    } else if (longitude < -180 || longitude > 180) {
        response.status(400).json({success: false, message: 'Longitude must be between -180 and 180.'});
    } else if (altitudeInMeters < 0 || altitudeInMeters > 10000) {
        response.status(400).json({success: false, message: 'Altitude must be between 0 and 10000.'});
    } else {
        try {
            /* Perform download and saving to file */
            const dataDownloader = new DataDownloader(config.weatherDataFolderPath);
            const requestCount = await dataDownloader.downloadDataAndSaveToFile(
                {startYear, endYear, latitude, longitude, altitudeInMeters});

            /* Send output */
            response.status(200).json({success: true, message: `Downloaded data for ${endYear - startYear + 1} years in ${requestCount} requests.`});
        } catch (error: any) {
            console.log(error);
            response.status(500).json({success: false, message: error.message});
        }
    }
}

function parseNumberInput(input: number | string | string[]): number | undefined {
    return !(input === undefined || input === '') ? (typeof input === 'number' ? input : parseFloat(typeof input === 'string' ? input : input[0])) : undefined;
}
