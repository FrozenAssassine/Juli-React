import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

class AST_VariableCall extends AbstractSyntaxTree {
    constructor(public variableCallAction: VariableCallAction, public variablename: string) {
        super(null);
    }
}

enum VariableCallAction
{
    Change, Read
}
export { AST_VariableCall, VariableCallAction };