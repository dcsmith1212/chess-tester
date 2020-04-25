const squares = document.querySelectorAll('.square');
const knight = document.querySelector('.fa-chess-knight');
const rook = document.querySelector('.fa-chess-rook');

const boardWidth = 8;

let activePiece;
let activeCoords;

const coordsToSquareElem = {};
const getCoords = squareElem => [parseInt(squareElem.getAttribute('xcoord')), parseInt(squareElem.getAttribute('ycoord'))];

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
    ]
}

const pieceType = piece => {
    const classArray = [...piece.classList];
    const pieceTypeClass = classArray.filter(cl => cl.includes('fa-chess'))[0];
    const split = pieceTypeClass.split('-');
    return split[split.length - 1];
}

const getPossibleMoves = piece => {
    const coords = getCoords(piece.parentElement);
    return moveDeltas[pieceType(piece)].map(delta => {
        return arrayAdd(coords, delta);
    }).filter(possibleMove => coordsToSquareElem.hasOwnProperty(possibleMove));
}

squares.forEach((square, squareIndex) => {
    const xCoord = squareIndex % 8;
    const yCoord = Math.floor(squareIndex / boardWidth);

    square.classList.add((xCoord + yCoord) % 2 === 0 ? 'even-square' : 'odd-square')
    coordsToSquareElem[[xCoord, yCoord]] = square;

    square.setAttribute('xcoord', xCoord);
    square.setAttribute('ycoord', yCoord);
})

window.addEventListener('click', e => {
    if (activePiece) {
        // Deactive piece before possibly moving it
        activePiece.classList.remove('active-piece');

        if (e.target.classList.contains('possible-move')) {
            // Remove piece from current location
            coordsToSquareElem[activeCoords].innerHTML = '';

            // Add piece to new location
            const nextSquare = e.target;
            nextSquare.innerHTML = activePiece.outerHTML;
            activeCoords = getCoords(nextSquare);
        }

        activePiece = null;
        document.querySelectorAll('.possible-move').forEach(square => {
            square.classList.remove('possible-move');
        })
    } else if (e.target.classList.contains('piece')) {
        const piece = e.target;

        // Activate piece
        activePiece = piece;
        piece.classList.add('active-piece');
        activeCoords = getCoords(piece.parentElement);

        // Highlight possible moves for piece
        getPossibleMoves(piece).forEach(moveCoords => {
            coordsToSquareElem[moveCoords].classList.add('possible-move')
        })
    }
})