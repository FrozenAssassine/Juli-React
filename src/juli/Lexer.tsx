// lexer.ts
enum SyntaxKind {
    If_KW,
    For_KW,
    In_KW,
    Else_KW,
    True_KW,
    False_KW,
    Range_KW,
    Len_KW,
    String_ID,
    Number_ID,
    Bool_ID,
    Identifier_ID,
    Variable_ID,
    LeftParen_ID,
    RightParen_ID,
    Semicolon_ID,
    Equals_ID,
    FunctionCall_ID,
    Function_ID,
    Add_ID,
    Subtract_ID,
    Multiply_ID,
    Divide_ID,
    Modulo_ID,
    LeftCurly_ID,
    RightCurly_ID,
    Comma_ID,
    Greater_ID,
    Smaller_ID,
    Not_ID,
    LeftSqrBracket_ID,
    RightSqrBracket_ID,
    Null_ID,
    Compare_ID,
    And_ID,
    Or_ID,
    NotEquals_ID,
    GreaterEquals_ID,
    SmallerEquals_ID,
    Colon_ID,
    Return_ID,
    New_ID,
    EOF,
}

class Token {
    constructor(public type: SyntaxKind, public value = "") {}
}

class Lexer {
    private text: string;
    private pos: number;
    private currentChar: string | null;

    constructor(text: string) {
        this.text = text;
        this.pos = 0;
        this.currentChar = text[0] || null;
    }

    private advance(count = 1): string | null {
        this.pos += count;
        this.currentChar = this.text[this.pos] || null;
        return this.currentChar;
    }

    private skipWhitespace() {
        while (this.currentChar === " ") {
            this.advance();
        }
    }

    private skipNewLine() {
        while (this.currentChar === "\r" || this.currentChar === "\n") {
            this.advance();
        }
    }

    private getNumber(): string{
        let res = "";
        while(this.isDigit(this.currentChar ?? "")){
            res += this.currentChar;
            this.advance();
        }
        return res;
    }

    private isDigit(char: string): boolean {
        const charCode = char.charCodeAt(0);
        return charCode >= 48 && charCode <= 57; // ASCII codes for digits '0' to '9'
    }
    private isLetterOrDigit(char: string): boolean {
        const charCode = char.charCodeAt(0);
        return (
            (charCode >= 48 && charCode <= 57) || // Digits '0' to '9'
            (charCode >= 65 && charCode <= 90) || // Uppercase letters 'A' to 'Z'
            (charCode >= 97 && charCode <= 122) // Lowercase letters 'a' to 'z'
        );
    }

    private getString(): string {
        let result = "";
        this.advance(); //skip the first character, because it is "
        while (this.currentChar !== "\0" && this.currentChar !== '"') {
            result += this.currentChar;
            this.advance();
        }
        this.advance();
        return result;
    }
    private getIdentifier(): string {
        let result = "";
        while (
            this.currentChar !== "\0" &&
            (this.isLetterOrDigit(this.currentChar ?? "") || this.currentChar === "_")
        ) {
            result += this.currentChar;
            this.advance();
        }
        return result;
    }

    private isSequence(sequence: string): boolean {
        return (
            this.currentChar === sequence[0] &&
            this.pos + sequence.length < this.text.length &&
            this.text.substring(this.pos, this.pos + sequence.length) === sequence
        );
    }

