import Piece from './piece'
import Board from './board'

const squares = document.querySelectorAll('.square');
const turnIndicator = document.querySelector('.turn-indicator');
const takenPiecesContainers = {
    white: document.querySelector('.taken-pieces-container.white'),
    black: document.querySelector('.taken-pieces-container.black')
}

let board;

const updateTakenPiecesElements = () => {
    for (const color in takenPiecesContainers) {
        const elem = takenPiecesContainers[color];
        elem.innerHTML = ''
        const takenPieces = board.takenPieces[color];
        for (const piece in takenPieces) {
            const takenPiecesHTML = `
            <div class="taken-piece ${color}">
                <i class="fas fa-chess-${piece} piece ${color}"></i>
                <div>
                    <i class="fas fa-times fa-sm"></i>
                    <span>${takenPieces[piece]}</span>
                </div>
            </div>
            `
            elem.innerHTML += takenPiecesHTML;
        }
    }
}

const initialSetup = () => {
    board = new Board('white')

    squares.forEach((square, index) => {
        const xCoord = index % board.width;
        const yCoord = Math.floor(index / board.width);
        const coords = [xCoord, yCoord];
        square.classList.add((xCoord + yCoord) % 2 === 0 ? 'even-square' : 'odd-square')
        square.id = index;
        square.setAttribute('xcoord', xCoord);
        square.setAttribute('ycoord', yCoord);

        let piece;
        const pieceElem = square.children[0];
        if (pieceElem) {
            pieceElem.id = index;
            piece = new Piece(pieceElem);
        }

        board.associateCoordsAndElems(coords, square, piece);
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
    if (board.activePiece) {
        // Deactive piece before possibly moving it
        board.activePiece.element.classList.remove('active-piece');

        const nextSquare = elementContainsClass(e.target, 'possible-move') || elementContainsClass(e.target, 'possible-attack');
        if (nextSquare) {
            // Remove piece from current location
            board.activePiece.squareElem.innerHTML = '';

            // Replace new square's contents with piece
            const existingPiece = board.getPiece(nextSquare);
            if (existingPiece) {
                board.takePiece(existingPiece);
                updateTakenPiecesElements();
            }

            board.moveActivePiece(nextSquare);
            nextSquare.innerHTML = board.activePiece.element.outerHTML;
            turnIndicator.style.background = board.currentColor;
        }

        // Clear active piece and remove possible move classes
        board.activePiece = null;
        squares.forEach(square => {
            square.classList.remove('possible-move');
            square.classList.remove('possible-attack');
        })

    } else if (elementContainsClass(e.target, 'piece') &&
        elementContainsClass(e.target, board.currentColor)) {
        // Activate piece and get its valid moves
        const moves = board.activatePiece(e.target);
        moves.neutralMoves.forEach(coords => board.getSquare(coords).classList.add('possible-move'));
        moves.attackMoves.forEach(coords => board.getSquare(coords).classList.add('possible-attack'));
    }
})

initialSetup()

export { board }