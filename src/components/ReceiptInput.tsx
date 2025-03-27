import React, { ChangeEvent, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { createWorker } from 'tesseract.js';
import styles from '../styles/ReceiptInput.module.css';

const ReceiptInput: React.FC = () => {
    const { setStep, setReceiptImage, setReceiptItems } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const processReceipt = async (imageData: string) => {
        setIsProcessing(true);
        setProgress(0);

        try {
            // Create worker
            const worker = await createWorker();
            setProgress(30);
            
            // Perform OCR
            console.log('Starting OCR...');
            setProgress(60);
            const result = await worker.recognize(imageData);
            const text = result.data.text;
            console.log('Extracted Text:', text);
            setProgress(80);

            // Process the OCR text to extract items
            const lines = text.split('\n');
            const items = [];
            const priceRegex = /\$?\d+\.\d{2}/; // Matches price format like $12.34 or 12.34

            for (let line of lines) {
                const priceMatch = line.match(priceRegex);
                if (priceMatch) {
                    const price = parseFloat(priceMatch[0].replace('$', ''));
                    // Extract item name by removing the price and any extra whitespace
                    const name = line.replace(priceMatch[0], '').trim();
                    if (name && price > 0 && 
                        !name.toLowerCase().includes('total') && 
                        !name.toLowerCase().includes('tax')) {
                        items.push({
                            id: Date.now().toString() + items.length,
                            name: name,
                            price: price,
                            quantity: 1,
                            participants: [] // Initialize empty participants array
                        });
                        console.log('Added item:', { name, price });
                    }
                }
            }

            setProgress(90);
            console.log('Final items:', items);
            
            // Only proceed if we found some items
            if (items.length === 0) {
                throw new Error('No items were detected in the receipt. Please try again with a clearer image or enter items manually.');
            }

            // Set the items in context
            setReceiptItems(items);
            console.log('Items set in context:', items);
            
            // Cleanup and proceed
            await worker.terminate();
            setProgress(100);
            
            // Small delay to ensure state updates have propagated
            setTimeout(() => {
                setStep('correction');
            }, 100);

        } catch (error) {
            console.error('Detailed OCR Error:', error);
            alert('Error processing receipt. Please try again or enter items manually.\n\nError details: ' + (error as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Add file validation
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }

            // Check file size (limit to 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File is too large. Please upload an image smaller than 10MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target?.result as string;
                setReceiptImage(imageData);
                processReceipt(imageData);
            };
            reader.onerror = (e) => {
                console.error('File reading error:', e);
                alert('Error reading file. Please try again.');
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Upload Receipt</h2>
                        <p className={styles.subtitle}>
                            Take a clear photo of your receipt or upload an existing image
                        </p>
                    </div>

                    <div 
                        className={styles.uploadArea}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            className={styles.uploadIcon}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p className={styles.uploadText}>
                            {isProcessing ? 'Processing...' : 'Click to upload receipt'}
                        </p>
                    </div>

                    {isProcessing && (
                        <div className={styles.progressContainer}>
                            <div className={styles.progressBar}>
                                <div 
                                    className={styles.progressFill}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className={styles.progressText}>
                                Processing receipt... {progress.toFixed(0)}%
                            </p>
                            <p className={styles.progressNote}>
                                This may take a few moments. Please keep the browser tab open.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptInput; 