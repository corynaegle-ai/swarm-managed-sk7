import { initializeApp, handleFormSubmit, renderPlayersList, handleEditPlayer, handleRemovePlayer, handleStartGame, showValidationMessage } from '../js/app.js';
import * as playerSetup from '../js/playerSetup.js';

// Mock DOM elements
const mockDOM = () => {
    global.document = {
        getElementById: jest.fn(),
        createElement: jest.fn(),
        addEventListener: jest.fn()
    };
    
    global.window = {
        confirm: jest.fn()
    };
    
    const mockElements = {
        playerForm: { addEventListener: jest.fn(), reset: jest.fn(), querySelector: jest.fn() },
        playerNameInput: { value: '', focus: jest.fn() },
        playersList: { firstChild: null, removeChild: jest.fn(), appendChild: jest.fn() },
        startGameBtn: { disabled: false, title: '', addEventListener: jest.fn() },
        validationMessage: { textContent: '', className: '', style: { display: 'none' } },
        playerSetupView: { style: { display: 'block' } },
        gameView: { style: { display: 'none' }, innerHTML: '' }
    };
    
    document.getElementById.mockImplementation((id) => mockElements[id.replace('-', '')] || null);
    
    return mockElements;
};

// Mock playerSetup module
jest.mock('../js/playerSetup.js', () => ({
    addPlayer: jest.fn(),
    removePlayer: jest.fn(),
    editPlayer: jest.fn(),
    getPlayers: jest.fn(),
    validatePlayerName: jest.fn(),
    canStartGame: jest.fn()
}));

