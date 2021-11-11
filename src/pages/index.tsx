import type {NextPage} from 'next';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Step1Download from '../components/Step1Download';
import Step2Parse from '../components/Step2Parse';

const Home: NextPage = () => {
    // noinspection HtmlUnknownTarget
    return (
        <div className={styles.container}>
            <Head>
                <title>Weather history downloader</title>
                <meta name="description" content="For downloading historical weather data"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Weather history downloader</h1>
                <p>In this current version, this tool downloads weather data for September only.</p>
                <Step1Download />
                <Step2Parse />
            </main>
        </div>
    );
};

export default Home;
