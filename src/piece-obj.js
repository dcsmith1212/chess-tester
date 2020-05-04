import { squareBlockedByPieceInPath, pieceRawType, pieceType, getPossibleMoves } from './helper-fns'
import { getCoords, getColor, pieceOnCoords } from './index'

class Piece {
    constructor(pieceElement) {
        this.element = pieceElement
        this.color = getColor(this.element)
        this.type = pieceRawType(this.element)
        this.detailType = pieceType(this.element)
        this.squareElem = this.element.parentElement
        this.coords = getCoords(this.squareElem)
    }
    getValidMoves() {
        let piecesInPath = [];
        const neutralMoves = getPossibleMoves(this.detailType, this.coords)
            .filter(possibleCoords => {
                if (squareBlockedByPieceInPath(possibleCoords, this.coords, piecesInPath)) {
                    return false;
                } else {
                    if (pieceOnCoords(possibleCoords)) {
                        piecesInPath.push(possibleCoords)
                        return false;
                    }
                    return true;
                }
            });

        // Pawn moves aren't the same as pawn attacks, so we need to determine the attacks separately
        if (this.type === 'pawn') piecesInPath = getPossiblePawnAttacks(this.detailType, this.coods);

        return {
            neutralMoves: neutralMoves,
            attackMoves: piecesInPath.filter(possibleAttack => pieceOnCoords(possibleAttack) !== this.color)
        }
    }
};