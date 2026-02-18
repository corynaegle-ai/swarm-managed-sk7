/**
 * Main application state and initialization
 */
class AppState {
    constructor() {
        this.initialized = false;
        this.data = {
            appName: 'Vanilla JS App',
            version: '1.0.0',
            startTime: new Date()
        };
    }

    updateStatus(message) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    initialize() {
        try {
            this.initialized = true;
            this.updateStatus(`${this.data.appName} v${this.data.version} initialized successfully at ${this.data.startTime.toLocaleTimeString()}`);
            console.log('App state initialized:', this.data);
            return true;
        } catch (error) {
            console.error('Failed to initialize app state:', error);
            this.updateStatus('Failed to initialize application');
            return false;
        }
    }
}

/**
 * Main application initialization
 */
function initializeApp() {
    try {
        // Create global app state
        window.appState = new AppState();
        
        // Initialize the application
        const success = window.appState.initialize();
        
        if (success) {
            console.log('Application initialized successfully');
        } else {
            console.error('Application initialization failed');
        }
        
        return success;
    } catch (error) {
        console.error('Critical error during app initialization:', error);
        return false;
    }
}

/**
 * DOM ready initialization - handles both cases properly
 */
function domReady(callback) {
    if (document.readyState === 'loading') {
        // DOM is still loading, wait for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        // DOM is already loaded, execute immediately
        callback();
    }
}

// Initialize app when DOM is ready
domReady(function() {
    initializeApp();
});