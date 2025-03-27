import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import CurrencySelector from './CurrencySelector';
import EditIcon from './EditIcon';
import styles from '../styles/ItemCorrection.module.css';

interface Item {
    id: string;
    name: string;
    price: number;
    quantity: number;
    participants: string[];
}

const ItemCorrection: React.FC = () => {
    const { setStep, receiptImage, receiptItems, setReceiptItems, currency } = useAppContext();
    const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '1' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [editingQuantityId, setEditingQuantityId] = useState<string | null>(null);
    const [editQuantityValue, setEditQuantityValue] = useState<string>('');
    const [taxAmount, setTaxAmount] = useState<string>('');
    const [tipPercentage, setTipPercentage] = useState<string>('');

    const formatAmount = (amount: number): string => {
        return `${currency}${amount.toFixed(2)}`;
    };

    const calculateSubtotal = () => {
        return receiptItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateTax = () => {
        return parseFloat(taxAmount) || 0;
    };

    const calculateTip = () => {
        const subtotal = calculateSubtotal();
        const tip = parseFloat(tipPercentage) || 0;
        return (subtotal * tip) / 100;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = calculateTax();
        const tip = calculateTip();
        return subtotal + tax + tip;
    };

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

    const startEditingQuantity = (item: Item) => {
        setEditingQuantityId(item.id);
        setEditQuantityValue(item.quantity.toString());
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

    const handleQuantityChange = (id: string, newQuantity: string) => {
        const quantity = parseInt(newQuantity);
        if (!isNaN(quantity) && quantity > 0) {
            setReceiptItems(receiptItems.map(item => 
                item.id === id ? { ...item, quantity } : item
            ));
        }
        setEditingQuantityId(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, id: string, type: 'price' | 'quantity') => {
        if (e.key === 'Enter') {
            if (type === 'price') {
                handlePriceChange(id, editValue);
            } else {
                handleQuantityChange(id, editQuantityValue);
            }
        } else if (e.key === 'Escape') {
            if (type === 'price') {
                setEditingId(null);
            } else {
                setEditingQuantityId(null);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Review and Correct Items</h2>
                <CurrencySelector />
            </div>

            <div className={styles.content}>
                <div className={styles.receiptColumn}>
                    {receiptImage && (
                        <div className={styles.receiptPreview}>
                            <img src={receiptImage} alt="Receipt" />
                        </div>
                    )}
                </div>

                <div className={styles.itemsColumn}>
                    <div className={styles.itemsList}>
                        {receiptItems.map(item => (
                            <div key={item.id} className={styles.itemCard}>
                                <div className={styles.itemHeader}>
                                    <h3>{item.name}</h3>
                                    <div className={styles.itemActions}>
                                        {editingId === item.id ? (
                                            <input
                                                type="number"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => handleKeyPress(e, item.id, 'price')}
                                                className={styles.priceInput}
                                                step="0.01"
                                                min="0"
                                            />
                                        ) : (
                                            <span className={styles.price}>
                                                {formatAmount(item.price)}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => startEditing(item)}
                                            className={styles.iconButton}
                                            title="Edit Price"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className={styles.iconButton}
                                            title="Delete Item"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.itemDetails}>
                                    <div className={styles.quantitySection}>
                                        <span>Quantity:</span>
                                        {editingQuantityId === item.id ? (
                                            <input
                                                type="number"
                                                value={editQuantityValue}
                                                onChange={(e) => setEditQuantityValue(e.target.value)}
                                                onKeyDown={(e) => handleKeyPress(e, item.id, 'quantity')}
                                                className={styles.quantityInput}
                                                min="1"
                                            />
                                        ) : (
                                            <span className={styles.quantity}>
                                                {item.quantity}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => startEditingQuantity(item)}
                                            className={styles.iconButton}
                                            title="Edit Quantity"
                                        >
                                            <EditIcon />
                                        </button>
                                    </div>
                                    <div className={styles.itemTotal}>
                                        Total: {formatAmount(item.price * item.quantity)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.totalSection}>
                        <h3>Bill Summary</h3>
                        <div className={styles.summaryDetails}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal:</span>
                                <span>{formatAmount(calculateSubtotal())}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Tax:</span>
                                <span>{formatAmount(calculateTax())}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Tip ({tipPercentage || '0'}%):</span>
                                <span>{formatAmount(calculateTip())}</span>
                            </div>
                            <div className={styles.summaryRowTotal}>
                                <span>Total Amount:</span>
                                <span>{formatAmount(calculateTotal())}</span>
                            </div>
                        </div>
                        <div className={styles.taxTipInputs}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="tax">Tax Percentage:</label>
                                <input
                                    id="tax"
                                    type="number"
                                    value={taxAmount}
                                    onChange={(e) => setTaxAmount(e.target.value)}
                                    className={styles.input}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="Enter tax %"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="tip">Tip Percentage:</label>
                                <input
                                    id="tip"
                                    type="number"
                                    value={tipPercentage}
                                    onChange={(e) => setTipPercentage(e.target.value)}
                                    className={styles.input}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="Enter tip %"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.addItem}>
                        <h3>Add New Item</h3>
                        <div className={styles.addItemForm}>
                            <input
                                type="text"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                placeholder="Item name"
                                className={styles.input}
                            />
                            <input
                                type="number"
                                value={newItem.price}
                                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                placeholder="Price"
                                className={styles.input}
                                step="0.01"
                                min="0"
                            />
                            <input
                                type="number"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                placeholder="Quantity"
                                className={styles.input}
                                min="1"
                            />
                            <button
                                onClick={handleAddItem}
                                className={styles.addButton}
                            >
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    onClick={() => setStep('input')}
                    className={`${styles.button} ${styles.buttonSecondary}`}
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className={`${styles.button} ${styles.buttonPrimary}`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ItemCorrection; 