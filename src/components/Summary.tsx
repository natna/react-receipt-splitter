import React from 'react';
import { useAppContext } from '../context/AppContext';
import styles from '../styles/Summary.module.css';

interface Debt {
    from: string;
    to: string;
    amount: number;
}

const Summary: React.FC = () => {
    const { setStep, participants, receiptItems, resetState, currency } = useAppContext();

    // Find the payer (participant with isPayer = true)
    const payer = participants.find(p => p.isPayer);

    // Calculate total bill amount
    const totalBill = receiptItems.reduce((sum, item) => sum + item.price, 0);

    // Calculate what each person owes
    const personOwes: { [key: string]: number } = {};
    receiptItems.forEach(item => {
        const perPersonCost = item.price / item.participants.length;
        item.participants.forEach(participantId => {
            personOwes[participantId] = (personOwes[participantId] || 0) + perPersonCost;
        });
    });

    // Calculate debts (who owes money to whom)
    const debts: Debt[] = [];
    if (payer) {
        participants.forEach(participant => {
            if (participant.id !== payer.id && personOwes[participant.id] > 0) {
                debts.push({
                    from: participant.id,
                    to: payer.id,
                    amount: personOwes[participant.id]
                });
            }
        });
    }

    const formatAmount = (amount: number): string => {
        return `${currency}${amount.toFixed(2)}`;
    };

    const getParticipantName = (id: string): string => {
        const participant = participants.find(p => p.id === id);
        return participant ? participant.name : '';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Bill Summary</h2>
            </div>

            <div className={styles.section}>
                <h3>Total Bill</h3>
                <p className={styles.total}>{formatAmount(totalBill)}</p>
            </div>

            <div className={styles.section}>
                <h3>Individual Shares</h3>
                <div className={styles.shares}>
                    {participants.map(participant => (
                        <div key={participant.id} className={styles.shareItem}>
                            <span className={styles.name}>{participant.name}</span>
                            <span className={styles.amount}>
                                {formatAmount(personOwes[participant.id] || 0)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <h3>Payments Required</h3>
                <div className={styles.debts}>
                    {debts.map((debt, index) => (
                        <div key={index} className={styles.debtItem}>
                            <span className={styles.from}>{getParticipantName(debt.from)}</span>
                            <span className={styles.arrow}>→</span>
                            <span className={styles.to}>{getParticipantName(debt.to)}</span>
                            <span className={styles.amount}>{formatAmount(debt.amount)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    onClick={() => setStep('split')}
                    className={`${styles.button} ${styles.buttonSecondary}`}
                >
                    Back
                </button>
                <button
                    onClick={resetState}
                    className={`${styles.button} ${styles.buttonPrimary}`}
                >
                    Start New Split
                </button>
            </div>
        </div>
    );
};

export default Summary; 