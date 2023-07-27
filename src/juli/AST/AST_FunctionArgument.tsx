import { AbstractSyntaxTree } from "../AbstractSyntaxTree";
import { VariableDataType } from "../Parser";

export class AST_FunctionArgument extends AbstractSyntaxTree{
    constructor(public name: string, public datatype: VariableDataType) {
        super(null);
    }
}