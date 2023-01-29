class GameMapInterface extends GameInterfaces {
    /**
     * @param {GameScope} scope
     */
    constructor(scope) {
        super({
            asOwnCanvas: true,
            zindex: ConfigConst.ZINDEX.MAP,
            canvasGroup: "GameMapGroup",
            activated: true,
            requiredImage: ["bb", "bp", "bk", "bq", "br", "bn", "wb", "wp", "wk", "wq", "wr", "wn"]
        }, scope);

        /**@type {number} */
        this.caseDimension = 0;
        /**@type {number} */
        this.offsetStart = 0;
        /**@type {number} */
        this.offsetX = 0;
        /**@type {number} */
        this.offsetY = 0;

        /**
         * If true, reset the game to its original state.
         * @type {boolean}
         */
        this.resetGame = true;

        /**@type {(Pawn|Rook|Knight|Bishop|Queen|King)[]} */
        this.pieces = [];
        /**@type {PiecesColor} */
        this.turn = 'w';
        /**@type {GamePiece} */
        this.clickedPiece = null;
        /**@type {number[]} */
        this.allowedMoves = null;

        /**@type {boolean} */
        this.helpPannel = false;

        /**@type {number} */
        this.delay = 0;
    }

    /**
     * @param {GameScope} scope
     */
    render(scope) {
        /**@type {CanvasRenderingContext2D} */
        const ctx = scope.cache.context[this.canvasGroup];
        const Width = scope.w | 0;
        const Height = scope.h | 0;

        ctx.clearRect(0, 0, Width, Height);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 2em Sans";

        // draw board
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (x % 2 === y % 2) {
                    ctx.fillStyle = "white";
                } else {
                    ctx.fillStyle = "black";
                }
                ctx.fillRect(this.offsetX + x * this.caseDimension, this.offsetY + y * this.caseDimension, this.caseDimension, this.caseDimension);
            }
        }

        // draw preview
        const pam = (this.clickedPiece ? this.getPieceAllowedMoves(this.clickedPiece.name) : []);
        pam.forEach(pos => {
            const x = pos % 10 - 1;
            const y = Math.floor(pos / 10) - 1;
            // check if the position is taken by an ennemy, if yes, draw an red square
            if (this.getPieceByPos(pos)) {
                ctx.fillStyle = "red";
                ctx.globalAlpha = 0.5;
                ctx.fillRect(this.offsetX + x * this.caseDimension, this.offsetY + y * this.caseDimension, this.caseDimension, this.caseDimension);
                ctx.globalAlpha = 1;
            } else {
                ctx.fillStyle = "gray";
                ctx.beginPath();
                ctx.arc(this.offsetX + (x + 0.5) * this.caseDimension, this.offsetY + (y + 0.5) * this.caseDimension, this.caseDimension / 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            }
        });

        // draw pieces on the board
        this.pieces.forEach(piece => {
            const x = piece.position % 10 - 1;
            const y = Math.floor(piece.position / 10) - 1;

            // draw red background if king is checked
            if (piece.rank === "k" && piece.isChecked === true) {
                ctx.fillStyle = "red";
                ctx.fillRect(this.offsetX + x * this.caseDimension, this.offsetY + y * this.caseDimension, this.caseDimension, this.caseDimension);
            }

            // draw background if piece is clicked
            if (this.clickedPiece && piece.position === this.clickedPiece.position) {
                ctx.fillStyle = "#f5e08b";
                ctx.globalAlpha = 0.5;
                ctx.fillRect(this.offsetX + x * this.caseDimension, this.offsetY + y * this.caseDimension, this.caseDimension, this.caseDimension);
                ctx.globalAlpha = 1;
            }

            // draw piece
            if (!piece.img) {
                ctx.fillStyle = (this.turn === "b" ? "#2f2f2f" : "#c6c0a7");
                ctx.fillText(piece.rank.toUpperCase(), this.offsetX + (x + 0.5) * this.caseDimension, this.offsetY + (y + 0.5) * this.caseDimension);
            } else {
                ctx.drawImage(piece.img, this.offsetX + x * this.caseDimension, this.offsetY + y * this.caseDimension, this.caseDimension, this.caseDimension);
            }
        });

        if (this.helpPannel) {
            ctx.fillStyle = "white";
            ctx.globalAlpha = 0.5;
            ctx.fillRect(this.offsetX, this.offsetY, this.caseDimension * 8, this.caseDimension * 8);
            ctx.globalAlpha = 1;
        }

        this.needsUpdate = false;
    }

    /**
     * @param {GameScope} scope
     */
    update(scope) {
        const Width = scope.w | 0;
        const Height = scope.h | 0;

        if (this.resized) {
            this.caseDimension = Math.min(Width, Height) / 8;

            /**Get the min dimension, and get the space left in the other dimension. */
            this.offsetStart = (Math.max(Width, Height) - Math.min(Width, Height)) / 2;
            this.offsetX = (Math.min(Width, Height) != Width) ? this.offsetStart : 0;
            this.offsetY = (Math.min(Width, Height) != Height) ? this.offsetStart : 0;

            this.resized = false;
        }

        if (this.resetGame) {
            //TODO reverse the board
            this.pieces = [
                new Rook(81, 'wr1'),
                new Knight(82, 'wn1'),
                new Bishop(83, 'wb1'),
                new Queen(84, 'wq'),
                new King(85, 'wk'),
                new Bishop(86, 'wb2'),
                new Knight(87, 'wn2'),
                new Rook(88, 'wr2'),

                new Pawn(71, 'wp1'),
                new Pawn(72, 'wp2'),
                new Pawn(73, 'wp3'),
                new Pawn(74, 'wp4'),
                new Pawn(75, 'wp5'),
                new Pawn(76, 'wp6'),
                new Pawn(77, 'wp7'),
                new Pawn(78, 'wp8'),

                new Pawn(21, 'bp1'),
                new Pawn(22, 'bp2'),
                new Pawn(23, 'bp3'),
                new Pawn(24, 'bp4'),
                new Pawn(25, 'bp5'),
                new Pawn(26, 'bp6'),
                new Pawn(27, 'bp7'),
                new Pawn(28, 'bp8'),

                new Rook(11, 'br1'),
                new Knight(12, 'bn1'),
                new Bishop(13, 'bb1'),
                new Queen(14, 'bq'),
                new King(15, 'bk'),
                new Bishop(16, 'bb2'),
                new Knight(17, 'bn2'),
                new Rook(18, 'br2')
            ];
            this.resetGame = false;
            this.turn = 'w';
        }

        // help message
        if (KeyboardTrackerManager.pressed(['h']) === true && this.delay + 200 < Date.now()) {
            this.helpPannel = !this.helpPannel;
            this.delay = Date.now();
            this.needsUpdate = true;
        }

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                // only accept pieces of the current player
                if (MouseTrackerManager.clickOver(this.offsetX + x * this.caseDimension, this.offsetY + y * this.caseDimension, this.caseDimension, this.caseDimension, 100)) {
                    // + 11 because x and y start from 0, and you need (y+1)*10 + x + 1, so 11
                    const piece = this.getPieceByPos(y * 10 + x + 11);
                    if (this.allowedMoves && this.allowedMoves.includes(y * 10 + x + 11)) {
                        //TODO update
                        this.movePiece(y * 10 + x + 11);
                        this.needsUpdate = true;
                    } else if (!piece) {
                        this.setClickedPiece();
                        this.clearSquares();
                        this.needsUpdate = true;
                    } else if (y * 10 + x + 11 != this.clickedPiece && piece.color === this.turn) {
                        this.setClickedPiece(piece);
                        this.needsUpdate = true;
                    }
                }
            }
        }
    }

    // big thanks to the author of https://github.com/AhmadAlkholy/Javascript-Chess-Game where I got the base functions from
    //TODO check for draw

    /**
     * @param {DragEvent | MouseEvent} event 
     */
    pieceMove(event) {
        const name = event.target.getAttribute('id');
        const allowedMoves = this.getPieceAllowedMoves(name);
        if (allowedMoves) {
            const position = this.getPieceByName(name).position;
            const clickedSquare = document.getElementById(position);

            /*if (event.type == 'click' && this.clickedPiece && this.clickedPiece.name == name) {
                this.setClickedPiece(null);
                return this.clearSquares();
            }*/
            clickedSquare.classList.add('clicked-square');

            allowedMoves.forEach(allowedMove => {
                if (document.body.contains(document.getElementById(allowedMove))) {
                    document.getElementById(allowedMove).classList.add('allowed');
                }
            });
        }
        else {
            this.clearSquares();
        }
    }

    changeTurn() {
        if (this.turn === 'w') {
            this.turn = 'b';
        } else {
            this.turn = 'w';
        }
    }

    /**
     * @param {PiecesColor} color 
     * @returns {(Pawn | Rook | Knight | Bishop | Queen | King)[]}
     */
    getPiecesByColor(color) {
        return this.pieces.filter(obj => {
            return obj.color === color;
        });
    }

    /**
     * @param {PiecesColor} color 
     * @returns {number[]}
     */
    getPlayerPositions(color) {
        const pieces = this.getPiecesByColor(color);
        return pieces.map(a => parseInt(a.position));
    }

    /**
     * @param {number[]} positions 
     * @returns {number[]}
     */
    filterPositions(positions) {
        return positions.filter(pos => {
            const x = pos % 10;
            const y = Math.floor(pos / 10);
            return x >= 1 && x <= 8 && y >= 1 && y <= 8;
        });
    }

    /**
     * @param {number[][]} allowedPositions 
     * @param {number} position 
     * @param {PiecesColor} color 
     * @param {boolean} [checking] 
     * @returns {number[]}
     */
    unblockedPositions(allowedPositions, position, color, checking = true) {
        if (!allowedPositions || !Array.isArray(allowedPositions)) { allowedPositions = []; }
        position = parseInt(position);
        const unblockedPositions = [];

        var myBlockedPositions, otherBlockedPositions;

        if (color == 'w') {
            myBlockedPositions = this.getPlayerPositions('w');
            otherBlockedPositions = this.getPlayerPositions('b');
        } else {
            myBlockedPositions = this.getPlayerPositions('b');
            otherBlockedPositions = this.getPlayerPositions('w');
        }

        if (this.clickedPiece.hasRank('p')) {
            //TODO en passant
            for (const move of allowedPositions[0]) { //attacking moves
                if (checking && this.myKingChecked(move)) continue;
                if (otherBlockedPositions.indexOf(move) != -1) unblockedPositions.push(move);
            }
            const blockedPositions = myBlockedPositions.concat(otherBlockedPositions);
            for (const move of allowedPositions[1]) { //moving moves
                if (blockedPositions.indexOf(move) != -1) break;
                else if (checking && this.myKingChecked(move, false)) continue;
                unblockedPositions.push(move);
            }
        } else {
            allowedPositions.forEach(allowedPositionsGroup => {
                for (const move of allowedPositionsGroup) {
                    if (myBlockedPositions.indexOf(move) != -1) {
                        break;
                    } else if (checking && this.myKingChecked(move)) {
                        continue;
                    }
                    unblockedPositions.push(move);
                    if (otherBlockedPositions.indexOf(move) != -1) break;
                }
            });
        }

        return this.filterPositions(unblockedPositions);
    }

    /**
     * @param {PiecesName} pieceName 
     * @returns {number[]}
     */
    getPieceAllowedMoves(pieceName) {
        const piece = this.getPieceByName(pieceName);
        if (!piece) {
            console.warn(`Unknown piece ${pieceName}`);
            return [];
        }
        if (this.turn == piece.color) {
            this.clearSquares();
            this.setClickedPiece(piece);

            let pieceAllowedMoves = piece.getAllowedMoves();
            if (piece.rank == 'k') {
                pieceAllowedMoves = this.getCastlingSquares(pieceAllowedMoves);
            }
            const allowedMoves = this.unblockedPositions(pieceAllowedMoves, piece.position, piece.color, true);
            this.allowedMoves = allowedMoves;
            this.setClickedPiece(piece);
            return allowedMoves;
        } else {
            // not the correct turn
            return [];
        }
    }

    /**
     * @param {number[]} allowedMoves 
     * @returns {number[]}
     */
    getCastlingSquares(allowedMoves) {
        if (!this.clickedPiece.ableToCastle || this.king_checked(this.turn)) return allowedMoves;
        const rook1 = this.getPieceByName(this.turn + 'r1');
        const rook2 = this.getPieceByName(this.turn + 'r2');
        if (rook1 && rook1.ableToCastle) {
            const castlingPosition = rook1.position + 2;
            if (
                !this.positionHasExistingPiece(castlingPosition - 1) &&
                !this.positionHasExistingPiece(castlingPosition) && !this.myKingChecked(castlingPosition, true) &&
                !this.positionHasExistingPiece(castlingPosition + 1) && !this.myKingChecked(castlingPosition + 1, true)
            )
                allowedMoves[1].push(castlingPosition);
        }
        if (rook2 && rook2.ableToCastle) {
            const castlingPosition = rook2.position - 1;
            if (
                !this.positionHasExistingPiece(castlingPosition - 1) && !this.myKingChecked(castlingPosition - 1, true) &&
                !this.positionHasExistingPiece(castlingPosition) && !this.myKingChecked(castlingPosition, true)
            )
                allowedMoves[0].push(castlingPosition);
        }
        return allowedMoves;
    }

    /**
     * @param {PiecesName} piecename 
     * @returns {Pawn|Rook|Knight|Bishop|Queen|King}
     */
    getPieceByName(piecename) {
        return this.pieces.filter(obj => obj.name === piecename)[0];
    }

    /**
     * @param {number} piecePosition 
     * @returns {Pawn|Rook|Knight|Bishop|Queen|King}
     */
    getPieceByPos(piecePosition) {
        return this.pieces.filter(obj => obj.position === piecePosition)[0];
    }

    /**
     * @param {number} position 
     * @returns {boolean}
     */
    positionHasExistingPiece(position) {
        return this.getPieceByPos(position) != undefined;
    }

    /**
     * @param {Pawn|Rook|Knight|Bishop|Queen|King|undefined} piece 
     */
    setClickedPiece(piece = null) {
        this.clickedPiece = piece;
    }

    /**
     * @param {number} pos
     * @returns {boolean}
     */
    movePiece(pos) {
        // check if pos exists
        if (this.filterPositions([pos]).length === 0) return 0;
        // check if pos is not occupied by ally pieces
        const clickedPiece = this.clickedPiece;
        if (this.getPieceAllowedMoves(clickedPiece.name).includes(pos)) {
            if (clickedPiece) {
                const newPosition = pos;
                if (this.getPieceByPos(pos)) {
                    this.kill(this.getPieceByPos(pos));
                }

                if (clickedPiece.hasRank('k') || clickedPiece.hasRank('pawn'))
                    clickedPiece.changePosition(newPosition, true, this);
                else
                    clickedPiece.changePosition(newPosition);
                // remove check
                this.getPieceByName((this.turn == 'w' ? 'w' : 'b') + 'k').isChecked = false;
                this.clearSquares();
                this.changeTurn();
                if (this.king_checked(this.turn)) {
                    if (this.king_dead(this.turn)) {
                        this.checkmate(clickedPiece.color);
                    } else {
                        this.getPieceByName((this.turn == 'w' ? 'w' : 'b') + 'k').isChecked = true;
                    }
                }
                return 1;
            }
        }
        return 0;
    }

    /**
     * @param {Pawn|Rook|Knight|Bishop|Queen|King} piece 
     */
    kill(piece) {
        this.pieces.splice(this.pieces.indexOf(piece), 1);
    }

    /**
     * @param {"br1"|"br2"|"wr1"|"wr2"} rookName 
     */
    castleRook(rookName) {
        const rook = this.getPieceByName(rookName);
        const newPosition = rookName.indexOf('r2') != -1 ? rook.position - 2 : rook.position + 3;
        this.setClickedPiece(rook);
        this.movePiece(newPosition);
        this.changeTurn();
    }

    /**
     * @param {Pawn} pawn 
     */
    promote(pawn) {
        //TODO ask the user what piece he want (prompt?)
        const queenName = pawn.name.replace('p', 'q');
        const image = pawn.img;
        image.id = queenName;
        image.src = image.src.replace('p', 'q');
        this.pieces.splice(this.pieces.indexOf(pawn), 1);
        this.pieces.push(new Queen(pawn.position, queenName));
    }

    /**
     * @param {number} pos 
     * @param {boolean} [kill] 
     * @returns {boolean}
     */
    myKingChecked(pos, kill = true) {
        const piece = this.clickedPiece;
        const originalPosition = piece.position;
        const otherPiece = this.getPieceByPos(pos);
        const should_kill_other_piece = kill && otherPiece && otherPiece.rank != 'k';
        piece.changePosition(pos);
        if (should_kill_other_piece) this.pieces.splice(this.pieces.indexOf(otherPiece), 1);
        if (this.king_checked(piece.color)) {
            piece.changePosition(originalPosition);
            if (should_kill_other_piece) this.pieces.push(otherPiece);
            return 1;
        } else {
            piece.changePosition(originalPosition);
            if (should_kill_other_piece) this.pieces.push(otherPiece);
            return 0;
        }
    }

    /**
     * @param {PiecesColor} color 
     * @returns {boolean}
     */
    king_dead(color) {
        const pieces = this.getPiecesByColor(color);
        for (const piece of pieces) {
            this.setClickedPiece(piece);
            const allowedMoves = this.unblockedPositions(piece.getAllowedMoves(), piece.position, piece.color, true);
            if (allowedMoves.length) {
                this.setClickedPiece(null);
                return 0;
            }
        }
        this.setClickedPiece();
        return 1;
    }

    /**
     * @param {PiecesColor} color 
     * @returns {boolean} true if the opposite king is checked
     */
    king_checked(color) {
        const piece = this.clickedPiece;
        const king = this.getPieceByName(color + 'k');
        const enemyColor = (color == 'w') ? 'b' : 'w';
        const enemyPieces = this.getPiecesByColor(enemyColor);
        for (const enemyPiece of enemyPieces) {
            this.setClickedPiece(enemyPiece);
            const allowedMoves = this.unblockedPositions(enemyPiece.getAllowedMoves(), enemyPiece.position, enemyColor, false);
            if (allowedMoves.indexOf(king.position) != -1) {
                this.setClickedPiece(piece);
                return 1;
            }
        }
        this.setClickedPiece(piece);
        return 0;
    }

    clearSquares() {
        this.allowedMoves = [];
    }

    /**
     * @param {PiecesColor} color 
     */
    checkmate(color) {
        // TODO 
        const endScene = document.getElementById('endscene');
        endScene.getElementsByClassName('winning-sign')[0].innerHTML = color + ' Wins';
        endScene.classList.add('show');
    }
}