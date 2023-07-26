import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

export class AST_FunctionCall extends AbstractSyntaxTree {
    constructor(public name: string, public args: AbstractSyntaxTree[]) {
        super(null);
    }
} 