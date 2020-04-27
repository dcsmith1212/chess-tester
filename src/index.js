const squares = document.querySelectorAll('.square');
const boardWidth = 8;
const playerColor = 'white';
const boardState = {};
let activePiece;
let activeCoords;

const coordsToSquareElem = {};
const getCoords = squareElem => [parseInt(squareElem.getAttribute('xcoord')), parseInt(squareElem.getAttribute('ycoord'))];
const getColor = piece => piece.classList.contains('white') ? 'white' : 'black';
const getPiece = square => square.children[0];

const distance = (p1, p2) => {
    return Math.max(Math.abs(p1[0] - p2[0]), Math.abs(p1[1] - p2[1]));
}

const twoPointsOnHorizontal = (p1, p2) => p1[1] === p2[1] ? true : false;
const twoPointsOnVertical = (p1, p2) => p1[0] === p2[0] ? true : false;
const twoPointsOnDiagonal = (p1, p2) => (Math.abs(p1[0] - p2[0]) === Math.abs(p1[1] - p2[1])) ? true : false;

const threePointsMakeLine = (p1, p2, p3) => {
    if (twoPointsOnHorizontal(p1, p2) && twoPointsOnHorizontal(p2, p3) && twoPointsOnHorizontal(p1, p3)) {
        return p1[0] < p2[0] && p2[0] < p3[0] || p1[0] > p2[0] && p2[0] > p3[0];
    }
    if (twoPointsOnVertical(p1, p2) && twoPointsOnVertical(p2, p3) && twoPointsOnVertical(p1, p3)) {
        return p1[1] < p2[1] && p2[1] < p3[1] || p1[1] > p2[1] && p2[1] > p3[1];;
    }
    if (twoPointsOnDiagonal(p1, p2) && twoPointsOnDiagonal(p2, p3) && twoPointsOnDiagonal(p1, p3)) {
        return p1[0] < p2[0] && p2[0] < p3[0] || p1[0] > p2[0] && p2[0] > p3[0];
    }
    return false;
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
    queen: [
        [-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0],
        [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
        [0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7],
        [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
        [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7],
        [1, -1], [2, -2], [3, -3], [4, -4], [5, -5], [6, -6], [7, -7],
        [-1, 1], [-2, 2], [-3, 3], [-4, 4], [-5, 5], [-6, 6], [-7, 7],
        [-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7]
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

const pieceType = piece => {
    const classArray = [...piece.classList];
    const pieceTypeClass = classArray.filter(cl => cl.includes('fa-chess'))[0];
    const rawType = pieceTypeClass.split('-')[2];
    if (rawType === 'pawn') {
        const isWhite = classArray.includes('white');
        if ((isWhite && playerColor === 'white') || (!isWhite && playerColor === 'black')) {
            if (getCoords(piece.parentElement)[1] === 6) {
                return 'bottom_pawn_first'
            } else {
                return 'bottom_pawn'
            }
        } else {
            if (getCoords(piece.parentElement)[1] === 1) {
                return 'top_pawn_first'
            } else {
                return 'top_pawn'
            }
        }
    } else {
        return rawType;
    }
}

const getPossibleMoves = piece => {
    let attackMoves = [];
    const currentCoords = getCoords(piece.parentElement);
    const neutralMoves = moveDeltas[pieceType(piece)]
        .map(delta => arrayAdd(currentCoords, delta))
        .filter(currentCoords => coordsToSquareElem.hasOwnProperty(currentCoords))
        .sort((a, b) => distance(currentCoords, a) - distance(currentCoords, b))
        .filter(square => {
            if (getPiece(coordsToSquareElem[square])) {
                let addAttack = true;
                attackMoves.forEach(possibleAttack => {
                    if (threePointsMakeLine(square, possibleAttack, currentCoords)) {
                        addAttack = false;
                    }
                })
                addAttack ? attackMoves.push(square) : false;
                return false;
            }

            let validSquare = true
            attackMoves.forEach(pieceInPath => {
                if (threePointsMakeLine(square, pieceInPath, currentCoords)) {
                    validSquare = false;
                }
            })
            return validSquare
        });

    if (pieceType(piece).includes('bottom_pawn')) {
        attackMoves = [arrayAdd(currentCoords, [-1, -1]), arrayAdd(currentCoords, [1, -1])]
            .filter(currentCoords => coordsToSquareElem.hasOwnProperty(currentCoords));
    }

    if (pieceType(piece).includes('top_pawn')) {
        attackMoves = [arrayAdd(currentCoords, [-1, 1]), arrayAdd(currentCoords, [1, 1])]
            .filter(currentCoords => coordsToSquareElem.hasOwnProperty(currentCoords));
    }

    return {
        neutralMoves: neutralMoves,
        attackMoves: attackMoves.filter(possibleAttack => boardState[possibleAttack] && boardState[possibleAttack] !== getColor(piece))
    }
}

const initialSetup = () => {
    squares.forEach((square, squareIndex) => {
        const xCoord = squareIndex % 8;
        const yCoord = Math.floor(squareIndex / boardWidth);
        const coords = [xCoord, yCoord];
        square.classList.add((xCoord + yCoord) % 2 === 0 ? 'even-square' : 'odd-square')
        coordsToSquareElem[coords] = square;

        square.setAttribute('xcoord', xCoord);
        square.setAttribute('ycoord', yCoord);
    })

    updateBoardState()
}

const updateBoardState = () => {
    squares.forEach(square => {
        const coords = getCoords(square);
        const piece = getPiece(square);
        boardState[coords] = piece ? getColor(piece) : undefined;
    })
}

const elementContainsClass = (element, clss) => {
    if (element.classList.contains(clss)) {
        return element;
    } else if (element.parentElement.classList.contains(clss)) {
        return element.parentElement;
    } else {
        return false;
    }
}

window.addEventListener('click', e => {
    if (activePiece) {
        // Deactive piece before possibly moving it
        activePiece.classList.remove('active-piece');

        //let nextSquare;
        const nextSquare = elementContainsClass(e.target, 'possible-move') || elementContainsClass(e.target, 'possible-attack');
        if (nextSquare) {
            // Remove piece from current location
            coordsToSquareElem[activeCoords].innerHTML = '';

            // Replace new square's contents with piece
            nextSquare.innerHTML = activePiece.outerHTML;
            activeCoords = getCoords(nextSquare);

            const nextPiece = nextSquare.children[0];
            if (nextPiece.classList.contains('fa-chess-pawn') && [0, 7].includes(getCoords(nextSquare)[1])) {
                nextPiece.classList.remove('fa-chess-pawn');
                nextPiece.classList.add('fa-chess-queen');
            }

            updateBoardState()
        }

        // Clear active piece and remove possible move classes
        activePiece = null;
        squares.forEach(square => {
            square.classList.remove('possible-move');
            square.classList.remove('possible-attack');
        })
    } else if (e.target.classList.contains('piece')) {
        // Activate piece
        activePiece = e.target;
        activePiece.classList.add('active-piece');
        activeCoords = getCoords(activePiece.parentElement);

        // Highlight possible moves and attacks for piece
        moves = getPossibleMoves(activePiece);
        moves.neutralMoves.forEach(moveCoords => coordsToSquareElem[moveCoords].classList.add('possible-move'));
        moves.attackMoves.forEach(moveCoords => coordsToSquareElem[moveCoords].classList.add('possible-attack'));
    }
})

initialSetup()