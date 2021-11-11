import type {NextPage} from 'next';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import {MouseEvent, useState} from 'react';
import SavedInputWithLabel from '../components/SavedInputWithLabel';

const Home: NextPage = () => {
    const [step1StartYear, setStep1StartYear] = useState<string>();
    const [step1EndYear, setStep1EndYear] = useState<string>();
    const [step1Latitude, setStep1Latitude] = useState<string>();
    const [step1Longitude, setStep1Longitude] = useState<string>();
    const [step1AltitudeInMeters, setStep1AltitudeInMeters] = useState<string>();
    const [step2StartYear, setStep2StartYear] = useState<string>();
    const [step2EndYear, setStep2EndYear] = useState<string>();

    return (
        <div className={styles.container}>
            <Head>
                <title>Weather history downloader</title>
                <meta name="description" content="For downloading historical weather data"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Weather history downloader</h1>
                <section>
                    <h2>Step 1: Download data</h2>
                    <fieldset>
                        <div className={styles.grid}>
                            <SavedInputWithLabel id='step1StartYear' label='Start year' isRequired={true} maxLength={4} onChange={(event) => setStep1StartYear(event.target.value)} />
                            <SavedInputWithLabel id='step1EndYear' label='End year' isRequired={true} maxLength={4} onChange={(event) => setStep1EndYear(event.target.value)} />
                            <SavedInputWithLabel id='step1Latitude' label='Latitude' isRequired={true} onChange={(event) => setStep1Latitude(event.target.value)} />
                            <SavedInputWithLabel id='step1Longitude' label='Longitude' isRequired={true} onChange={(event) => setStep1Longitude(event.target.value)} />
                            <SavedInputWithLabel id='step1AltitudeInMeters' label='Altitude in meters' isRequired={false} maxLength={4} onChange={(event) => setStep1AltitudeInMeters(event.target.value)} />
                        </div>
                        <button onClick={startDownload}>Download</button>
                    </fieldset>
                    <div id="downloadStatus"/>
                </section>
                <section>
                    <h2>Step 2: Parse data</h2>
                    <fieldset>
                        <div className={styles.grid}>
                            <SavedInputWithLabel id='step2StartYear' label='Start year' isRequired={true} maxLength={4} onChange={(event) => setStep2StartYear(event.target.value)} />
                            <SavedInputWithLabel id='step2EndYear' label='End year' isRequired={true} maxLength={4} onChange={(event) => setStep2EndYear(event.target.value)} />
                        </div>
                        <button onClick={startParsing}>Parse</button>
                    </fieldset>
                    <div id="parsingStatus"/>
                </section>
            </main>
        </div>
    );

    async function startDownload(event: MouseEvent<HTMLButtonElement>) {
        // @ts-ignore
        event.target.disabled = true;
        document.getElementById('downloadStatus')!.innerText = 'Downloading...';
        const response = await fetch('/api/download-point-hourly-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startYear: step1StartYear ? parseInt(step1StartYear) : undefined,
                endYear: step1EndYear ? parseInt(step1EndYear) : undefined,
                latitude: step1Latitude ? parseInt(step1Latitude) : undefined,
                longitude: step1Longitude ? parseInt(step1Longitude) : undefined,
                altitudeInMeters: step1AltitudeInMeters ? parseInt(step1AltitudeInMeters) : undefined,
            })
        });
        if (response.ok) {
            const responseObject = await response.json();
            if (responseObject.success) {
                document.getElementById('downloadStatus')!.innerText = responseObject.message;
            } else {
                document.getElementById('downloadStatus')!.innerText = 'Back-end error: ' + responseObject.message;
            }
        } else {
            document.getElementById('downloadStatus')!.innerText = 'Communication error: ' + response.status;
        }
        // @ts-ignore
        event.target.disabled = false;
    }

    async function startParsing(event: MouseEvent<HTMLButtonElement>) {
        // @ts-ignore
        event.target.disabled = true;
        document.getElementById('parsingStatus')!.innerText = 'Parsing...';
        const response = await fetch('/api/parse-point-hourly-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startYear: step2StartYear ? parseInt(step2StartYear) : undefined,
                endYear: step2EndYear ? parseInt(step2EndYear) : undefined,
            })
        });
        if (response.ok) {
            const responseObject = await response.json();
            if (responseObject.success) {
                document.getElementById('parsingStatus')!.innerText = responseObject.message;
            } else {
                document.getElementById('parsingStatus')!.innerText = 'Back-end error: ' + responseObject.message;
            }
        } else {
            document.getElementById('parsingStatus')!.innerText = 'Communication error ' + response.status + ': ' + await response.text();
        }
        // @ts-ignore
        event.target.disabled = false;
    }
};

export default Home;
