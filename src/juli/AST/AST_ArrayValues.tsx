import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

export class AST_ArrayValues extends AbstractSyntaxTree {
    constructor(public items: AbstractSyntaxTree[]) {
        super(null);
    }
}