import { AST_Bool } from "./AST/AST_Bool";
import { AST_Number } from "./AST/AST_Number";
import { AST_String } from "./AST/AST_String";
import { AbstractSyntaxTree } from "./AbstractSyntaxTree";
import { SyntaxKind, Token } from "./Lexer";
import { VariableDataType } from "./Parser";

export class VariableHelper{
    public static detectDataType(token: Token): VariableDataType {
        let identifier = token.type;
        if (identifier === SyntaxKind.String_ID) return VariableDataType.String;
        if (identifier === SyntaxKind.Number_ID) return VariableDataType.Number;
        if (identifier === SyntaxKind.Bool_ID) return VariableDataType.Bool;
        throw new Error("Datatype of variable could not be determinated: " + token.type);
    }

    public static isNumber(node: AbstractSyntaxTree): boolean
    {
        return node instanceof AST_Number;
    }

    public static detectDataTypeOfAny(value: any): VariableDataType
    {
        if (typeof(value) === "string")
            return VariableDataType.String;
        else if (typeof(value) === "number")
            return VariableDataType.Number;
        else if (typeof(value) === "boolean")
            return VariableDataType.Bool;
        throw new Error("Datatype of variable could not be determinated: " + value);
    }

    public static detectArrayDatatype(items: AbstractSyntaxTree[]): VariableDataType
    {
        //update this to check not only the first, but all items:
        return this.detectDataTypeOfAny(items[0]);
    }

    public static getNumberFromAST(node: AbstractSyntaxTree): number
    {
        if (node instanceof AST_Number)
            return (node as AST_Number).value;
        throw new Error(`Could not get number from ${node}`);
    }

    public static ParseToDatatype(variable: any, datatype: VariableDataType ): any
    {
        switch (datatype)
        {
            case VariableDataType.String: return (variable as AST_String).value;
            case VariableDataType.Number: return (variable as AST_Number).value;
            case VariableDataType.Bool: return (variable as AST_Bool).value;
        }
        throw new Error("Could not parse " + variable + " to datatype " + datatype);
    }
}