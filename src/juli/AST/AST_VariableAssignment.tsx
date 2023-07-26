import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

enum VariableType {
    Scalar,
    Array,
}

class AST_VariableAssignment extends AbstractSyntaxTree {
    constructor(public assignItems: AbstractSyntaxTree[], public name: string, public type = VariableType.Scalar) {
        super(null);
    }
}

export { AST_VariableAssignment, VariableType };
