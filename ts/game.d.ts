export { }

import "./core.d.ts"
import "./data.d.ts"
import "./declaration"
import "./type.d.ts"

declare global {
    const PiecesColorEnum = ["b", "w"];
    const PiecesTypeEnum = ["p", "r", "n", "b", "q", "k"];

    type PiecesColor = "w" | "b";
    type PiecesType = "p" | "r" | "n" | "b";
    type PiecesName = `${PiecesColor}${PiecesType}${1 | 2}` | "wq" | "wk" | "bq" | "bk"

    class GamePiece {
        /**
         * @param {number} position YX position starting from 1 to 8
         * @param {string} name Name of the piece
         */
        constructor(position: number, name: string): GamePiece;
        position: number;
        rank: PiecesType | "q" | "k";
        name: PiecesName;
        color: PiecesColor;
        img: HTMLImageElement;


        hasRank(rank: PiecesType | "q" | "k"): boolean;

        changePosition(position: number): void;
        getMovesTop(): number[]
        getMovesBottom(): number[]
        getMovesRight(): number[]
        getMovesLeft(): number[]
        getMovesTopRight(): number[]
        getMovesTopLeft(): number[]
        getMovesBottomRight(): number[]
        getMovesBottomLeft(): number[]
    }

    class Bishop extends GamePiece {
        constructor(position: number, name: string): Bishop;
        getAllowedMoves(): number[];
    }

    class King extends GamePiece {
        constructor(position: number, name: string): King;
        ableToCastle: boolean;
        isChecked: boolean;
        getAllowedMoves(): number[];
        remove_castling_ability(): void;
        changePosition(position: number, castle?: boolean): void;
    }

    class Knight extends GamePiece {
        constructor(position: number, name: string): Knight;
        getAllowedMoves(): number[];
    }

    class Pawn extends GamePiece {
        constructor(position: number, name: string): Pawn;
        /**True if the pawn has made his first move of 2 case. */
        enPassantReady: boolean;
        getAllowedMoves(): number[];
        changePosition(position: number, promote = false): void;
    }

    class Queen extends GamePiece {
        constructor(position: number, name: string): Queen;
        getAllowedMoves(): number[];
    }

    class Rook extends GamePiece {
        constructor(position: number, name: string): Rook;
        ableToCastle: boolean;
        changePosition(position: number): void;
        getAllowedMoves(): number[];
    }

    class GameMapInterface extends GameInterfaces {
        constructor(scope: GameScope): GameMapInterface;

        caseDimension: number;
        offsetStart: number;
        offsetX: number;
        offsetY: number;
        resetGame: boolean;
        pieces: (Pawn | Rook | Knight | Bishop | Queen | King)[];
        turn: PiecesColor;
        clickedPiece: Pawn | Rook | Knight | Bishop | Queen | King;
        allowedMoves: number[];

        render(scope: GameScope): void;
        update(scope: GameScope): GameScope;

        filterPositions(positions: number[]): number[];
        unblockedPositions(allowedPositions: number[], position: number, color: PiecesColor, checking?: boolean): number[];

        getCastlingSquares(allowedMoves: number[]): number[];
        getPieceAllowedMoves(pieceName: PiecesName): number[];
        getPieceByName(piecename: PiecesName): Pawn | Rook | Knight | Bishop | Queen | King | void;
        getPieceByPos(piecePosition: number): Pawn | Rook | Knight | Bishop | Queen | King | void;
        getPiecesByColor(color: PiecesColor): (Pawn | Rook | Knight | Bishop | Queen | King)[];
        getPlayerPositions(color: PiecesColor): number[];

        castleRook(rookName: PiecesName): void;
        checkmate(color: PiecesColor): void;
        kill(piece: Pawn | Rook | Knight | Bishop | Queen | King): void;
        king_dead(color: PiecesColor): boolean;
        king_checked(color: PiecesColor): boolean
        movePiece(event: DragEvent | MouseEvent, square?: string): boolean;
        myKingChecked(pos: number, kill?: boolean): boolean;
        positionHasExistingPiece(position: number): boolean;
        promote(pawn: Pawn): void;
        setClickedPiece(piece: Pawn | Rook | Knight | Bishop | Queen | King): void;

        changeTurn(): void;
        clearSquares(): void;
    }
}