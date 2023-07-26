import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

export class AST_Else extends AbstractSyntaxTree {
    constructor(public subItems: AbstractSyntaxTree[]) {
        super(null);
    }
}