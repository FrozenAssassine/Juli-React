import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

export class AST_FunctionCreate extends AbstractSyntaxTree{
    constructor(public functionName: string, public returnType: AbstractSyntaxTree | null, public parameter: AbstractSyntaxTree[], actions: AbstractSyntaxTree[]) {
        super(null);
    }
}