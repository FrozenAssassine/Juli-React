import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

export class AST_Range extends AbstractSyntaxTree {
    constructor(public start: AbstractSyntaxTree | null, public end: AbstractSyntaxTree | null){
        super(null);
    }
}