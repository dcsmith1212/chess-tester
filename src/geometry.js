const distance = (p1, p2) => Math.max(Math.abs(p1[0] - p2[0]), Math.abs(p1[1] - p2[1]));
const twoPointsOnHorizontal = (p1, p2) => p1[1] === p2[1] ? true : false;
const twoPointsOnVertical = (p1, p2) => p1[0] === p2[0] ? true : false;
const twoPointsOnDiagonal = (p1, p2) => (Math.abs(p1[0] - p2[0]) === Math.abs(p1[1] - p2[1])) ? true : false;
const threePointsMakeLine = (p1, p2, p3) => {
    if ((twoPointsOnHorizontal(p1, p2) && twoPointsOnHorizontal(p1, p3)) ||
        (twoPointsOnDiagonal(p1, p2) && twoPointsOnDiagonal(p2, p3) && twoPointsOnDiagonal(p1, p3))) {
        return p1[0] < p2[0] && p2[0] < p3[0] || p1[0] > p2[0] && p2[0] > p3[0];
    }
    if (twoPointsOnVertical(p1, p2) && twoPointsOnVertical(p1, p3)) {
        return p1[1] < p2[1] && p2[1] < p3[1] || p1[1] > p2[1] && p2[1] > p3[1];;
    }
    return false;
}

const squareBlockedByPieceInPath = (potentiallyBlockedSquare, referenceSquare, piecesInPathOfReference) => {
    return piecesInPathOfReference.some(pieceInPathOfReference => {
        return threePointsMakeLine(potentiallyBlockedSquare, pieceInPathOfReference, referenceSquare);
    });
}

const arrayAdd = (arr1, arr2) => {
    const sum = [];
    for (let i = 0; i < arr1.length; i += 1) {
        sum[i] = arr1[i] + arr2[i];
    }
    return sum;
}

const moveDeltas = {
    knight: [
        [2, 1], [2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2], [-2, 1], [-2, -1]
    ],
    rook: [
        [-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0],
        [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
        [0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7],
        [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7]
    ],
    king: [
        [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
    ],
    bishop: [
        [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7],
        [1, -1], [2, -2], [3, -3], [4, -4], [5, -5], [6, -6], [7, -7],
        [-1, 1], [-2, 2], [-3, 3], [-4, 4], [-5, 5], [-6, 6], [-7, 7],
        [-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7]
    ],
    bottom_pawn: [
        [0, -1]
    ],
    top_pawn: [
        [0, 1]
    ],
    bottom_pawn_first: [
        [0, -1], [0, -2]
    ],
    top_pawn_first: [
        [0, 1], [0, 2]
    ]
}
moveDeltas['queen'] = moveDeltas['rook'].concat(moveDeltas['bishop']);

const pawnAttacks = {
    bottom_pawn: [[-1, -1], [1, -1]], top_pawn: [[-1, 1], [1, 1]],
    bottom_pawn_first: [[-1, -1], [1, -1]], top_pawn_first: [[-1, 1], [1, 1]]
}

export { squareBlockedByPieceInPath, distance, arrayAdd, moveDeltas, pawnAttacks }