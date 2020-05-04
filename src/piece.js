import { getCoords, getColor, pieceOnCoords } from './index'
import { squareBlockedByPieceInPath, getPossibleMoves, getPossiblePawnAttacks, pieceType, pieceRawType } from './helper-fns'

const getValidMoves = piece => {
    let piecesInPath = [];
    const currentCoords = getCoords(piece.parentElement);
    const neutralMoves = getPossibleMoves(pieceType(piece), currentCoords)
        .filter(square => {
            if (squareBlockedByPieceInPath(square, currentCoords, piecesInPath)) {
                return false;
            } else {
                if (pieceOnCoords(square)) {
                    piecesInPath.push(square);
                    return false;
                }
                return true;
            }
        });

    if (pieceRawType(piece) === 'pawn') piecesInPath = getPossiblePawnAttacks(pieceType(piece), currentCoords);

    return {
        neutralMoves: neutralMoves,
        attackMoves: piecesInPath.filter(possibleAttack => pieceOnCoords(possibleAttack) !== getColor(piece))
    }
}

export { getValidMoves, pieceRawType }