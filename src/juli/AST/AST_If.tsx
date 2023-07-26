import { AbstractSyntaxTree } from "../AbstractSyntaxTree";

export class AST_If extends AbstractSyntaxTree {
    constructor(public condition: AbstractSyntaxTree[], public subItems: (AbstractSyntaxTree|null)[]) {
        super(null);
    }
}