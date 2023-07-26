import { AbstractSyntaxTree } from "../AbstractSyntaxTree"

class AST_MathOperation extends AbstractSyntaxTree{
    constructor(public mathOperation: MathOperation) {
        super(null);
    }
}

enum MathOperation
{
    Add, Subtract, Multiply, Divide, LeftParen, RightParen, Modulo
}

export {AST_MathOperation, MathOperation};