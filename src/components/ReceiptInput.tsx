import React, { ChangeEvent, useRef, useState, DragEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import { createWorker } from 'tesseract.js';
import styles from '../styles/ReceiptInput.module.css';
import { correctPerspective } from '../utils/imageProcessing';

const ReceiptInput: React.FC = () => {
    const { setStep, setReceiptImage, setReceiptItems } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showCamera, setShowCamera] = useState(false);

    const optimizeImage = (imageData: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions while maintaining aspect ratio
                const MAX_WIDTH = 1200;  // Maximum width for OCR
                const MAX_HEIGHT = 1600; // Maximum height for OCR
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = Math.round((width * MAX_HEIGHT) / height);
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and optimize the image
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Convert to JPEG with quality 0.8 (good balance between quality and size)
                const optimizedImageData = canvas.toDataURL('image/jpeg', 0.8);
                resolve(optimizedImageData);
            };
            img.src = imageData;
        });
    };

    const processReceipt = async (imageData: string) => {
        setIsProcessing(true);
        setProgress(0);

        try {
            // Correct perspective before optimization
            console.log('Correcting perspective...');
            setProgress(5);
            const perspectiveCorrected = await correctPerspective(imageData);
            setProgress(10);

            // Optimize image before processing
            console.log('Optimizing image...');
            setProgress(15);
            const optimizedImage = await optimizeImage(perspectiveCorrected);
            setProgress(25);

            // Create worker
            const worker = await createWorker();
            setProgress(35);
            
            // Perform OCR
            console.log('Starting OCR...');
            setProgress(60);
            const result = await worker.recognize(optimizedImage);
            const text = result.data.text;
            console.log('Extracted Text:', text);
            setProgress(80);

            // Process the OCR text to extract items
            const lines = text.split('\n');
            const items = [];
            const priceRegex = /\$?\d+\.\d{2}/;

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

    const startCamera = async () => {
        try {
            // First check if the device has a camera
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasCamera = devices.some(device => device.kind === 'videoinput');
            
            if (!hasCamera) {
                alert('No camera found on your device. Please use the file upload option instead.');
                return;
            }

            // Request camera permissions
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    facingMode: 'environment', // Prefer back camera on mobile devices
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                } 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setShowCamera(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
            let errorMessage = 'Error accessing camera. ';
            
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    errorMessage += 'Please allow camera access in your browser settings and try again.';
                } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                    errorMessage += 'No camera found on your device. Please use the file upload option instead.';
                } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                    errorMessage += 'Your camera is in use by another application. Please close other apps using the camera and try again.';
                } else {
                    errorMessage += 'Please try again or use the file upload option instead.';
                }
            }
            
            alert(errorMessage);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setShowCamera(false);
    };

    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg');
            setReceiptImage(imageData);
            stopCamera();
            processReceipt(imageData);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            
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

                    {showCamera ? (
                        <div className={styles.cameraContainer}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className={styles.cameraPreview}
                            />
                            <div className={styles.cameraControls}>
                                <button
                                    onClick={stopCamera}
                                    className={`${styles.button} ${styles.buttonSecondary}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={captureImage}
                                    className={`${styles.button} ${styles.buttonPrimary}`}
                                >
                                    Capture
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div 
                                className={styles.uploadArea}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
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
                                    stroke="currentColor"
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
                                    Click or drag a receipt to upload
                                </p>
                            </div>
                            <div className={styles.actionButtons}>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`${styles.button} ${styles.buttonPrimary}`}
                                >
                                    Choose File
                                </button>
                                <button
                                    onClick={startCamera}
                                    className={`${styles.button} ${styles.buttonSecondary}`}
                                >
                                    Take Photo
                                </button>
                            </div>
                        </>
                    )}

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