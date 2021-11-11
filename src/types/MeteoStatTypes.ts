/*
 * Docs (elaborate): https://dev.meteostat.net/api/point/hourly.html#endpoint
 * Docs (fancy): https://rapidapi.com/meteostat/api/meteostat/
 */

export type MeteoStatApiArguments = {
    latitude: number;
    longitude: number;
    altitudeInMeters?: number;
    startDateString: string;
    endDateString: string;
    timeZone?: string;
    useModel?: boolean;
    frequency?: string;
    units?: string;
};

export type MeteoStatRawApiResponse = {
    meta: MeteoStatRawApiResponseMetadata;
    data: MeteoStatApiRawResponseDailyData[];
};

export type MeteoStatRawApiResponseMetadata = {
    generated: string,
    stations: string[],
};

// noinspection SpellCheckingInspection
export type MeteoStatApiRawResponseDailyData = {
    time: string; /* Time (YYYY-MM-DD hh:mm:ss) of observation – String */
    temp: number; /* The air temperature in °C – Float */
    dwpt: number; /* The dew point in °C – Float */
    rhum: number; /* The relative humidity in percent (%) – Integer */
    prcp: number; /* The one hour precipitation total in mm – Float */
    snow: number; /* The snow depth in mm – Integer */
    wdir: number; /* The wind direction in degrees (°) – Integer */
    wspd: number; /* The average wind speed in km/h – Float */
    wpgt: number; /* The peak wind gust in km/h – Float */
    pres: number; /* The sea-level air pressure in hPa – Float */
    tsun: number; /* The one hour sunshine total in minutes (m) – Integer */
    coco: number; /* The weather condition code – Integer */
};