    public getNextToken(): Token {
        while (this.currentChar !== "\0") {
            if (this.currentChar === " ") {
                this.skipWhitespace();
                continue;
            }

            if (this.currentChar === "\r" || this.currentChar === "\n") {
                this.skipNewLine();
            }

            if (this.currentChar === '"') return new Token(SyntaxKind.String_ID, this.getString());
            if (this.currentChar === "(") {
                this.advance();
                return new Token(SyntaxKind.LeftParen_ID);
            }
            if (this.currentChar === ")") {
                this.advance();
                return new Token(SyntaxKind.RightParen_ID);
            }
            if (this.currentChar === "}") {
                this.advance();
                return new Token(SyntaxKind.RightCurly_ID);
            }
            if (this.currentChar === "{") {
                this.advance();
                return new Token(SyntaxKind.LeftCurly_ID);
            }
            if (this.currentChar === "[") {
                this.advance();
                return new Token(SyntaxKind.LeftSqrBracket_ID);
            }
            if (this.currentChar === "]") {
                this.advance();
                return new Token(SyntaxKind.RightSqrBracket_ID);
            }
            if (this.currentChar === ";") {
                this.advance();
                return new Token(SyntaxKind.Semicolon_ID);
            }
            if (this.currentChar === "=") {
                this.currentChar = this.advance();
                if (this.currentChar === "=") {
                    //check also for == (compare)
                    this.advance();
                    return new Token(SyntaxKind.Compare_ID);
                }
                return new Token(SyntaxKind.Equals_ID);
            }
            if (this.currentChar === ">") {
                this.currentChar = this.advance();
                if (this.currentChar === "=") {
                    //check also for >= (greater equals)
                    this.advance();
                    return new Token(SyntaxKind.GreaterEquals_ID);
                }
                return new Token(SyntaxKind.Greater_ID);
            }
            if (this.currentChar === "<") {
                this.currentChar = this.advance();
                if (this.currentChar === "=") {
                    //check also for <= (smaller equals)
                    this.advance();
                    return new Token(SyntaxKind.SmallerEquals_ID);
                }
                return new Token(SyntaxKind.Smaller_ID);
            }
            if (this.currentChar === "!") {
                this.currentChar = this.advance();
                if (this.currentChar === "=") {
                    this.advance();
                    return new Token(SyntaxKind.NotEquals_ID);
                }
                return new Token(SyntaxKind.Not_ID);
            }
            if (this.currentChar === ":") {
                this.advance();
                return new Token(SyntaxKind.Colon_ID);
            }
            if (this.currentChar === "+") {
                this.advance();
                return new Token(SyntaxKind.Add_ID);
            }
            if (this.currentChar === "-") {
                this.advance();
                return new Token(SyntaxKind.Subtract_ID);
            }
            if (this.currentChar === "*") {
                this.advance();
                return new Token(SyntaxKind.Multiply_ID);
            }
            if (this.currentChar === "/") {
                this.advance();
                return new Token(SyntaxKind.Divide_ID);
            }
            if (this.currentChar === "%") {
                this.advance();
                return new Token(SyntaxKind.Modulo_ID);
            }
            if (this.currentChar === ",") {
                this.advance();
                return new Token(SyntaxKind.Comma_ID);
            }
            if (this.isSequence("if")) {
                this.advance(2);
                return new Token(SyntaxKind.If_KW);
            }
            if (this.isSequence("else")) {
                this.advance(4);
                return new Token(SyntaxKind.Else_KW);
            }
            if (this.isSequence("for")) {
                this.advance(3);
                return new Token(SyntaxKind.For_KW);
            }
            if (this.isSequence("var")) {
                this.advance(3);
                return new Token(SyntaxKind.Variable_ID);
            }
            if (this.isSequence("func")) {
                this.advance(4);
                return new Token(SyntaxKind.Function_ID);
            }
            if (this.isSequence("null")) {
                this.advance(4);
                return new Token(SyntaxKind.Null_ID);
            }
            if (this.isSequence("&&")) {
                this.advance(2);
                return new Token(SyntaxKind.And_ID);
            }
            if (this.isSequence("||")) {
                this.advance(2);
                return new Token(SyntaxKind.Or_ID);
            }
            if (this.isSequence("true")) {
                this.advance(4);
                return new Token(SyntaxKind.True_KW);
            }
            if (this.isSequence("false")) {
                this.advance(5);
                return new Token(SyntaxKind.False_KW);
            }
            if (this.isSequence("string")) {
                this.advance(6);
                return new Token(SyntaxKind.String_ID);
            }
            if (this.isSequence("number")) {
                this.advance(6);
                return new Token(SyntaxKind.Number_ID);
            }
            if (this.isSequence("bool")) {
                this.advance(4);
                return new Token(SyntaxKind.Bool_ID);
            }
            if (this.isSequence("in")) {
                this.advance(2);
                return new Token(SyntaxKind.In_KW);
            }
            if (this.isSequence("range")) {
                this.advance(5);
                return new Token(SyntaxKind.Range_KW);
            }
            if (this.isSequence("return")) {
                this.advance(6);
                return new Token(SyntaxKind.Return_ID);
            }
            if (this.isSequence("len")) {
                this.advance(3);
                return new Token(SyntaxKind.Len_KW);
            }
            if(this.isSequence("new")){
                this.advance(3);
                return new Token(SyntaxKind.New_ID);
            }
            if(this.isDigit(this.currentChar ?? "")){
                return new Token(SyntaxKind.Number_ID, this.getNumber());
            }
            if (this.isLetterOrDigit(this.currentChar ?? "") || this.currentChar === "_") {
                return new Token(SyntaxKind.Identifier_ID, this.getIdentifier());
            } else if (this.currentChar == null) {
                return new Token(SyntaxKind.EOF, "");
            }
            console.log("Invalid character:" + this.currentChar + ":End ");
            // throw new Error("Invalid character:" + this.currentChar + ":End ");
        }

        return new Token(SyntaxKind.EOF, "");
    }
}

export { Token, SyntaxKind, Lexer };
