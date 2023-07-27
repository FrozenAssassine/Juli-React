import { AbstractSyntaxTree } from "./AbstractSyntaxTree";

export class FunctionItem {
    constructor(public params: AbstractSyntaxTree[], public actions: AbstractSyntaxTree[], public returnValue: AbstractSyntaxTree | null) {}
}
