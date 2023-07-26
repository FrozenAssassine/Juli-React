import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

export class AST_ForLoop extends AbstractSyntaxTree {
    constructor(public iterationVariableName: string, public subItems: AbstractSyntaxTree[], public iterationOperator: AbstractSyntaxTree | null) {
        super(null);
    }
}