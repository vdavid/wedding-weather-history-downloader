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
    const startYear = parseInt(typeof request.query.startYear === 'string' ? request.query.startYear : request.query.startYear[0]);
    const endYear = parseInt(typeof request.query.endYear === 'string' ? request.query.endYear : request.query.endYear[0]);
    const latitude = parseFloat(typeof request.query.latitude === 'string' ? request.query.latitude : request.query.latitude[0]);
    const longitude = parseFloat(typeof request.query.longitude === 'string' ? request.query.longitude : request.query.longitude[0]);
    const altitudeInMeters = (request.query.altitudeInMeters !== undefined && request.query.altitudeInMeters !== '')
        ? parseInt(typeof request.query.altitudeInMeters === 'string'
            ? request.query.altitudeInMeters : request.query.altitudeInMeters[0]) : undefined;

    /* Check input */
    if (startYear < 1979) {
        response.status(400).json({success: false, message: 'Start year must be 1979 or later.'});
    } else if (endYear > new Date().getFullYear()) {
        response.status(400).json({success: false, message: 'End year must be less than or equal to current year.'});
    } else if (endYear < startYear) {
        response.status(400).json({success: false, message: 'End year must be greater than start year.'});
    } else if (latitude < -90 || latitude > 90) {
        response.status(400).json({success: false, message: 'Latitude must be between -90 and 90.'});
    } else if (longitude < -180 || longitude > 180) {
        response.status(400).json({success: false, message: 'Longitude must be between -180 and 180.'});
    } else if (altitudeInMeters !== undefined && (altitudeInMeters < 0 || altitudeInMeters > 10000)) {
        response.status(400).json({success: false, message: 'Altitude must be between 0 and 10000.'});
    } else {
        try {
            /* Perform download and saving to file */
            const dataDownloader = new DataDownloader(config.weatherDataFolderPath);
            await dataDownloader.downloadDataAndSaveToFile(
                {startYear, endYear, latitude, longitude, altitudeInMeters});

            /* Send output */
            response.status(200).json({success: true, message: `Downloaded data for ${endYear - startYear + 1} years.`});
        } catch (error: any) {
            response.status(500).json({success: false, message: error.message});
        }
    }
}
