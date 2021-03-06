import styles from '../../styles/Home.module.css';
import SavedInputWithLabel from './SavedInputWithLabel';
import {MouseEvent, useState} from 'react';
import config from '../config';

export default function Step1Download() {
    const [startYear, setStartYear] = useState<string>();
    const [endYear, setEndYear] = useState<string>();
    const [latitude, setLatitude] = useState<string>();
    const [longitude, setLongitude] = useState<string>();
    const [altitudeInMeters, setAltitudeInMeters] = useState<string>();
    const [status, setStatus] = useState<string>();
    const requestCount = (startYear && endYear) ? Math.max(0, (parseInt(endYear) - parseInt(startYear) + 1) * 13) : 0;

    return <section>
        <h2>Step 1: Download data</h2>
        <p>Data will be saved to the file system, so it won’t need to be downloaded again until you change the location or altitude.<br />
            Data for each year are stored in separate files, and previously downloaded data won‘t be deleted, so you can mix and match the years you need.</p>
        <fieldset>
            <div className={styles.grid}>
                <SavedInputWithLabel id="step1StartYear" label="Start year" description="Must be between 1979 and the current year." isRequired={true} maxLength={4} onChange={(event) => setStartYear(event.target.value)}/>
                <SavedInputWithLabel id="step1EndYear" label="End year" description="Must be between 1979 and the current year." isRequired={true} maxLength={4} onChange={(event) => setEndYear(event.target.value)}/>
                <SavedInputWithLabel id="step1Latitude" label="Latitude" description="In degrees. Must be between -90 and 90." isRequired={true} onChange={(event) => setLatitude(event.target.value)}/>
                <SavedInputWithLabel id="step1Longitude" label="Longitude" description="In degrees. Must be between -180 and 180." isRequired={true} onChange={(event) => setLongitude(event.target.value)}/>
                <SavedInputWithLabel id="step1AltitudeInMeters" label="Altitude" description="In meters, below 10,000." isRequired={false} maxLength={4} onChange={(event) => setAltitudeInMeters(event.target.value)}/>
            </div>
            <p>{requestCount
                ? <>{requestCount} requests will be made in an estimated {Math.floor(requestCount / (config.maximumRequestsPerSecond - 1))} seconds.< br/>
                {requestCount > 250 ? <>Note that there are 500 requests / month in the free plan.<br /></> : null}
                    <a href="https://rapidapi.com/developer/dashboard" target="_blank">See how many requests you have left.</a></>
                : 'Wrong years given.'}</p>
            <button onClick={start}>Download</button>
        </fieldset>
        <div>{status}</div>
    </section>;

    async function start(event: MouseEvent<HTMLButtonElement>) {
        // @ts-ignore
        event.target.disabled = true;
        setStatus('Downloading...');
        const response = await fetch('/api/download-point-hourly-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startYear: startYear ? parseInt(startYear) : undefined,
                endYear: endYear ? parseInt(endYear) : undefined,
                latitude: latitude ? parseInt(latitude) : undefined,
                longitude: longitude ? parseInt(longitude) : undefined,
                altitudeInMeters: altitudeInMeters ? parseInt(altitudeInMeters) : undefined,
            }),
        });
        if (response.ok) {
            const responseObject = await response.json();
            if (responseObject.success) {
                setStatus(responseObject.message);
            } else {
                setStatus('Back-end error: ' + responseObject.message);
            }
        } else {
            setStatus('Communication error: ' + response.status);
        }
        // @ts-ignore
        event.target.disabled = false;
    }
}