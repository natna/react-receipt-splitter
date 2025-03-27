import React, { createContext, useState, ReactNode } from 'react';

type Step = 'input' | 'correction' | 'participants' | 'split' | 'summary';

interface ReceiptItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    participants: string[]; // Array of participant IDs who share this item
}

interface Participant {
    id: string;
    name: string;
    isPayer: boolean;
}

interface AppContextType {
    step: Step;
    setStep: (step: Step) => void;
    receiptImage: string | null;
    setReceiptImage: (image: string | null) => void;
    receiptItems: ReceiptItem[];
    setReceiptItems: (items: ReceiptItem[]) => void;
    participants: Participant[];
    setParticipants: (participants: Participant[]) => void;
    currency: string;
    setCurrency: (currency: string) => void;
    resetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [step, setStep] = useState<Step>('input');
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [currency, setCurrency] = useState<string>('$');

    const resetState = () => {
        setStep('input');
        setReceiptImage(null);
        setReceiptItems([]);
        setParticipants([]);
        setCurrency('$');
    };

    const value = {
        step,
        setStep,
        receiptImage,
        setReceiptImage,
        receiptItems,
        setReceiptItems,
        participants,
        setParticipants,
        currency,
        setCurrency,
        resetState
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = React.useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}; 