// Firebase Realtime Database を使用したオンライン将棋ゲーム

let database = null;
let roomRef = null;
let game = null;
let playerRole = null;
let roomId = null;
let playerKey = null;
let opponentPresenceRef = null;

// 駒クラス
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

// Firebase将棋ゲームクラス
class FirebaseShogiGame {
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
        this.lastMove = null;
        this.initializeBoard();
        this.updateVisibility();
        this.renderBoard();
    }
    
    initializeBoard() {
        this.board = Array(9).fill(null).map(() => Array(9).fill(null));
        
        // 後手の配置
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
        
        // 先手の配置
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
                
                // 最後の移動位置をハイライト
                if (this.lastMove && 
                    ((this.lastMove.fromRow === row && this.lastMove.fromCol === col) ||
                     (this.lastMove.toRow === row && this.lastMove.toCol === col))) {
                    cell.classList.add('last-move');
                }
                
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
        
        // オンラインゲームで自分の手番でない場合は無視
        if (roomRef && playerRole !== this.currentPlayer) {
            return;
        }
        
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
        this.lastMove = { fromRow, fromCol, toRow, toCol };
        
        // Firebaseに移動を送信
        if (roomRef) {
            const moveData = {
                type: 'move',
                fromRow, fromCol, toRow, toCol,
                promoted: piece.promoted,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            roomRef.child('moves').push(moveData);
            roomRef.child('gameState').set(this.exportGameState());
        }
        
        this.currentPlayer = this.currentPlayer === 'sente' ? 'gote' : 'sente';
        this.updateVisibility();
        this.renderBoard();
    }
    
    dropPiece(pieceIndex, row, col) {
        const piece = this.capturedPieces[this.currentPlayer].splice(pieceIndex, 1)[0];
        this.board[row][col] = piece;
        this.lastMove = { drop: true, row, col };
        
        // Firebaseに持ち駒打ちを送信
        if (roomRef) {
            const moveData = {
                type: 'drop',
                pieceType: piece.type,
                row, col,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            roomRef.child('moves').push(moveData);
            roomRef.child('gameState').set(this.exportGameState());
        }
        
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
    
    selectCapturedPiece(owner, index) {
        if (owner !== this.currentPlayer) return;
        if (roomRef && playerRole !== this.currentPlayer) return;
        
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
    
    updateVisibility() {
        if (this.gameMode !== 'fog') {
            return;
        }
        
        this.visibleCells.clear();
        
        const viewPlayer = roomRef ? playerRole : this.currentPlayer;
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = this.board[row][col];
                if (piece && piece.owner === viewPlayer) {
                    this.visibleCells.add(`${row},${col}`);
                    
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
        
        if (roomRef) {
            roomRef.child('gameMode').set(mode);
        }
    }
    
    updateInfo() {
        const currentPlayerElement = document.getElementById('currentPlayer');
        
        if (!roomRef) {
            currentPlayerElement.textContent = this.currentPlayer === 'sente' ? '先手の番' : '後手の番';
        } else if (playerRole) {
            const isMyTurn = this.currentPlayer === playerRole;
            currentPlayerElement.textContent = isMyTurn ? 
                'あなたの番です' : 
                '相手の番です';
        }
        
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
    
    endGame() {
        this.gameOver = true;
        const winner = this.currentPlayer === 'sente' ? '先手' : '後手';
        const gameOverElement = document.getElementById('gameOver');
        const winnerTextElement = document.getElementById('winnerText');
        winnerTextElement.textContent = `${winner}の勝利！`;
        gameOverElement.classList.add('show');
        
        if (roomRef) {
            roomRef.child('gameOver').set({
                winner: this.currentPlayer,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        }
    }
    
    exportGameState() {
        return {
            board: this.board.map(row => row.map(piece => 
                piece ? { 
                    type: piece.type, 
                    owner: piece.owner, 
                    promoted: piece.promoted 
                } : null
            )),
            currentPlayer: this.currentPlayer,
            capturedPieces: {
                sente: this.capturedPieces.sente.map(p => ({ 
                    type: p.type, 
                    owner: p.owner, 
                    promoted: p.promoted 
                })),
                gote: this.capturedPieces.gote.map(p => ({ 
                    type: p.type, 
                    owner: p.owner, 
                    promoted: p.promoted 
                }))
            },
            gameMode: this.gameMode,
            lastMove: this.lastMove
        };
    }
    
    importGameState(state) {
        if (!state) return;
        
        this.board = state.board.map(row => row.map(piece => 
            piece ? new Piece(piece.type, piece.owner, piece.promoted) : null
        ));
        this.currentPlayer = state.currentPlayer;
        this.capturedPieces = {
            sente: (state.capturedPieces.sente || []).map(p => 
                new Piece(p.type, p.owner, p.promoted)
            ),
            gote: (state.capturedPieces.gote || []).map(p => 
                new Piece(p.type, p.owner, p.promoted)
            )
        };
        this.gameMode = state.gameMode || 'standard';
        this.lastMove = state.lastMove || null;
        this.updateVisibility();
        this.renderBoard();
    }
}

// Firebase初期化とゲーム管理
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDKが読み込まれていません');
        return;
    }
    
    database = firebase.database();
    
    // 接続状態の監視
    database.ref('.info/connected').on('value', (snapshot) => {
        const connected = snapshot.val();
        const statusElement = document.getElementById('firebaseStatus');
        if (connected) {
            statusElement.textContent = 'Firebase: 接続中';
            statusElement.className = 'firebase-status firebase-connected';
        } else {
            statusElement.textContent = 'Firebase: 未接続';
            statusElement.className = 'firebase-status firebase-disconnected';
        }
    });
}

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createRoom() {
    if (!database) {
        alert('Firebaseに接続されていません');
        return;
    }
    
    roomId = generateRoomId();
    roomRef = database.ref(`rooms/${roomId}`);
    playerKey = database.ref().push().key;
    playerRole = 'sente';
    
    // 部屋の初期設定
    roomRef.set({
        created: firebase.database.ServerValue.TIMESTAMP,
        players: {
            sente: {
                id: playerKey,
                online: true,
                joined: firebase.database.ServerValue.TIMESTAMP
            }
        },
        gameState: game.exportGameState()
    });
    
    // プレイヤーのオンライン状態管理
    setupPresence();
    
    // 部屋の変更を監視
    setupRoomListeners();
    
    // UI更新
    document.getElementById('roomId').textContent = roomId;
    document.getElementById('playerRole').textContent = 'あなたは先手です';
    document.getElementById('roomInfo').classList.add('show');
    document.getElementById('createRoomBtn').disabled = true;
    document.getElementById('joinRoomBtn').disabled = true;
    
    game.initializeBoard();
    game.renderBoard();
}

function joinRoom() {
    const inputRoomId = document.getElementById('roomIdInput').value.toUpperCase();
    if (!inputRoomId) {
        alert('部屋IDを入力してください');
        return;
    }
    
    if (!database) {
        alert('Firebaseに接続されていません');
        return;
    }
    
    roomId = inputRoomId;
    roomRef = database.ref(`rooms/${roomId}`);
    playerKey = database.ref().push().key;
    
    // 部屋の存在確認
    roomRef.once('value', (snapshot) => {
        const roomData = snapshot.val();
        if (!roomData) {
            alert('部屋が存在しません');
            return;
        }
        
        // 先手が空いているか確認
        if (!roomData.players || !roomData.players.sente) {
            playerRole = 'sente';
        } else if (!roomData.players.gote) {
            playerRole = 'gote';
        } else {
            alert('部屋が満員です');
            return;
        }
        
        // プレイヤー情報を追加
        roomRef.child(`players/${playerRole}`).set({
            id: playerKey,
            online: true,
            joined: firebase.database.ServerValue.TIMESTAMP
        });
        
        // プレイヤーのオンライン状態管理
        setupPresence();
        
        // 部屋の変更を監視
        setupRoomListeners();
        
        // UI更新
        document.getElementById('roomId').textContent = roomId;
        document.getElementById('playerRole').textContent = 
            `あなたは${playerRole === 'sente' ? '先手' : '後手'}です`;
        document.getElementById('roomInfo').classList.add('show');
        document.getElementById('createRoomBtn').disabled = true;
        document.getElementById('joinRoomBtn').disabled = true;
        
        // ゲーム状態を同期
        if (roomData.gameState) {
            game.importGameState(roomData.gameState);
        }
        
        // 両プレイヤーが揃ったことを通知
        if (roomData.players && roomData.players.sente && playerRole === 'gote') {
            document.getElementById('connectionStatus').textContent = 'ゲーム開始！';
            document.getElementById('connectionStatus').className = 'connection-status connected';
        }
    });
}

function setupPresence() {
    // オンライン/オフライン状態の管理
    const myPresenceRef = roomRef.child(`players/${playerRole}/online`);
    const connectedRef = database.ref('.info/connected');
    
    connectedRef.on('value', (snapshot) => {
        if (snapshot.val()) {
            myPresenceRef.onDisconnect().set(false);
            myPresenceRef.set(true);
        }
    });
}

function setupRoomListeners() {
    // ゲーム状態の監視
    roomRef.child('gameState').on('value', (snapshot) => {
        const state = snapshot.val();
        if (state) {
            game.importGameState(state);
        }
    });
    
    // プレイヤーの参加/離脱を監視
    roomRef.child('players').on('value', (snapshot) => {
        const players = snapshot.val();
        if (!players) return;
        
        const hasSente = players.sente && players.sente.online;
        const hasGote = players.gote && players.gote.online;
        
        if (hasSente && hasGote) {
            document.getElementById('connectionStatus').textContent = 'ゲーム開始！';
            document.getElementById('connectionStatus').className = 'connection-status connected';
        } else if (playerRole) {
            document.getElementById('connectionStatus').textContent = '対戦相手を待っています...';
            document.getElementById('connectionStatus').className = 'connection-status waiting';
        }
        
        // 相手のオンライン状態表示
        if (playerRole === 'sente' && players.gote) {
            updateOpponentStatus(players.gote.online);
        } else if (playerRole === 'gote' && players.sente) {
            updateOpponentStatus(players.sente.online);
        }
    });
    
    // ゲーム終了の監視
    roomRef.child('gameOver').on('value', (snapshot) => {
        const gameOverData = snapshot.val();
        if (gameOverData) {
            const winner = gameOverData.winner === 'sente' ? '先手' : '後手';
            document.getElementById('winnerText').textContent = `${winner}の勝利！`;
            document.getElementById('gameOver').classList.add('show');
        }
    });
    
    // ゲームモードの監視
    roomRef.child('gameMode').on('value', (snapshot) => {
        const mode = snapshot.val();
        if (mode && mode !== game.gameMode) {
            game.gameMode = mode;
            game.updateVisibility();
            game.renderBoard();
            document.getElementById('gameMode').value = mode;
        }
    });
}

function updateOpponentStatus(online) {
    const statusElement = document.getElementById('opponentStatus');
    if (online) {
        statusElement.textContent = '対戦相手: オンライン';
        statusElement.className = 'opponent-status opponent-online';
    } else {
        statusElement.textContent = '対戦相手: オフライン';
        statusElement.className = 'opponent-status opponent-offline';
    }
}

function resetGame() {
    const gameOverElement = document.getElementById('gameOver');
    gameOverElement.classList.remove('show');
    const promotionDialog = document.getElementById('promotionDialog');
    promotionDialog.classList.remove('show');
    
    game = new FirebaseShogiGame();
    
    if (roomRef) {
        // Firebase上のゲーム状態をリセット
        roomRef.child('gameState').set(game.exportGameState());
        roomRef.child('gameOver').remove();
        roomRef.child('moves').remove();
    }
}

function leaveRoom() {
    if (roomRef && playerRole) {
        roomRef.child(`players/${playerRole}`).remove();
        roomRef = null;
        playerRole = null;
        roomId = null;
    }
    
    // UI初期化
    document.getElementById('roomInfo').classList.remove('show');
    document.getElementById('createRoomBtn').disabled = false;
    document.getElementById('joinRoomBtn').disabled = false;
    document.getElementById('roomIdInput').value = '';
    document.getElementById('gameOver').classList.remove('show');
    
    // 新しいローカルゲームを開始
    game = new FirebaseShogiGame();
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

function copyRoomId() {
    const roomIdElement = document.getElementById('roomId');
    const roomIdText = roomIdElement.textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(roomIdText).then(() => {
            const originalText = roomIdElement.textContent;
            roomIdElement.textContent = 'コピーしました！';
            setTimeout(() => {
                roomIdElement.textContent = originalText;
            }, 1500);
        });
    } else {
        // フォールバック
        const textArea = document.createElement('textarea');
        textArea.value = roomIdText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const originalText = roomIdElement.textContent;
        roomIdElement.textContent = 'コピーしました！';
        setTimeout(() => {
            roomIdElement.textContent = originalText;
        }, 1500);
    }
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    game = new FirebaseShogiGame();
    initFirebase();
});