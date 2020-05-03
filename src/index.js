const squares = document.querySelectorAll('.square');
const turnIndicator = document.querySelector('.turn-indicator');
const kingElems = {
    white: document.querySelector('.fa-chess-king.white'),
    black: document.querySelector('.fa-chess-king.black')
}
const board = document.querySelector('.board');

const boardWidth = 8;
const playerColor = 'white';
const boardState = {};
const coordsToSquareElem = {};
let activePiece;
let activeCoords;
let currentColor = 'white';
let takenPieces = {
    white: {},
    black: {}
}

const unpackTakenPiecesContainers = nodeList => {
    const containers = {};
    nodeList.forEach(elem => {
        elem.classList.forEach(clss => {
            if (['white', 'black'].includes(clss)) {
                containers[clss] = elem;
            }
        })
    })
    return containers;
}

const takenPiecesContainers = unpackTakenPiecesContainers(document.querySelectorAll('.taken-pieces-container'));

const getCoords = squareElem => [parseInt(squareElem.getAttribute('xcoord')), parseInt(squareElem.getAttribute('ycoord'))];
const getColor = piece => piece.classList.contains('white') ? 'white' : 'black';
const getPiece = square => square.children[0];
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
const pawnAttacks = { bottom_pawn: [[-1, -1], [1, -1]], top_pawn: [[-1, 1], [1, 1]], bottom_pawn_first: [[-1, -1], [1, -1]], top_pawn_first: [[-1, 1], [1, 1]] }

const pieceRawType = piece => {
    const classArray = [...piece.classList];
    const pieceTypeClass = classArray.filter(cl => cl.includes('fa-chess'))[0];
    return pieceTypeClass.split('-')[2];
}

const pieceType = piece => {
    const rawType = pieceRawType(piece);
    const classArray = [...piece.classList];
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

    if (pieceType(piece).includes('pawn')) {
        attackMoves = pawnAttacks[pieceType(piece)].map(delta => arrayAdd(currentCoords, delta))
            .filter(currentCoords => coordsToSquareElem.hasOwnProperty(currentCoords));
    }

    return {
        neutralMoves: neutralMoves,
        attackMoves: attackMoves.filter(possibleAttack => boardState[possibleAttack] && boardState[possibleAttack] !== getColor(piece))
    }
}

const updateTakePiecesElements = () => {
    for (const color in takenPiecesContainers) {
        const elem = takenPiecesContainers[color];
        elem.innerHTML = ''
        const pieces = takenPieces[color];
        for (piece in pieces) {
            const takenPiecesHTML = `
            <div class="taken-piece ${color}">
                <i class="fas fa-chess-${piece} piece ${color}"></i>
                <div>
                    <i class="fas fa-times fa-sm"></i>
                    <span>${pieces[piece]}</span>
                </div>
            </div>
            `
            elem.innerHTML += takenPiecesHTML;
        }
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

const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

const kingInCheck = () => {
    const kingCoords = getCoords(kingElems[currentColor].parentElement);
    const otherColor = currentColor === 'white' ? 'black' : 'white';
    let checkSquare = false;

    board.querySelectorAll(`.piece.${otherColor}`).forEach(piece => {
        getPossibleMoves(piece).attackMoves.forEach(attackMove => {
            if (arraysEqual(attackMove, kingCoords)) {
                checkSquare = kingElems[currentColor].parentElement;
                return;
            }
        })
    })

    return checkSquare;
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
    const squareInCheck = document.querySelector('.check');

    if (activePiece) {
        // Deactive piece before possibly moving it
        activePiece.classList.remove('active-piece');

        const nextSquare = elementContainsClass(e.target, 'possible-move') || elementContainsClass(e.target, 'possible-attack');
        if (nextSquare) {
            // Remove piece from current location
            coordsToSquareElem[activeCoords].innerHTML = '';

            // Replace new square's contents with piece
            const existingPiece = nextSquare.children[0];
            if (existingPiece) {
                const color = getColor(existingPiece);
                const type = pieceRawType(existingPiece);
                takenPieces[color][type] = ++takenPieces[color][type] || 1;
                updateTakePiecesElements();
            }

            nextSquare.innerHTML = activePiece.outerHTML;
            activeCoords = getCoords(nextSquare);

            const nextPiece = nextSquare.children[0];
            if (nextPiece.classList.contains('fa-chess-pawn') && [0, 7].includes(getCoords(nextSquare)[1])) {
                nextPiece.classList.remove('fa-chess-pawn');
                nextPiece.classList.add('fa-chess-queen');
            }

            updateBoardState()

            // Change current color
            currentColor = currentColor === 'white' ? 'black' : 'white';
            turnIndicator.style.background = currentColor;

            // Get rid of square with check color, if it exists
            const checkedSquare = document.querySelector('.check');
            if (checkedSquare) checkedSquare.classList.remove('check');
        }

        // Clear active piece and remove possible move classes
        activePiece = null;
        squares.forEach(square => {
            square.classList.remove('possible-move');
            square.classList.remove('possible-attack');
        })

        // Check if king is in check
        const checkSquare = kingInCheck();
        if (checkSquare) {
            checkSquare.classList.add('check');
        }
    } else if (elementContainsClass(e.target, 'piece') &&
        elementContainsClass(e.target, currentColor)) {
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