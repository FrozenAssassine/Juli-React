import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

export class AST_Concatinate extends AbstractSyntaxTree {
    constructor(public item1: AbstractSyntaxTree | null, public item2: AbstractSyntaxTree | null){
        super(null);
    }
}