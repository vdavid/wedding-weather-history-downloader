import React, {useEffect} from 'react';
import styles from '../../styles/Home.module.css';

interface PropsType {
    id: string,
    label: string,
    isRequired: boolean,
    maxLength?: number;
    value?: string;
    description?: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SavedInputWithLabel(props: PropsType) {
    const [value, setValue] = React.useState<string>('');

    useEffect(() => {
        const newValue = localStorage.getItem(props.id) || '';
        setValue(newValue);
        // @ts-ignore Duck typing this change event for now.
        handleOnChange({target: {value: newValue}});
    }, []);

    return <div className={styles.inputWithLabel}>
        <label htmlFor={props.id}><strong>{props.label}</strong> ({props.isRequired ? 'required': 'optional'})</label>
        <input type="text" id={props.id} maxLength={props.maxLength} value={value} onChange={handleOnChange}/>
        <p>{props.description}</p>
    </div>;

    function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
        localStorage.setItem(props.id, event.target.value);
        setValue(event.target.value);
        props.onChange(event);
    }

}