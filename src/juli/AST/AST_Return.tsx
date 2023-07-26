import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

export class AST_Return extends AbstractSyntaxTree{
    constructor(public subItems: AbstractSyntaxTree[]){
        super(null);
    }
}