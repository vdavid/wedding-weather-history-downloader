import type {NextPage} from 'next';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import {ChangeEvent, Dispatch, MouseEvent, SetStateAction, useEffect, useState} from 'react';

type StateValueAndSetter = [string | undefined, Dispatch<SetStateAction<string | undefined>>];
const Home: NextPage = () => {
    const step1State: { [key: string]: StateValueAndSetter } = {
        startYear: useState(),
        endYear: useState(),
        latitude: useState(),
        longitude: useState(),
        altitudeInMeters: useState(),
    };

    useEffect(() => {
        step1State.startYear[1](localStorage.getItem('startYear') || undefined);
        step1State.endYear[1](localStorage.getItem('endYear') || undefined);
        step1State.latitude[1](localStorage.getItem('latitude') || undefined);
        step1State.longitude[1](localStorage.getItem('longitude') || undefined);
        step1State.altitudeInMeters[1](localStorage.getItem('altitudeInMeters') || undefined);
    }, []);


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
                            <div>
                                <label htmlFor="startYear"><strong>Start year</strong> (required)</label>
                                <input type="text" id="startYear" maxLength={4} value={step1State.startYear[0]} onChange={saveData}/>
                            </div>
                            <div>
                                <label htmlFor="endYear"><strong>End year</strong> (required)</label>
                                <input type="text" id="endYear" maxLength={4} value={step1State.endYear[0]} onChange={saveData}/>
                            </div>
                            <div>
                                <label htmlFor="latitude"><strong>Latitude</strong> (required)</label>
                                <input type="text" id="latitude" step="any" value={step1State.latitude[0]} onChange={saveData}/>
                            </div>
                            <div>
                                <label htmlFor="longitude"><strong>Longitude</strong> (required)</label>
                                <input type="text" id="longitude" step="any" value={step1State.longitude[0]} onChange={saveData}/>
                            </div>
                            <div>
                                <label htmlFor="altitudeInMeters"><strong>Altitude in meters</strong> (optional)</label>
                                <input type="text" id="altitudeInMeters" maxLength={4} value={step1State.altitudeInMeters[0]} onChange={saveData}/>
                            </div>
                        </div>
                        <button onClick={startDownload}>Download</button>
                    </fieldset>
                    <div id="downloadStatus"/>
                </section>
                <section>
                    <h2>Step 2: Parse data</h2>
                    <fieldset>
                        <div className={styles.grid}>
                            <div>
                                <label htmlFor="startYear"><strong>Start year</strong> (required)</label>
                                <input type="text" id="startYear" maxLength={4} value={step1State.startYear[0]} onChange={saveData}/>
                            </div>
                            <div>
                                <label htmlFor="endYear"><strong>End year</strong> (required)</label>
                                <input type="text" id="endYear" maxLength={4} value={step1State.endYear[0]} onChange={saveData}/>
                            </div>
                            <div>
                                <label htmlFor="latitude"><strong>Latitude</strong> (required)</label>
                                <input type="text" id="latitude" step="any" value={step1State.latitude[0]} onChange={saveData}/>
                            </div>
                            <div>
                                <label htmlFor="longitude"><strong>Longitude</strong> (required)</label>
                                <input type="text" id="longitude" step="any" value={step1State.longitude[0]} onChange={saveData}/>
                            </div>
                            <div>
                                <label htmlFor="altitudeInMeters"><strong>Altitude in meters</strong> (optional)</label>
                                <input type="text" id="altitudeInMeters" maxLength={4} value={step1State.altitudeInMeters[0]} onChange={saveData}/>
                            </div>
                        </div>
                        <button onClick={startDownload}>Download</button>
                    </fieldset>
                </section>
            </main>
        </div>
    );

    function saveData(event: ChangeEvent<HTMLInputElement>) {
        const newValue = event.target.value;
        const fieldName = event.target.getAttribute('id') || 'default';
        localStorage.setItem(fieldName, newValue);
        step1State[fieldName][1](newValue);
    }

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
                startYear: step1State.startYear[0],
                endYear: step1State.endYear[0],
                latitude: step1State.latitude[0],
                longitude: step1State.longitude[0],
                altitudeInMeters: step1State.altitudeInMeters[0],
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
};

export default Home;
