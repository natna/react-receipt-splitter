import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const ParticipantInput: React.FC = () => {
    const { setStep, participants, setParticipants } = useAppContext();
    const [newParticipantName, setNewParticipantName] = useState('');

    const handleAddParticipant = () => {
        if (newParticipantName.trim()) {
            setParticipants([
                ...participants,
                {
                    id: Date.now().toString(),
                    name: newParticipantName.trim(),
                    isPayer: participants.length === 0 // First participant is the payer
                }
            ]);
            setNewParticipantName('');
        }
    };

    const handleDeleteParticipant = (id: string) => {
        const participantToDelete = participants.find(p => p.id === id);
        if (participantToDelete?.isPayer) {
            // If deleting the payer, make the first remaining participant the payer
            const updatedParticipants = participants.filter(p => p.id !== id);
            if (updatedParticipants.length > 0) {
                updatedParticipants[0].isPayer = true;
            }
            setParticipants(updatedParticipants);
        } else {
            setParticipants(participants.filter(p => p.id !== id));
        }
    };

    const handleSetPayer = (id: string) => {
        setParticipants(participants.map(p => ({
            ...p,
            isPayer: p.id === id
        })));
    };

    const handleNext = () => {
        if (participants.length < 2) {
            alert('Please add at least 2 participants to split the bill.');
            return;
        }
        setStep('split');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAddParticipant();
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Add Participants</h2>
            
            <div style={{ marginBottom: '30px' }}>
                <div style={{ 
                    display: 'flex', 
                    gap: '10px',
                    marginBottom: '20px'
                }}>
                    <input
                        type="text"
                        value={newParticipantName}
                        onChange={(e) => setNewParticipantName(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={participants.length === 0 ? "Enter payer's name (paid the bill)" : "Enter participant name"}
                        style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                    <button
                        onClick={handleAddParticipant}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Add
                    </button>
                </div>

                {participants.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '10px' }}>
                        First, add the person who paid the bill
                    </p>
                )}

                {participants.length > 0 ? (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {participants.map(participant => (
                            <div 
                                key={participant.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px',
                                    backgroundColor: participant.isPayer ? '#e3f2fd' : '#f5f5f5',
                                    borderRadius: '4px',
                                    border: participant.isPayer ? '1px solid #90caf9' : '1px solid transparent'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>{participant.name}</span>
                                    {participant.isPayer && (
                                        <span style={{ 
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
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {!participant.isPayer && (
                                        <button
                                            onClick={() => handleSetPayer(participant.id)}
                                            style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#2196f3',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.9em'
                                            }}
                                        >
                                            Set as Payer
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteParticipant(participant.id)}
                                        style={{
                                            padding: '4px 8px',
                                            backgroundColor: '#ff4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#666' }}>
                        No participants added yet. Add at least 2 participants to continue.
                    </p>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                    onClick={() => setStep('correction')}
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
                    onClick={handleNext}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4a90e2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ParticipantInput; 