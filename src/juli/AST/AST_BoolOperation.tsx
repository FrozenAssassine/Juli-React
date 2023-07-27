import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

class AST_BoolOperation extends AbstractSyntaxTree {
    constructor(public boolOperation: BoolOperation) {
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