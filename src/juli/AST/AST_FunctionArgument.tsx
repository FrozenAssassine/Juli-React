import { AbstractSyntaxTree } from "../AbstractSyntaxTree";
import { VariableDataType } from "../parser";

export class AST_FunctionArgument extends AbstractSyntaxTree{
    constructor(public name: string, public datatype: VariableDataType) {
        super(null);
    }
}