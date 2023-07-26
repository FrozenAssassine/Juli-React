import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

export class AST_Len extends AbstractSyntaxTree{
    constructor(public value: AbstractSyntaxTree | null) {
        super(null);
    }
}