import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

export class AST_FunctionCreate extends AbstractSyntaxTree{
    constructor(public functionName: string, public returnType: AbstractSyntaxTree | null, public parameter: AbstractSyntaxTree[], public actions: AbstractSyntaxTree[]) {
        super(null);
    }
}