import React, { useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { useAppContext } from '../context/AppContext';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from '../styles/BillSplitter.module.css';

interface DragItem {
    type: string;
    id: string;
}

interface ReceiptItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    participants: string[];
}

interface Participant {
    id: string;
    name: string;
}

const ParticipantCard: React.FC<{ id: string; name: string }> = ({ id, name }) => {
    const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>(() => ({
        type: 'participant',
        item: { type: 'participant', id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }));

    const elementRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        drag(elementRef.current);
    }, [drag]);

    return (
        <div
            ref={elementRef}
            style={{
                padding: '10px',
                margin: '5px 0',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                cursor: 'move',
                opacity: isDragging ? 0.5 : 1,
                border: '1px solid #ddd'
            }}
        >
            {name}
        </div>
    );
};

const ItemCard: React.FC<{
    id: string;
    name: string;
    price: number;
    participants: string[];
    onAddParticipant: (itemId: string, participantId: string) => void;
    onRemoveParticipant: (itemId: string, participantId: string) => void;
    getParticipantName: (id: string) => string;
    allParticipants: Array<{ id: string; name: string }>;
    currency: string;
}> = ({ id, name, price, participants, onAddParticipant, onRemoveParticipant, getParticipantName, allParticipants, currency }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'participant',
        drop: (item: { id: string }) => {
            if (!participants.includes(item.id)) {
                onAddParticipant(id, item.id);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    }));

    // Combine the refs
    const dropRef = (node: HTMLDivElement | null) => {
        elementRef.current = node;
        drop(node);
    };

    const handleManualAdd = (participantId: string) => {
        if (participantId && !participants.includes(participantId)) {
            onAddParticipant(id, participantId);
        }
    };

    const formatAmount = (amount: number): string => {
        return `${currency}${amount.toFixed(2)}`;
    };

    return (
        <div
            ref={dropRef}
            style={{
                padding: '15px',
                margin: '10px 0',
                backgroundColor: isOver ? '#e3f2fd' : 'white',
                borderRadius: '4px',
                border: '1px solid #ddd',
                transition: 'all 0.2s ease'
            }}
        >
            <div style={{ marginBottom: '10px' }}>
                <strong>{name}</strong>
                <span style={{ float: 'right' }}>{formatAmount(price)}</span>
            </div>
            <div style={{ marginTop: '10px' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '5px'
                }}>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>Shared by:</div>
                    <select
                        onChange={(e) => handleManualAdd(e.target.value)}
                        value=""
                        style={{
                            padding: '4px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    >
                        <option value="">Add participant</option>
                        {allParticipants
                            .filter(p => !participants.includes(p.id))
                            .map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))
                        }
                    </select>
                </div>
                <div ref={dropRef} style={{ 
                    minHeight: '30px',
                    padding: '5px',
                    backgroundColor: isOver ? '#e3f2fd' : '#f8f9fa',
                    borderRadius: '4px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '5px'
                }}>
                    {participants.length > 0 ? (
                        participants.map(participantId => (
                            <span
                                key={participantId}
                                style={{
                                    backgroundColor: '#e0e0e0',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.9em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                {getParticipantName(participantId)}
                                <button
                                    onClick={() => onRemoveParticipant(id, participantId)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '0 2px',
                                        cursor: 'pointer',
                                        fontSize: '1.1em',
                                        color: '#666'
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        ))
                    ) : (
                        <span style={{ color: '#999', fontSize: '0.9em' }}>
                            Drop participants here or select from dropdown
                        </span>
                    )}
                </div>
                {participants.length > 0 && (
                    <div style={{ 
                        marginTop: '8px', 
                        fontSize: '0.9em', 
                        color: '#666' 
                    }}>
                        Split amount: {formatAmount(price / participants.length)} each
                    </div>
                )}
            </div>
        </div>
    );
};

const BillSplitter: React.FC = () => {
    const { setStep, participants, receiptItems, setReceiptItems, currency } = useAppContext();

    const handleAddParticipant = (itemId: string, participantId: string) => {
        (setReceiptItems as Dispatch<SetStateAction<ReceiptItem[]>>)((prevItems: ReceiptItem[]) => 
            prevItems.map((item: ReceiptItem) => {
                if (item.id === itemId && !item.participants.includes(participantId)) {
                    return {
                        ...item,
                        participants: [...item.participants, participantId]
                    };
                }
                return item;
            })
        );
    };

    const handleRemoveParticipant = (itemId: string, participantId: string) => {
        (setReceiptItems as Dispatch<SetStateAction<ReceiptItem[]>>)((prevItems: ReceiptItem[]) => 
            prevItems.map((item: ReceiptItem) => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        participants: item.participants.filter(id => id !== participantId)
                    };
                }
                return item;
            })
        );
    };

    const getParticipantName = (id: string): string => {
        const participant = participants.find(p => p.id === id);
        return participant ? participant.name : '';
    };

    const handleNext = () => {
        // Check if all items have at least one participant
        const allItemsAssigned = receiptItems.every(item => item.participants.length > 0);
        if (!allItemsAssigned) {
            alert('Please assign at least one participant to each item before proceeding.');
            return;
        }
        setStep('summary');
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <h2 style={{ marginBottom: '20px' }}>Split the Bill</h2>
                <div style={{ display: 'flex', gap: '40px' }}>
                    {/* Left column - Participants */}
                    <div style={{ flex: '0 0 300px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Participants</h3>
                        <div style={{ 
                            backgroundColor: 'white',
                            padding: '15px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <p style={{ marginBottom: '10px', color: '#666' }}>
                                Drag participants to items or use the dropdown menus
                            </p>
                            {participants.map(participant => (
                                <ParticipantCard
                                    key={participant.id}
                                    id={participant.id}
                                    name={participant.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right column - Items */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '15px' }}>Receipt Items</h3>
                        <div>
                            {receiptItems.map(item => (
                                <ItemCard
                                    key={item.id}
                                    {...item}
                                    onAddParticipant={handleAddParticipant}
                                    onRemoveParticipant={handleRemoveParticipant}
                                    getParticipantName={getParticipantName}
                                    allParticipants={participants}
                                    currency={currency}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginTop: '30px'
                }}>
                    <button
                        onClick={() => setStep('participants')}
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
        </DndProvider>
    );
};

export default BillSplitter; 