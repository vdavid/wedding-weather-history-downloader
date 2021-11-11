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
    const startYear = parseNumberInput(request.body.startYear);
    const endYear = parseNumberInput(request.body.endYear);

    /* Do the parsing */
    if (startYear === undefined || endYear === undefined) {
        response.status(400).json({success: false, message: 'Missing required input.'});
    } else if (startYear < 1979) {
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
            console.log(error);
            response.status(500).json({success: false, message: error.message});
        }
    }
}

function parseNumberInput(input: number | string | string[]): number | undefined {
    return !(input === undefined || input === '') ? (typeof input === 'number' ? input : parseFloat(typeof input === 'string' ? input : input[0])) : undefined;
}
