import { AbstractSyntaxTree } from "../AbstractSyntaxTree";
import { Token } from "../lexer";

export class AST_String extends AbstractSyntaxTree {
    public value: string;
    constructor(public token: Token) {
        super(null);
        this.value = token.value;
    }
}
