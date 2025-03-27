import React from 'react';
import { useAppContext } from '../context/AppContext';
import styles from '../styles/CurrencySelector.module.css';

const currencies = [
    { symbol: '$', name: 'USD' },
    { symbol: '€', name: 'EUR' },
    { symbol: '£', name: 'GBP' },
    { symbol: '¥', name: 'JPY' },
    { symbol: '₹', name: 'INR' },
    { symbol: '₽', name: 'RUB' },
    { symbol: '₩', name: 'KRW' },
    { symbol: '₪', name: 'ILS' },
    { symbol: '₫', name: 'VND' },
    { symbol: '₱', name: 'PHP' }
];

const CurrencySelector: React.FC = () => {
    const { currency, setCurrency } = useAppContext();

    return (
        <div className={styles.container}>
            <label htmlFor="currency" className={styles.label}>Currency:</label>
            <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={styles.select}
            >
                {currencies.map((curr) => (
                    <option key={curr.symbol} value={curr.symbol}>
                        {curr.symbol} - {curr.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CurrencySelector; 