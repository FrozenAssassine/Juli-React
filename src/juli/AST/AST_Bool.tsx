import { AbstractSyntaxTree } from "../AbstractSyntaxTree";
import { Token } from "../Lexer";

export class AST_Bool extends AbstractSyntaxTree {
    public value: boolean | null;
    constructor(token: Token) {
        super(null);
        this.value = token.value === "true" ? true : false;
    }
}
