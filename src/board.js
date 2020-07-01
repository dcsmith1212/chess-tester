import { moveDeltas, pawnAttacks, distance, arrayAdd } from './geometry'

class Board {
    constructor(playerColor) {
        this.width = 8
        this.state = {};
        this.activePiece;
        this.playerColor = playerColor
        this.currentColor = 'white'
        this.takenPieces = {
            white: {},
            black: {}
        }
    }
    associateCoordsAndElems(coords, squareElem, piece) {
        this.state[coords] = {
            squareElem,
            piece
        }
    }
    activatePiece(pieceElem) {
        this.activePiece = this.getPiece(pieceElem.parentElement)
        this.activePiece.element.classList.add('active-piece');
        return this.activePiece.getValidMoves();
    }
    toggleActiveColor() {
        this.currentColor = this.currentColor === 'white' ? 'black' : 'white';
        Object.values(this.state).forEach(square => {
            if (square.piece) square.piece.element.classList.toggle('turn');
        });
    }
    validCoords(coords) {
        return (0 <= coords[0] && coords[0] <= this.width - 1 &&
            0 <= coords[1] && coords[1] <= this.width - 1);
    }
    pieceOnCoords(coords) {
        return this.state[coords].piece;
    }
    getSquare(coords) {
        return this.state[coords].squareElem;
    }
    getCoords(square) {
        return [parseInt(square.getAttribute('xcoord')), parseInt(square.getAttribute('ycoord'))];
    }
    getPiece(square) {
        return this.pieceOnCoords(this.getCoords(square));
    }
    moveActivePiece(square) {
        this.activePiece.move(square);
        this.checkPawnPromotion(square);
        this.toggleActiveColor();
    }
    takePiece(piece) {
        const color = piece.color;
        const type = piece.type;
        this.takenPieces[color][type] = ++this.takenPieces[color][type] || 1;
    }
    pieceRawType(piece) {
        const pieceTypeClass = [...piece.classList].filter(cl => cl.includes('fa-chess'))[0];
        return pieceTypeClass.split('-')[2];
    }
    pieceType(pieceElem) {
        const rawType = this.pieceRawType(pieceElem);
        if (rawType === 'pawn') {
            const isWhite = pieceElem.classList.contains('white');
            if ((isWhite && this.playerColor === 'white') || (!isWhite && this.playerColor === 'black')) {
                return this.getCoords(pieceElem.parentElement)[1] === 6 ? 'bottom_pawn_first' : 'bottom_pawn';
            } else {
                return this.getCoords(pieceElem.parentElement)[1] === 1 ? 'top_pawn_first' : 'top_pawn';
            }
        } else {
            return rawType;
        }
    }
    getPossibleMoves(detailTypeOfPiece, currentCoords) {
        return moveDeltas[detailTypeOfPiece]
            .map(delta => arrayAdd(currentCoords, delta))
            .filter(this.validCoords.bind(this))
            .sort((a, b) => distance(currentCoords, a) - distance(currentCoords, b))
    }
    getPossiblePawnAttacks(detailTypeOfPiece, currentCoords) {
        return pawnAttacks[detailTypeOfPiece]
            .map(delta => arrayAdd(currentCoords, delta))
            .filter(this.validCoords.bind(this))
            .filter(this.pieceOnCoords.bind(this))
    }
    checkPawnPromotion(square) {
        const piece = this.getPiece(square);
        if (piece.type === 'pawn' && [0, 7].includes(piece.coords[1])) {
            piece.element.classList.remove('fa-chess-pawn');
            piece.element.classList.add('fa-chess-queen');
            piece.type = 'queen';
            piece.detailType = 'queen'
            square.innerHTML = piece.element.outerHTML
        }
    }
}

export { Board as default }