document.addEventListener('DOMContentLoaded', function() {
    // Состояние игры
    const gameState = {
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        gameActive: true,
        scores: {
            x: 0,
            o: 0,
            draw: 0
        },
        // Сохранение состояния в localStorage для синхронизации между вкладками
        saveState: function() {
            const state = {
                board: this.board,
                currentPlayer: this.currentPlayer,
                gameActive: this.gameActive,
                scores: this.scores
            };
            localStorage.setItem('ticTacToeState', JSON.stringify(state));
        },
        // Загрузка состояния из localStorage
        loadState: function() {
            const savedState = localStorage.getItem('ticTacToeState');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.board = state.board;
                this.currentPlayer = state.currentPlayer;
                this.gameActive = state.gameActive;
                this.scores = state.scores;
                return true;
            }
            return false;
        }
    };

    // Возможные выигрышные комбинации
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Горизонтальные
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Вертикальные
        [0, 4, 8], [2, 4, 6]             // Диагональные
    ];

    // Элементы DOM
    const cells = document.querySelectorAll('.cell');
    const gameStatus = document.getElementById('game-status');
    const currentPlayerSpan = document.querySelector('.current-player');
    const playerXElement = document.getElementById('player-x');
    const playerOElement = document.getElementById('player-o');
    const scoreXElement = document.getElementById('score-x');
    const scoreOElement = document.getElementById('score-o');
    const scoreDrawElement = document.getElementById('score-draw');
    const newGameButton = document.getElementById('new-game');
    const changeSidesButton = document.getElementById('change-sides');

    // Инициализация игры
    function initGame() {
        // Загружаем сохраненное состояние
        const hasSavedState = gameState.loadState();
        
        // Создаем ячейки, если их еще нет
        const board = document.getElementById('game-board');
        if (board.children.length === 0) {
            for (let i = 0; i < 9; i++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.setAttribute('data-index', i);
                cell.addEventListener('click', () => cellClicked(i));
                board.appendChild(cell);
            }
        }
        
        // Если есть сохраненное состояние, обновляем доску
        if (hasSavedState) {
            updateBoard();
        } else {
            // Иначе начинаем новую игру
            gameState.board = ['', '', '', '', '', '', '', '', ''];
            gameState.currentPlayer = 'X';
            gameState.gameActive = true;
            gameState.scores = { x: 0, o: 0, draw: 0 };
            gameState.saveState();
        }
        
        updateGameStatus();
        updateScores();
        updatePlayerIndicators();
        
        // Обновляем состояние каждые 500 мс для синхронизации между вкладками
        setInterval(() => {
            const savedState = localStorage.getItem('ticTacToeState');
            if (savedState) {
                const state = JSON.parse(savedState);
                // Проверяем, изменилось ли состояние
                if (JSON.stringify(state.board) !== JSON.stringify(gameState.board) ||
                    state.currentPlayer !== gameState.currentPlayer ||
                    state.gameActive !== gameState.gameActive) {
                    
                    gameState.board = state.board;
                    gameState.currentPlayer = state.currentPlayer;
                    gameState.gameActive = state.gameActive;
                    gameState.scores = state.scores;
                    
                    updateBoard();
                    updateGameStatus();
                    updateScores();
                    updatePlayerIndicators();
                }
            }
        }, 500);
    }

    // Обработка клика по ячейке
    function cellClicked(index) {
        // Проверяем, можно ли сделать ход
        if (gameState.board[index] !== '' || !gameState.gameActive) {
            return;
        }
        
        // Делаем ход
        gameState.board[index] = gameState.currentPlayer;
        gameState.saveState();
        
        // Проверяем результат
        checkGameResult();
        
        // Обновляем доску и статус
        updateBoard();
        updateGameStatus();
        updatePlayerIndicators();
    }

    // Обновление игровой доски
    function updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = gameState.board[index];
            cell.className = 'cell'; // Сбрасываем классы
            
            if (gameState.board[index] === 'X') {
                cell.classList.add('x');
            } else if (gameState.board[index] === 'O') {
                cell.classList.add('o');
            }
        });
    }

    // Проверка результата игры
    function checkGameResult() {
        let roundWon = false;
        let winningCombo = [];
        
        // Проверяем все выигрышные комбинации
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            
            if (gameState.board[a] === '' || gameState.board[b] === '' || gameState.board[c] === '') {
                continue;
            }
            
            if (gameState.board[a] === gameState.board[b] && gameState.board[b] === gameState.board[c]) {
                roundWon = true;
                winningCombo = winningConditions[i];
                break;
            }
        }
        
        if (roundWon) {
            // Победитель определен
            gameState.gameActive = false;
            
            // Обновляем счет
            if (gameState.currentPlayer === 'X') {
                gameState.scores.x++;
            } else {
                gameState.scores.o++;
            }
            
            // Подсвечиваем выигрышную комбинацию
            winningCombo.forEach(index => {
                document.querySelector(`.cell[data-index="${index}"]`).classList.add('win-cell');
            });
            
            gameState.saveState();
            return;
        }
        
        // Проверяем на ничью
        const roundDraw = !gameState.board.includes('');
        if (roundDraw) {
            gameState.gameActive = false;
            gameState.scores.draw++;
            gameState.saveState();
            return;
        }
        
        // Смена игрока
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        gameState.saveState();
    }

    // Обновление статуса игры
    function updateGameStatus() {
        if (gameState.gameActive) {
            gameStatus.innerHTML = `Ход игрока <span class="current-player">${gameState.currentPlayer}</span>`;
            currentPlayerSpan.textContent = gameState.currentPlayer;
        } else {
            // Проверяем, есть ли победитель
            const roundWon = winningConditions.some(condition => {
                const [a, b, c] = condition;
                return gameState.board[a] !== '' && 
                       gameState.board[a] === gameState.board[b] && 
                       gameState.board[b] === gameState.board[c];
            });
            
            if (roundWon) {
                const winner = gameState.currentPlayer === 'X' ? 'O' : 'X';
                gameStatus.innerHTML = `Победил игрок <span class="current-player">${winner}</span>!`;
            } else {
                gameStatus.innerHTML = 'Ничья!';
            }
        }
    }

    // Обновление счетов
    function updateScores() {
        scoreXElement.textContent = gameState.scores.x;
        scoreOElement.textContent = gameState.scores.o;
        scoreDrawElement.textContent = gameState.scores.draw;
    }

    // Обновление индикаторов игроков
    function updatePlayerIndicators() {
        if (gameState.currentPlayer === 'X') {
            playerXElement.classList.add('current');
            playerOElement.classList.remove('current');
            
            playerXElement.querySelector('.player-status').textContent = 'Ходит сейчас';
            playerOElement.querySelector('.player-status').textContent = 'Ожидает хода';
        } else {
            playerOElement.classList.add('current');
            playerXElement.classList.remove('current');
            
            playerOElement.querySelector('.player-status').textContent = 'Ходит сейчас';
            playerXElement.querySelector('.player-status').textContent = 'Ожидает хода';
        }
    }

    // Новая игра
    function newGame() {
        gameState.board = ['', '', '', '', '', '', '', '', ''];
        gameState.currentPlayer = 'X';
        gameState.gameActive = true;
        gameState.saveState();
        
        updateBoard();
        updateGameStatus();
        updatePlayerIndicators();
    }

    // Поменяться сторонами
    function changeSides() {
        // Меняем символы игроков
        const newBoard = gameState.board.map(cell => {
            if (cell === 'X') return 'O';
            if (cell === 'O') return 'X';
            return '';
        });
        
        gameState.board = newBoard;
        
        // Меняем текущего игрока, если игра активна
        if (gameState.gameActive) {
            gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        }
        
        // Меняем счет
        const tempScore = gameState.scores.x;
        gameState.scores.x = gameState.scores.o;
        gameState.scores.o = tempScore;
        
        gameState.saveState();
        
        updateBoard();
        updateGameStatus();
        updateScores();
        updatePlayerIndicators();
    }

    // Назначаем обработчики событий
    newGameButton.addEventListener('click', newGame);
    changeSidesButton.addEventListener('click', changeSides);

    // Запускаем игру
    initGame();
});
