// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next';
import DataParser from '../../DataParser';
import config from '../../config';

type Response = {
    success: boolean,
    message: string,
}

export default async function handler(request: NextApiRequest, response: NextApiResponse<Response>) {
    /* Parse input */
    const startYear = parseInt(typeof request.query.startYear === 'string' ? request.query.startYear : request.query.startYear[0]);
    const endYear = parseInt(typeof request.query.endYear === 'string' ? request.query.endYear : request.query.endYear[0]);

    /* Do the parsing */
    if (startYear < 1979) {
        response.status(400).json({success: false, message: 'Start year must be 1979 or later.'});
    } else if (endYear > new Date().getFullYear()) {
        response.status(400).json({success: false, message: 'End year must be less than or equal to current year.'});
    } else if (endYear < startYear) {
        response.status(400).json({success: false, message: 'End year must be greater than start year.'});
    } else {
        try {
            const dataParser = new DataParser(config.weatherDataFolderPath);
            await dataParser.parseData(startYear, endYear);

            /* Send output */
            response.status(200).json({success: true, message: `Parsed data for ${endYear - startYear + 1} years.`});
        } catch (error: any) {
            response.status(500).json({success: false, message: error.message});
        }
    }
}