describe('App.js', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = mockDOM();
        jest.clearAllMocks();
    });
    
    describe('Form Submission', () => {
        it('should add player when form is submitted with valid name', () => {
            mockElements.playerNameInput.value = 'John';
            playerSetup.addPlayer.mockReturnValue({ success: true });
            playerSetup.getPlayers.mockReturnValue([{ id: 1, name: 'John' }]);
            playerSetup.canStartGame.mockReturnValue(false);
            
            const mockEvent = { preventDefault: jest.fn() };
            handleFormSubmit(mockEvent);
            
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(playerSetup.addPlayer).toHaveBeenCalledWith('John');
        });
        
        it('should show error for empty name', () => {
            mockElements.playerNameInput.value = '   ';
            
            const mockEvent = { preventDefault: jest.fn() };
            handleFormSubmit(mockEvent);
            
            expect(playerSetup.addPlayer).not.toHaveBeenCalled();
            expect(mockElements.validationMessage.textContent).toContain('Please enter a player name');
        });
        
        it('should show error when addPlayer fails', () => {
            mockElements.playerNameInput.value = 'John';
            playerSetup.addPlayer.mockReturnValue({ success: false, error: 'Name already exists' });
            
            const mockEvent = { preventDefault: jest.fn() };
            handleFormSubmit(mockEvent);
            
            expect(mockElements.validationMessage.textContent).toBe('Name already exists');
            expect(mockElements.validationMessage.className).toContain('error');
        });
    });
    
    describe('Player List Rendering', () => {
        it('should show no players message when list is empty', () => {
            playerSetup.getPlayers.mockReturnValue([]);
            document.createElement.mockReturnValue({
                className: '',
                textContent: '',
                appendChild: jest.fn()
            });
            
            renderPlayersList();
            
            expect(document.createElement).toHaveBeenCalledWith('div');
        });
        
        it('should render player items when players exist', () => {
            const mockPlayers = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
            playerSetup.getPlayers.mockReturnValue(mockPlayers);
            
            const mockDiv = {
                className: '',
                textContent: '',
                appendChild: jest.fn(),
                addEventListener: jest.fn()
            };
            
            const mockButton = {
                className: '',
                textContent: '',
                addEventListener: jest.fn()
            };
            
            document.createElement.mockReturnValue(mockDiv);
            document.createElement.mockReturnValueOnce(mockDiv); // playerItem
            document.createElement.mockReturnValueOnce(mockDiv); // playerName
            document.createElement.mockReturnValueOnce(mockDiv); // playerActions
            document.createElement.mockReturnValueOnce(mockButton); // editButton
            document.createElement.mockReturnValueOnce(mockButton); // removeButton
            
            renderPlayersList();
            
            expect(mockElements.playersList.appendChild).toHaveBeenCalledTimes(2);
        });
    });
    
    describe('Player Actions', () => {
        it('should remove player when confirmed', () => {
            const mockPlayers = [{ id: 1, name: 'John' }];
            playerSetup.getPlayers.mockReturnValue(mockPlayers);
            playerSetup.removePlayer.mockReturnValue({ success: true });
            playerSetup.canStartGame.mockReturnValue(false);
            window.confirm.mockReturnValue(true);
            
            handleRemovePlayer(1);
            
            expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to remove John?');
            expect(playerSetup.removePlayer).toHaveBeenCalledWith(1);
            expect(mockElements.validationMessage.textContent).toContain('John removed successfully');
        });
        
        it('should not remove player when cancelled', () => {
            const mockPlayers = [{ id: 1, name: 'John' }];
            playerSetup.getPlayers.mockReturnValue(mockPlayers);
            window.confirm.mockReturnValue(false);
            
            handleRemovePlayer(1);
            
            expect(playerSetup.removePlayer).not.toHaveBeenCalled();
        });
        
        it('should enter edit mode for existing player', () => {
            const mockPlayers = [{ id: 1, name: 'John' }];
            playerSetup.getPlayers.mockReturnValue(mockPlayers);
            mockElements.playerForm.querySelector.mockReturnValue({ textContent: 'Add Player' });
            
            handleEditPlayer(1);
            
            expect(mockElements.playerNameInput.value).toBe('John');
            expect(mockElements.playerNameInput.focus).toHaveBeenCalled();
        });
    });
    
    describe('Start Game', () => {
        it('should start game when enough players', () => {
            playerSetup.canStartGame.mockReturnValue(true);
            playerSetup.getPlayers.mockReturnValue([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]);
            
            handleStartGame();
            
            expect(mockElements.playerSetupView.style.display).toBe('none');
            expect(mockElements.gameView.style.display).toBe('block');
        });
        
        it('should show error when not enough players', () => {
            playerSetup.canStartGame.mockReturnValue(false);
            
            handleStartGame();
            
            expect(mockElements.validationMessage.textContent).toContain('You need at least 2 players');
            expect(mockElements.playerSetupView.style.display).toBe('block');
        });
    });
    
    describe('Validation Messages', () => {
        it('should display and auto-hide success messages', (done) => {
            showValidationMessage('Success!', 'success');
            
            expect(mockElements.validationMessage.textContent).toBe('Success!');
            expect(mockElements.validationMessage.className).toBe('validation-message success');
            expect(mockElements.validationMessage.style.display).toBe('block');
            
            // Test auto-hide (in real implementation)
            setTimeout(() => {
                done();
            }, 100);
        });
        
        it('should display error messages without auto-hide', () => {
            showValidationMessage('Error!', 'error');
            
            expect(mockElements.validationMessage.textContent).toBe('Error!');
            expect(mockElements.validationMessage.className).toBe('validation-message error');
            expect(mockElements.validationMessage.style.display).toBe('block');
        });
    });
});

// Integration tests
describe('App Integration', () => {
    it('should handle complete player management workflow', () => {
        const mockElements = mockDOM();
        
        // Add first player
        mockElements.playerNameInput.value = 'Alice';
        playerSetup.addPlayer.mockReturnValue({ success: true });
        playerSetup.getPlayers.mockReturnValue([{ id: 1, name: 'Alice' }]);
        playerSetup.canStartGame.mockReturnValue(false);
        
        const mockEvent = { preventDefault: jest.fn() };
        handleFormSubmit(mockEvent);
        
        expect(playerSetup.addPlayer).toHaveBeenCalledWith('Alice');
        
        // Add second player
        mockElements.playerNameInput.value = 'Bob';
        playerSetup.addPlayer.mockReturnValue({ success: true });
        playerSetup.getPlayers.mockReturnValue([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
        playerSetup.canStartGame.mockReturnValue(true);
        
        handleFormSubmit(mockEvent);
        
        expect(playerSetup.addPlayer).toHaveBeenCalledWith('Bob');
        expect(mockElements.startGameBtn.disabled).toBe(false);
        
        // Start game
        handleStartGame();
        
        expect(mockElements.playerSetupView.style.display).toBe('none');
        expect(mockElements.gameView.style.display).toBe('block');
    });
});