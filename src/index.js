import { getValidMoves, pieceRawType } from './piece'
import Piece from './piece-obj'

const squares = document.querySelectorAll('.square');
const turnIndicator = document.querySelector('.turn-indicator');
const kingElems = {
    white: document.querySelector('.fa-chess-king.white'),
    black: document.querySelector('.fa-chess-king.black')
}
const board = document.querySelector('.board');

const playerColor = 'white';
const boardWidth = 8;
const boardState = {};
const coordsToSquareElem = {};
let activePiece;
let activeCoords;
let currentColor = 'white';
let takenPieces = {
    white: {},
    black: {}
}

const validCoords = coords => coordsToSquareElem.hasOwnProperty(coords);
const pieceOnCoords = coords => boardState[coords];

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


const updateTakePiecesElements = () => {
    for (const color in takenPiecesContainers) {
        const elem = takenPiecesContainers[color];
        elem.innerHTML = ''
        const pieces = takenPieces[color];
        for (const piece in pieces) {
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
        const xCoord = squareIndex % boardWidth;
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
        getValidMoves(piece).attackMoves.forEach(attackMove => {
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

const checkPawnPromotion = square => {
    const piece = getPiece(square);
    if (piece.classList.contains('fa-chess-pawn') && [0, 7].includes(getCoords(square)[1])) {
        piece.classList.remove('fa-chess-pawn');
        piece.classList.add('fa-chess-queen');
    }
}

const toggleActiveColor = () => {
    currentColor = currentColor === 'white' ? 'black' : 'white';
    turnIndicator.style.background = currentColor;
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
            const existingPiece = getPiece(nextSquare);
            if (existingPiece) {
                const color = getColor(existingPiece);
                const type = pieceRawType(existingPiece);
                takenPieces[color][type] = ++takenPieces[color][type] || 1;
                updateTakePiecesElements();
            }

            nextSquare.innerHTML = activePiece.outerHTML;
            activeCoords = getCoords(nextSquare);

            checkPawnPromotion(nextSquare);
            updateBoardState();
            toggleActiveColor();

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
        // const checkSquare = kingInCheck();
        // if (checkSquare) {
        //     checkSquare.classList.add('check');
        // }
    } else if (elementContainsClass(e.target, 'piece') &&
        elementContainsClass(e.target, currentColor)) {
        // Activate piece
        activePiece = e.target;
        activePiece.classList.add('active-piece');
        activeCoords = getCoords(activePiece.parentElement);

        // Highlight possible moves and attacks for piece
        const moves = getValidMoves(activePiece);
        moves.neutralMoves.forEach(moveCoords => coordsToSquareElem[moveCoords].classList.add('possible-move'));
        moves.attackMoves.forEach(moveCoords => coordsToSquareElem[moveCoords].classList.add('possible-attack'));
    }
})

initialSetup()

export { getCoords, getColor, boardState, playerColor, validCoords, pieceOnCoords }