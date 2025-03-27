import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface Item {
    id: string;
    name: string;
    price: number;
    quantity: number;
    participants: string[];
}

const ItemCorrection: React.FC = () => {
    const { setStep, receiptImage, receiptItems, setReceiptItems } = useAppContext();
    const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '1' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const handleAddItem = () => {
        if (newItem.name && newItem.price) {
            setReceiptItems([
                ...receiptItems,
                {
                    id: Date.now().toString(),
                    name: newItem.name,
                    price: parseFloat(newItem.price),
                    quantity: parseInt(newItem.quantity) || 1,
                    participants: []
                }
            ]);
            setNewItem({ name: '', price: '', quantity: '1' });
        }
    };

    const handleDeleteItem = (id: string) => {
        setReceiptItems(receiptItems.filter(item => item.id !== id));
    };

    const handleNext = () => {
        setStep('participants');
    };

    const startEditing = (item: Item) => {
        setEditingId(item.id);
        setEditValue(item.price.toFixed(2));
    };

    const handlePriceChange = (id: string, newPrice: string) => {
        const price = parseFloat(newPrice);
        if (!isNaN(price)) {
            setReceiptItems(receiptItems.map(item => 
                item.id === id ? { ...item, price } : item
            ));
        }
        setEditingId(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
        if (e.key === 'Enter') {
            handlePriceChange(id, editValue);
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            {receiptImage && (
                <div style={{ flex: 1 }}>
                    <h3>Receipt Image</h3>
                    <img 
                        src={receiptImage} 
                        alt="Receipt" 
                        style={{ 
                            maxWidth: '100%', 
                            height: 'auto',
                            borderRadius: '4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} 
                    />
                </div>
            )}
            <div style={{ flex: 1 }}>
                <h3>Items</h3>
                <div style={{ marginBottom: '20px' }}>
                    {receiptItems.map(item => (
                        <div key={item.id} style={{ 
                            display: 'flex', 
                            gap: '10px', 
                            alignItems: 'center',
                            marginBottom: '10px',
                            padding: '10px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px'
                        }}>
                            <span style={{ flex: 2 }}>{item.name}</span>
                            {editingId === item.id ? (
                                <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => handlePriceChange(item.id, editValue)}
                                    onKeyDown={(e) => handleKeyPress(e, item.id)}
                                    autoFocus
                                    style={{
                                        flex: 1,
                                        padding: '4px',
                                        width: '80px',
                                        border: '1px solid #4a90e2',
                                        borderRadius: '4px'
                                    }}
                                    step="0.01"
                                    min="0"
                                />
                            ) : (
                                <span 
                                    style={{ 
                                        flex: 1, 
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        backgroundColor: '#fff',
                                        border: '1px solid transparent'
                                    }}
                                    onClick={() => startEditing(item)}
                                    title="Click to edit price"
                                >
                                    ${item.price.toFixed(2)}
                                </span>
                            )}
                            <span style={{ flex: 1 }}>x{item.quantity}</span>
                            <button 
                                onClick={() => handleDeleteItem(item.id)}
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#ff4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Item name"
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        style={{ marginRight: '10px', padding: '5px' }}
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={newItem.price}
                        onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                        style={{ marginRight: '10px', padding: '5px', width: '80px' }}
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={newItem.quantity}
                        onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                        style={{ marginRight: '10px', padding: '5px', width: '60px' }}
                    />
                    <button 
                        onClick={handleAddItem}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Add Item
                    </button>
                </div>
                <button 
                    onClick={handleNext}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4a90e2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '20px'
                    }}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ItemCorrection; 