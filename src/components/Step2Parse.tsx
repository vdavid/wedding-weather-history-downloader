import styles from '../../styles/Home.module.css';
import SavedInputWithLabel from './SavedInputWithLabel';
import {MouseEvent, useState} from 'react';

export default function Step2Parse() {
    const [startYear, setStartYear] = useState<string>();
    const [endYear, setEndYear] = useState<string>();
    const [status, setStatus] = useState<string>();

    return <section>
        <h2>Step 2: Parse data</h2>
        <p>Make sure you download the data for the desired years first.</p>
        <fieldset>
            <div className={styles.grid}>
                <SavedInputWithLabel id="step2StartYear" label="Start year" description="Must be between 1979 and the current year." isRequired={true} maxLength={4} onChange={(event) => setStartYear(event.target.value)}/>
                <SavedInputWithLabel id="step2EndYear" label="End year" description="Must be between 1979 and the current year." isRequired={true} maxLength={4} onChange={(event) => setEndYear(event.target.value)}/>
            </div>
            <button onClick={start}>Parse</button>
        </fieldset>
        <div>{status}</div>
    </section>;

    async function start(event: MouseEvent<HTMLButtonElement>) {
        // @ts-ignore
        event.target.disabled = true;
        setStatus('Parsing...');
        const response = await fetch('/api/parse-point-hourly-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startYear: startYear ? parseInt(startYear) : undefined,
                endYear: endYear ? parseInt(endYear) : undefined,
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
            setStatus('Communication error ' + response.status + ': ' + await response.text());
        }
        // @ts-ignore
        event.target.disabled = false;
    }
}