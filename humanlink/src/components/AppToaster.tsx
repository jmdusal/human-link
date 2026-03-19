import { Toaster } from 'react-hot-toast';

export default function AppToaster() {
    return (
        <Toaster 
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#ffffff',
                    color: '#475569',
                    border: '1px solid #f1f5f9',
                    fontSize: '14px',
                    borderRadius: '12px',
                    padding: '12px 16px',
                },
                success: {
                    iconTheme: {
                        primary: '#3b82f6',
                        secondary: '#ffffff',
                    },
                },
            }} 
        />
    );
}