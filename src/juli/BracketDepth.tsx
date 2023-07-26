export class BracketDepth {
    constructor() {
        this.curlyBracket = 0;
        this.parenthesis = 0;
        this.squareBracket = 0;
    }
    public curlyBracket: number;
    public parenthesis: number;
    public squareBracket: number;

    public fromBracketDepth(bracketDepth: BracketDepth): BracketDepth {
        this.parenthesis = bracketDepth.parenthesis;
        this.curlyBracket = bracketDepth.curlyBracket;
        this.squareBracket = bracketDepth.squareBracket;
        return this;
    }
}
