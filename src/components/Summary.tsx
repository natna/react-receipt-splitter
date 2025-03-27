import React from 'react';
import { useAppContext } from '../context/AppContext';

interface Debt {
    from: string;
    to: string;
    amount: number;
}

const Summary: React.FC = () => {
    const { setStep, participants, receiptItems, resetState } = useAppContext();

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

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Bill Summary</h2>

            {/* Total Amount Section */}
            <div style={{ 
                backgroundColor: '#e3f2fd', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3 style={{ marginBottom: '10px' }}>Total Bill Amount</h3>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    ${totalBill.toFixed(2)}
                </div>
                {payer && (
                    <div style={{ marginTop: '5px', color: '#666' }}>
                        Paid by {payer.name}
                    </div>
                )}
            </div>

            {/* Individual Breakdown Section */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>Individual Breakdown</h3>
                <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}>
                    {participants.map(participant => (
                        <div 
                            key={participant.id}
                            style={{
                                padding: '15px',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <strong>{participant.name}</strong>
                                {participant.isPayer && (
                                    <span style={{
                                        marginLeft: '10px',
                                        backgroundColor: '#2196f3',
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.8em'
                                    }}>
                                        Paid
                                    </span>
                                )}
                            </div>
                            <div>
                                ${(personOwes[participant.id] || 0).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payments Section */}
            {debts.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '15px' }}>Payments Due</h3>
                    <div style={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                    }}>
                        {debts.map((debt, index) => {
                            const from = participants.find(p => p.id === debt.from);
                            const to = participants.find(p => p.id === debt.to);
                            return (
                                <div 
                                    key={index}
                                    style={{
                                        padding: '15px',
                                        borderBottom: '1px solid #eee',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <strong>{from?.name}</strong> owes <strong>{to?.name}</strong>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: '#2196f3' }}>
                                        ${debt.amount.toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Receipt Details Section */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>Receipt Details</h3>
                <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}>
                    {receiptItems.map(item => (
                        <div 
                            key={item.id}
                            style={{
                                padding: '15px',
                                borderBottom: '1px solid #eee'
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '5px'
                            }}>
                                <strong>{item.name}</strong>
                                <span>${item.price.toFixed(2)}</span>
                            </div>
                            <div style={{ 
                                fontSize: '0.9em',
                                color: '#666'
                            }}>
                                Split between: {item.participants.map(id => 
                                    participants.find(p => p.id === id)?.name
                                ).join(', ')}
                                <div style={{ marginTop: '5px' }}>
                                    ${(item.price / item.participants.length).toFixed(2)} each
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '30px'
            }}>
                <button
                    onClick={() => setStep('split')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Back
                </button>
                <button
                    onClick={resetState}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Start New Split
                </button>
            </div>
        </div>
    );
};

export default Summary; 