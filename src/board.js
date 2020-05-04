class Board {
    constructor(playerColor) {
        this.width = 8
        this.state = {}
        this.activePiece;
        this.playerColor = playerColor
        this.currentColor = 'white'
        this.takenPieces = {
            white: {},
            black: {}
        }
    }
    validCoords(coords) {
        return (0 <= coords[0] && coords[0] <= this.width - 1 &&
            0 <= coords[1] && coords[1] <= this.width - 1);
    }
    pieceOnCoords(coords) {
        return this.state[coords];
    }
    getCoords(square) {
        return [parseInt(square.getAttribute('xcoord')), parseInt(square.getAttribute('ycoord'))];
    }
    getPiece(square) {
        return this.pieceOnCoords(this.getCoords(square));
    }
}