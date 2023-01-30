/// <reference path='../../ts/game.d.ts'/>

const PiecesColorEnum = ['b', 'w'];
const PiecesTypeEnum = ['p', 'r', 'n', 'b', 'q', 'k'];

class GamePiece {
    /**
     * @param {number} position YX position starting from 1 to 8
     * @param {string} name Name of the piece
     */
    constructor(position, name) {
        this.position = position;
        this.rank = name.substring(1, 2);
        if (PiecesTypeEnum.indexOf(this.rank) === -1) {
            throw new TypeError(`${this.rank} is not a type of PiecesType.`);
        }
        this.name = name;
        this.color = name.substring(0, 1);
        if (PiecesColorEnum.indexOf(this.color) === -1) {
            throw new TypeError(`${this.color} is not a type of PiecesColor.`);
        }
        this.img = window.game.cache.image[name.substring(0, 2)].image;
    }


    hasRank(rank) {
        return this.rank == rank;
    }

    changePosition(position) {
        this.position = parseInt(position);
    }

    getMovesTop() {
        const movesTop = [];
        for (let move = this.position + 10; move <= 88; move += 10) movesTop.push(move);
        return movesTop;
    }

    getMovesBottom() {
        const movesBottom = [];
        for (let move = this.position - 10; move >= 11; move -= 10) movesBottom.push(move);
        return movesBottom;
    }

    getMovesRight() {
        const num = this.position + '';
        const movesRight = [];
        for (let move = this.position + 1; move <= parseInt(num[0] + '8'); move++) movesRight.push(move);
        return movesRight;
    }

    getMovesLeft() {
        const num = this.position + '';
        const movesLeft = [];
        for (let move = this.position - 1; move >= parseInt(num[0] + '1'); move--) movesLeft.push(move);
        return movesLeft;
    }

    getMovesTopRight() {
        const movesTopRight = [];
        for (let move = this.position + 11; move <= 88; move += 11) {
            const firstDigit = ('' + move)[1];
            if (firstDigit > 8 || firstDigit < 1) break;
            movesTopRight.push(move);
        }
        return movesTopRight;
    }

    getMovesTopLeft() {
        const movesTopLeft = [];
        for (let move = this.position + 9; move <= 88; move += 9) {
            const firstDigit = ('' + move)[1];
            if (firstDigit > 8 || firstDigit < 1) break;
            movesTopLeft.push(move);
        }
        return movesTopLeft;
    }

    getMovesBottomRight() {
        const movesBottomRight = [];
        for (let move = this.position - 9; move >= 11; move -= 9) {
            const firstDigit = ('' + move)[1];
            if (firstDigit > 8 || firstDigit < 1) break;
            movesBottomRight.push(move);
        }
        return movesBottomRight;
    }

    getMovesBottomLeft() {
        const movesBottomLeft = [];
        for (let move = this.position - 11; move >= 11; move -= 11) {
            const firstDigit = ('' + move)[1];
            if (firstDigit > 8 || firstDigit < 1) break;
            movesBottomLeft.push(move);
        }
        return movesBottomLeft;
    }
}

// pieces class

class Bishop extends GamePiece {
    constructor(position, name) {
        super(position, name);
    }

    getAllowedMoves() {
        return [this.getMovesTopRight(), this.getMovesTopLeft(), this.getMovesBottomRight(), this.getMovesBottomLeft()];
    }
}

class King extends GamePiece {
    constructor(position, name) {
        super(position, name);
        this.ableToCastle = true;
        this.isChecked = false;
    }

    getAllowedMoves() {
        const position = this.position;
        const allowedMoves = [
            [parseInt(position) + 1],
            [parseInt(position) - 1],
            [parseInt(position) + 10],
            [parseInt(position) - 10],
            [parseInt(position) + 11],
            [parseInt(position) - 11],
            [parseInt(position) + 9],
            [parseInt(position) - 9]
        ];
        return allowedMoves;
    }

    remove_castling_ability() {
        this.ableToCastle = false;
    }

    changePosition(position, castle = false, game = null) {
        if (castle) {
            if (position - this.position == 2) game.castleRook(this.color + 'r2');
            if (position - this.position == -2) game.castleRook(this.color + 'r1');
            this.ableToCastle = false;
        }
        this.position = parseInt(position);
    }
}

class Knight extends GamePiece {
    constructor(position, name) {
        super(position, name);
    }

    getAllowedMoves() {
        const position = this.position;
        return [
            [parseInt(position) + 21],
            [parseInt(position) - 21],
            [parseInt(position) + 19],
            [parseInt(position) - 19],
            [parseInt(position) + 12],
            [parseInt(position) - 12],
            [parseInt(position) + 8],
            [parseInt(position) - 8]
        ];
    }
}

class Pawn extends GamePiece {
    constructor(position, name) {
        super(position, name);
        this.enPassantReady = false;
    }

    getAllowedMoves() {
        const position = this.position;
        const mathSign = (this.color === 'w') ? -1 : 1;

        // normal move
        const allowedMoves = [position + mathSign * 10];

        // move two case at the start
        if ((position > 20 && position < 29) || (position > 70 && position < 79)) {
            allowedMoves.push(position + mathSign * 20);
        }

        // attacks
        const attackMoves = [position + mathSign * 9, position + mathSign * 11];

        return [attackMoves, allowedMoves];
    }

    changePosition(position, promote = false) {
        this.position = parseInt(position);
        if (promote && (position > 80 || position < 20)) game.promote(this);
    }
}

class Queen extends GamePiece {
    constructor(position, name) {
        super(position, name);
    }

    getAllowedMoves() {
        return [
            this.getMovesTop(),
            this.getMovesTopRight(),
            this.getMovesTopLeft(),
            this.getMovesBottom(),
            this.getMovesBottomRight(),
            this.getMovesBottomLeft(),
            this.getMovesRight(),
            this.getMovesLeft()
        ];
    }
}

class Rook extends GamePiece {
    constructor(position, name) {
        super(position, name);
        this.ableToCastle = true;
    }

    changePosition(position) {
        this.position = parseInt(position);
        this.ableToCastle = false;
    }

    getAllowedMoves() {
        return [this.getMovesTop(), this.getMovesBottom(), this.getMovesRight(), this.getMovesLeft()];
    }
}