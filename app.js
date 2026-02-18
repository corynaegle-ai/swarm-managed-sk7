// Main JS entry point for Vanilla JS App

// Application state object
const appState = {
    initialized: false,
    version: '1.0.0',
    debug: true
};

// Initialize application
function initApp() {
    try {
        console.log('Initializing Vanilla JS App...');
        
        // Set initialized flag
        appState.initialized = true;
        
        // Log successful initialization
        if (appState.debug) {
            console.log('App initialized successfully:', appState);
        }
        
        // Add any initial event listeners or setup here
        setupEventListeners();
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        appState.initialized = false;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Example event listener setup
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM fully loaded');
    });
}

// Initialize app when script loads
initApp();

// Export state for debugging (if needed)
if (appState.debug) {
    window.appState = appState;
}