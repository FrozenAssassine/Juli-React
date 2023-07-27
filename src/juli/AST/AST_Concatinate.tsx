import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

export class AST_Concatinate extends AbstractSyntaxTree {
    constructor(public item2: AbstractSyntaxTree | null){
        super(null);
    }
}