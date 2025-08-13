class Piece {
    constructor(type, owner, promoted = false) {
        this.type = type;
        this.owner = owner;
        this.promoted = promoted;
    }
    
    getDisplay() {
        const pieces = {
            'K': '王',
            'R': this.promoted ? '龍' : '飛',
            'B': this.promoted ? '馬' : '角',
            'G': '金',
            'S': this.promoted ? '全' : '銀',
            'N': this.promoted ? '圭' : '桂',
            'L': this.promoted ? '杏' : '香',
            'P': this.promoted ? 'と' : '歩'
        };
        return pieces[this.type] || '';
    }
    
    canPromote(fromRow, toRow) {
        if (this.promoted || this.type === 'K' || this.type === 'G') {
            return false;
        }
        
        if (this.owner === 'sente') {
            return fromRow <= 2 || toRow <= 2;
        } else {
            return fromRow >= 6 || toRow >= 6;
        }
    }
    
    getValidMoves(row, col, board) {
        const moves = [];
        const direction = this.owner === 'sente' ? -1 : 1;
        
        switch(this.type) {
            case 'K':
                const kingMoves = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 0], [1, 1]
                ];
                kingMoves.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (this.isValidMove(newRow, newCol, board)) {
                        moves.push([newRow, newCol]);
                    }
                });
                break;
                
            case 'R':
                if (this.promoted) {
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row - i, col, board, moves)) break;
                    }
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row + i, col, board, moves)) break;
                    }
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row, col - i, board, moves)) break;
                    }
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row, col + i, board, moves)) break;
                    }
                    [[1,1], [1,-1], [-1,1], [-1,-1]].forEach(([dr, dc]) => {
                        this.addMove(row + dr, col + dc, board, moves);
                    });
                } else {
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row - i, col, board, moves)) break;
                    }
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row + i, col, board, moves)) break;
                    }
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row, col - i, board, moves)) break;
                    }
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row, col + i, board, moves)) break;
                    }
                }
                break;
                
            case 'B':
                if (this.promoted) {
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row - i, col - i, board, moves)) break;
                    }
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row - i, col + i, board, moves)) break;
                    }
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row + i, col - i, board, moves)) break;
                    }
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row + i, col + i, board, moves)) break;
                    }
                    [[1,0], [-1,0], [0,1], [0,-1]].forEach(([dr, dc]) => {
                        this.addMove(row + dr, col + dc, board, moves);
                    });
                } else {
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row - i, col - i, board, moves)) break;
                    }
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row - i, col + i, board, moves)) break;
                    }
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row + i, col - i, board, moves)) break;
                    }
                    for (let i = 1; i < 9; i++) {
                        if (!this.addMove(row + i, col + i, board, moves)) break;
                    }
                }
                break;
                
            case 'G':
                const goldMoves = this.owner === 'sente' ? 
                    [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]] :
                    [[1, -1], [1, 0], [1, 1], [0, -1], [0, 1], [-1, 0]];
                goldMoves.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (this.isValidMove(newRow, newCol, board)) {
                        moves.push([newRow, newCol]);
                    }
                });
                break;
                
            case 'S':
                if (this.promoted) {
                    const goldMoves = this.owner === 'sente' ? 
                        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]] :
                        [[1, -1], [1, 0], [1, 1], [0, -1], [0, 1], [-1, 0]];
                    goldMoves.forEach(([dr, dc]) => {
                        const newRow = row + dr;
                        const newCol = col + dc;
                        if (this.isValidMove(newRow, newCol, board)) {
                            moves.push([newRow, newCol]);
                        }
                    });
                } else {
                    const silverMoves = this.owner === 'sente' ?
                        [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 1]] :
                        [[1, -1], [1, 0], [1, 1], [-1, -1], [-1, 1]];
                    silverMoves.forEach(([dr, dc]) => {
                        const newRow = row + dr;
                        const newCol = col + dc;
                        if (this.isValidMove(newRow, newCol, board)) {
                            moves.push([newRow, newCol]);
                        }
                    });
                }
                break;
                
            case 'N':
                if (this.promoted) {
                    const goldMoves = this.owner === 'sente' ? 
                        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]] :
                        [[1, -1], [1, 0], [1, 1], [0, -1], [0, 1], [-1, 0]];
                    goldMoves.forEach(([dr, dc]) => {
                        const newRow = row + dr;
                        const newCol = col + dc;
                        if (this.isValidMove(newRow, newCol, board)) {
                            moves.push([newRow, newCol]);
                        }
                    });
                } else {
                    const knightMoves = this.owner === 'sente' ?
                        [[-2, -1], [-2, 1]] :
                        [[2, -1], [2, 1]];
                    knightMoves.forEach(([dr, dc]) => {
                        const newRow = row + dr;
                        const newCol = col + dc;
                        if (this.isValidMove(newRow, newCol, board)) {
                            moves.push([newRow, newCol]);
                        }
                    });
                }
                break;
                
            case 'L':
                if (this.promoted) {
                    const goldMoves = this.owner === 'sente' ? 
                        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]] :
                        [[1, -1], [1, 0], [1, 1], [0, -1], [0, 1], [-1, 0]];
                    goldMoves.forEach(([dr, dc]) => {
                        const newRow = row + dr;
                        const newCol = col + dc;
                        if (this.isValidMove(newRow, newCol, board)) {
                            moves.push([newRow, newCol]);
                        }
                    });
                } else {
                    for (let i = 1; i < 9; i++) {
                        const newRow = row + (direction * i);
                        if (!this.addMove(newRow, col, board, moves)) break;
                    }
                }
                break;
                
            case 'P':
                if (this.promoted) {
                    const goldMoves = this.owner === 'sente' ? 
                        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]] :
                        [[1, -1], [1, 0], [1, 1], [0, -1], [0, 1], [-1, 0]];
                    goldMoves.forEach(([dr, dc]) => {
                        const newRow = row + dr;
                        const newCol = col + dc;
                        if (this.isValidMove(newRow, newCol, board)) {
                            moves.push([newRow, newCol]);
                        }
                    });
                } else {
                    const newRow = row + direction;
                    if (this.isValidMove(newRow, col, board)) {
                        moves.push([newRow, col]);
                    }
                }
                break;
        }
        
        return moves;
    }
    
    isValidMove(row, col, board) {
        if (row < 0 || row >= 9 || col < 0 || col >= 9) {
            return false;
        }
        const target = board[row][col];
        return !target || target.owner !== this.owner;
    }
    
    addMove(row, col, board, moves) {
        if (row < 0 || row >= 9 || col < 0 || col >= 9) {
            return false;
        }
        const target = board[row][col];
        if (!target) {
            moves.push([row, col]);
            return true;
        } else if (target.owner !== this.owner) {
            moves.push([row, col]);
            return false;
        }
        return false;
    }
}

class ShogiGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'sente';
        this.selectedCell = null;
        this.selectedCapturedPiece = null;
        this.possibleMoves = [];
        this.capturedPieces = {
            sente: [],
            gote: []
        };
        this.gameOver = false;
        this.gameMode = 'standard';
        this.pendingPromotion = null;
        this.visibleCells = new Set();
        this.initializeBoard();
        this.updateVisibility();
        this.renderBoard();
    }
    
    initializeBoard() {
        this.board = Array(9).fill(null).map(() => Array(9).fill(null));
        
        this.board[0][0] = new Piece('L', 'gote');
        this.board[0][1] = new Piece('N', 'gote');
        this.board[0][2] = new Piece('S', 'gote');
        this.board[0][3] = new Piece('G', 'gote');
        this.board[0][4] = new Piece('K', 'gote');
        this.board[0][5] = new Piece('G', 'gote');
        this.board[0][6] = new Piece('S', 'gote');
        this.board[0][7] = new Piece('N', 'gote');
        this.board[0][8] = new Piece('L', 'gote');
        
        this.board[1][7] = new Piece('B', 'gote');
        this.board[1][1] = new Piece('R', 'gote');
        
        for (let i = 0; i < 9; i++) {
            this.board[2][i] = new Piece('P', 'gote');
        }
        
        for (let i = 0; i < 9; i++) {
            this.board[6][i] = new Piece('P', 'sente');
        }
        
        this.board[7][7] = new Piece('R', 'sente');
        this.board[7][1] = new Piece('B', 'sente');
        
        this.board[8][0] = new Piece('L', 'sente');
        this.board[8][1] = new Piece('N', 'sente');
        this.board[8][2] = new Piece('S', 'sente');
        this.board[8][3] = new Piece('G', 'sente');
        this.board[8][4] = new Piece('K', 'sente');
        this.board[8][5] = new Piece('G', 'sente');
        this.board[8][6] = new Piece('S', 'sente');
        this.board[8][7] = new Piece('N', 'sente');
        this.board[8][8] = new Piece('L', 'sente');
    }
    
    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const cellKey = `${row},${col}`;
                if (this.gameMode === 'fog') {
                    if (!this.visibleCells.has(cellKey)) {
                        cell.classList.add('fog-cell');
                    } else {
                        cell.classList.add('visible-cell');
                    }
                }
                
                if (this.selectedCell && 
                    this.selectedCell[0] === row && 
                    this.selectedCell[1] === col) {
                    cell.classList.add('selected');
                }
                
                if (this.possibleMoves.some(move => move[0] === row && move[1] === col)) {
                    cell.classList.add('possible-move');
                }
                
                const piece = this.board[row][col];
                if (piece) {
                    if (this.gameMode === 'fog' && !this.visibleCells.has(cellKey)) {
                        // 霧モードで見えない駒は表示しない
                    } else {
                        const pieceElement = document.createElement('div');
                        pieceElement.className = `piece ${piece.owner}`;
                        pieceElement.textContent = piece.getDisplay();
                        cell.appendChild(pieceElement);
                    }
                }
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                boardElement.appendChild(cell);
            }
        }
        
        this.updateInfo();
    }
    
    handleCellClick(row, col) {
        if (this.gameOver) return;
        
        if (this.selectedCapturedPiece !== null) {
            // 持ち駒を打つ
            if (!this.board[row][col] && this.canDropPiece(this.selectedCapturedPiece, row, col)) {
                this.dropPiece(this.selectedCapturedPiece, row, col);
                this.selectedCapturedPiece = null;
                this.possibleMoves = [];
            } else {
                this.selectedCapturedPiece = null;
                this.possibleMoves = [];
            }
        } else if (this.selectedCell) {
            if (this.possibleMoves.some(move => move[0] === row && move[1] === col)) {
                this.movePiece(this.selectedCell[0], this.selectedCell[1], row, col);
                this.selectedCell = null;
                this.possibleMoves = [];
            } else {
                const piece = this.board[row][col];
                if (piece && piece.owner === this.currentPlayer) {
                    this.selectedCell = [row, col];
                    this.selectedCapturedPiece = null;
                    this.possibleMoves = piece.getValidMoves(row, col, this.board);
                } else {
                    this.selectedCell = null;
                    this.possibleMoves = [];
                }
            }
        } else {
            const piece = this.board[row][col];
            if (piece && piece.owner === this.currentPlayer) {
                this.selectedCell = [row, col];
                this.selectedCapturedPiece = null;
                this.possibleMoves = piece.getValidMoves(row, col, this.board);
            }
        }
        
        this.renderBoard();
    }
    
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        if (capturedPiece) {
            if (capturedPiece.type === 'K') {
                this.endGame();
                return;
            }
            const newPiece = new Piece(
                capturedPiece.type,
                this.currentPlayer,
                false
            );
            this.capturedPieces[this.currentPlayer].push(newPiece);
        }
        
        if (piece.canPromote(fromRow, toRow)) {
            if (this.mustPromote(piece, toRow)) {
                piece.promoted = true;
                this.completeMove(fromRow, fromCol, toRow, toCol, piece);
            } else {
                this.pendingPromotion = {
                    fromRow, fromCol, toRow, toCol, piece
                };
                this.showPromotionDialog();
                return;
            }
        } else {
            this.completeMove(fromRow, fromCol, toRow, toCol, piece);
        }
    }
    
    completeMove(fromRow, fromCol, toRow, toCol, piece) {
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        this.currentPlayer = this.currentPlayer === 'sente' ? 'gote' : 'sente';
        this.updateVisibility();
        this.renderBoard();
    }
    
    showPromotionDialog() {
        const dialog = document.getElementById('promotionDialog');
        dialog.classList.add('show');
    }
    
    handlePromotionChoice(promote) {
        const dialog = document.getElementById('promotionDialog');
        dialog.classList.remove('show');
        
        if (this.pendingPromotion) {
            const {fromRow, fromCol, toRow, toCol, piece} = this.pendingPromotion;
            if (promote) {
                piece.promoted = true;
            }
            this.completeMove(fromRow, fromCol, toRow, toCol, piece);
            this.pendingPromotion = null;
        }
    }
    
    mustPromote(piece, toRow) {
        if (piece.type === 'P' || piece.type === 'L') {
            if (piece.owner === 'sente' && toRow === 0) return true;
            if (piece.owner === 'gote' && toRow === 8) return true;
        }
        if (piece.type === 'N') {
            if (piece.owner === 'sente' && toRow <= 1) return true;
            if (piece.owner === 'gote' && toRow >= 7) return true;
        }
        return false;
    }
    
    updateInfo() {
        const currentPlayerElement = document.getElementById('currentPlayer');
        currentPlayerElement.textContent = this.currentPlayer === 'sente' ? '先手の番' : '後手の番';
        
        const senteCapturedElement = document.getElementById('senteCaptured');
        senteCapturedElement.innerHTML = '';
        this.capturedPieces.sente.forEach((piece, index) => {
            const pieceElement = document.createElement('span');
            pieceElement.className = 'captured-piece sente';
            if (this.currentPlayer === 'sente' && this.selectedCapturedPiece === index) {
                pieceElement.classList.add('selected');
            }
            pieceElement.textContent = piece.getDisplay();
            pieceElement.addEventListener('click', () => this.selectCapturedPiece('sente', index));
            senteCapturedElement.appendChild(pieceElement);
        });
        
        const goteCapturedElement = document.getElementById('goteCaptured');
        goteCapturedElement.innerHTML = '';
        this.capturedPieces.gote.forEach((piece, index) => {
            const pieceElement = document.createElement('span');
            pieceElement.className = 'captured-piece gote';
            if (this.currentPlayer === 'gote' && this.selectedCapturedPiece === index) {
                pieceElement.classList.add('selected');
            }
            pieceElement.textContent = piece.getDisplay();
            pieceElement.addEventListener('click', () => this.selectCapturedPiece('gote', index));
            goteCapturedElement.appendChild(pieceElement);
        });
    }
    
    selectCapturedPiece(owner, index) {
        if (owner !== this.currentPlayer) return;
        
        this.selectedCell = null;
        this.selectedCapturedPiece = index;
        this.possibleMoves = this.getDroppableSquares(this.capturedPieces[owner][index]);
        this.renderBoard();
    }
    
    getDroppableSquares(piece) {
        const moves = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (!this.board[row][col] && this.canDropPiece(piece, row, col)) {
                    moves.push([row, col]);
                }
            }
        }
        return moves;
    }
    
    canDropPiece(pieceIndex, row, col) {
        const piece = this.capturedPieces[this.currentPlayer][pieceIndex];
        
        // 二歩チェック
        if (piece.type === 'P') {
            for (let r = 0; r < 9; r++) {
                if (this.board[r][col] && 
                    this.board[r][col].type === 'P' && 
                    this.board[r][col].owner === this.currentPlayer &&
                    !this.board[r][col].promoted) {
                    return false;
                }
            }
        }
        
        // 行き所のない駒チェック
        if (piece.type === 'P' || piece.type === 'L') {
            if (this.currentPlayer === 'sente' && row === 0) return false;
            if (this.currentPlayer === 'gote' && row === 8) return false;
        }
        if (piece.type === 'N') {
            if (this.currentPlayer === 'sente' && row <= 1) return false;
            if (this.currentPlayer === 'gote' && row >= 7) return false;
        }
        
        return true;
    }
    
    dropPiece(pieceIndex, row, col) {
        const piece = this.capturedPieces[this.currentPlayer].splice(pieceIndex, 1)[0];
        this.board[row][col] = piece;
        this.currentPlayer = this.currentPlayer === 'sente' ? 'gote' : 'sente';
        this.updateVisibility();
    }
    
    updateVisibility() {
        if (this.gameMode !== 'fog') {
            return;
        }
        
        this.visibleCells.clear();
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = this.board[row][col];
                if (piece && piece.owner === this.currentPlayer) {
                    // 自分の駒の位置を追加
                    this.visibleCells.add(`${row},${col}`);
                    
                    // その駒が移動できる範囲を追加
                    const moves = piece.getValidMoves(row, col, this.board);
                    moves.forEach(([r, c]) => {
                        this.visibleCells.add(`${r},${c}`);
                    });
                }
            }
        }
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        this.updateVisibility();
        this.renderBoard();
    }
    
    endGame() {
        this.gameOver = true;
        const winner = this.currentPlayer === 'sente' ? '先手' : '後手';
        const gameOverElement = document.getElementById('gameOver');
        const winnerTextElement = document.getElementById('winnerText');
        winnerTextElement.textContent = `${winner}の勝利！`;
        gameOverElement.classList.add('show');
    }
}

let game;

function resetGame() {
    const gameOverElement = document.getElementById('gameOver');
    gameOverElement.classList.remove('show');
    const promotionDialog = document.getElementById('promotionDialog');
    promotionDialog.classList.remove('show');
    game = new ShogiGame();
}

function handlePromotion(promote) {
    if (game) {
        game.handlePromotionChoice(promote);
    }
}

function changeGameMode() {
    const modeSelect = document.getElementById('gameMode');
    if (game) {
        game.setGameMode(modeSelect.value);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    game = new ShogiGame();
});