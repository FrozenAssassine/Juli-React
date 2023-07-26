import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

class AST_BoolOperation extends AbstractSyntaxTree {
    constructor(boolOperation: BoolOperation) {
        super(null);
    }
}
enum BoolOperation {
    Equals,
    And,
    Or,
    Not,
    NotEquals,
    Greater,
    Smaller,
    GreaterEquals,
    SmallerEquals,
}


export {AST_BoolOperation, BoolOperation};