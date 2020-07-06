import { squareBlockedByPieceInPath } from './geometry'
import { board } from './index'

class Piece {
    constructor(element) {
        this.element = element
        this.color = this.element.classList.contains('white') ? 'white' : 'black';
        this.squareElem = this.element.parentElement
        this.coords = board.getCoords(this.squareElem)
        this.type = board.pieceRawType(this.element)
        this.detailType = board.pieceType(this.element)
        this.taken = false
    }
    getValidMoves() {
        let piecesInPath = [];
        const neutralMoves = board.getPossibleMoves(this.detailType, this.coords)
            .filter(possibleCoords => {
                if (squareBlockedByPieceInPath(possibleCoords, this.coords, piecesInPath)) {
                    return false;
                } else {
                    if (board.pieceOnCoords(possibleCoords)) {
                        piecesInPath.push(possibleCoords)
                        return false;
                    }
                    return true;
                }
            });

        // Pawn moves aren't the same as pawn attacks, so we need to determine the attacks separately
        if (this.type === 'pawn') {
            piecesInPath = board.getPossiblePawnAttacks(this.detailType, this.coords);
        }

        return {
            neutralMoves: neutralMoves,
            attackMoves: piecesInPath.filter(possibleAttack => board.pieceOnCoords(possibleAttack).color !== this.color)
        }
    }
    move(nextSquare) {
        this.squareElem = nextSquare;
        board.state[this.coords].piece = undefined;
        this.coords = board.getCoords(nextSquare)
        board.state[this.coords].piece = this

        if (this.detailType.includes('pawn_first')) {
            this.detailType = this.detailType.replace('_first', '')
        }
    }
    drop(nextSquare) {
        this.squareElem = nextSquare;
        this.coords = board.getCoords(nextSquare);
        board.state[this.coords].piece = this;
    }
};

export { Piece as default }