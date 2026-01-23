/**
 * 🎯 APP ROOT COMPONENT
 *
 * Entry point untuk React app
 * Mengatur global context dan routing (jika ada)
 */

import { useEffect } from 'react';
import Layout from './components/Layout';
import './styles/App.css';

function App() {
    // ========== PREVENT DEFAULT BROWSER BEHAVIORS ==========
    useEffect(() => {
        // Prevent context menu (right click)
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // Prevent default space bar scrolling
        const handleKeyDown = (e) => {
            if (e.key === ' ' && e.target === document.body) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // ========== GLOBAL ERROR HANDLER ==========
    useEffect(() => {
        const handleError = (event) => {
            console.error('Global error:', event.error);
            // Could show error modal to user
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    return (
        <div className="app">
            <Layout />
        </div>
    );
}

export default App;
