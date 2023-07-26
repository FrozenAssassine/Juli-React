import { AbstractSyntaxTree } from "../AbstractSyntaxTree";
import { VariableCallAction } from "./AST_VariableCall";

export class AST_Arrayaccess extends AbstractSyntaxTree
{
    public access: VariableCallAction = VariableCallAction.Read;
    constructor(public variableName: string, public start: any, public end: any){
        super(null);
    }
}