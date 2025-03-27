// src/App.tsx
import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import ReceiptInput from './components/ReceiptInput';
import ItemCorrection from './components/ItemCorrection';
import ParticipantInput from './components/ParticipantInput';
import BillSplitter from './components/BillSplitter';
import Summary from './components/Summary';
import './index.css'; // Basic styling

// Component to render the current step
const CurrentStep: React.FC = () => {
    const { step } = useAppContext();

    switch (step) {
        case 'input':
            return <ReceiptInput />;
        case 'correction':
            return <ItemCorrection />;
        case 'participants':
            return <ParticipantInput />;
        case 'split':
            return <BillSplitter />;
        case 'summary':
            return <Summary />;
        default:
            return <ReceiptInput />; // Default to input step
    }
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <div style={{
                backgroundColor: '#f5f7fa',
                minHeight: '100vh'
            }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '20px'
                }}>
                    <h1 style={{
                        textAlign: 'center',
                        marginBottom: '20px',
                        color: '#2c3e50',
                        fontSize: '2rem',
                        fontWeight: 600
                    }}>
                        Receipt Splitter
                    </h1>
                    <CurrentStep />
                </div>
            </div>
        </AppProvider>
    );
};

export default App;

