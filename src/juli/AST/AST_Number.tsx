import { AbstractSyntaxTree } from "../AbstractSyntaxTree";
import { Token } from "../Lexer";

class AST_Number extends AbstractSyntaxTree{
    public value: number;

    constructor(public token: Token) {
        super(null);
        this.value = parseInt(token.value, 10);
    }
}

export { AST_Number };