import { AST_Bool } from "./AST/AST_Bool";
import { AST_FunctionCall } from "./AST/AST_FunctionCall";
import { AST_Number } from "./AST/AST_Number";
import { AST_Return } from "./AST/AST_Return";
import { AST_String } from "./AST/AST_String";
import { AST_VariableCall } from "./AST/AST_VariableCall";
import { AbstractSyntaxTree } from "./AbstractSyntaxTree";
import { FunctionItem } from "./FunctionItem";
import { IVariable } from "./IVariable";
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
        if(Array.isArray(value)){
            return this.detectArrayDatatype(value);
        }
        
        if (typeof(value) === "string")
            return VariableDataType.String;
        else if (typeof(value) === "number")
            return VariableDataType.Number;
        else if (typeof(value) === "boolean")
            return VariableDataType.Bool;
        throw new Error("Datatype of variable could not be determinated: " + value);
    }

    public static detectDataTypeOfAST(data: AbstractSyntaxTree | null): VariableDataType
    {
        if(data === null)
            return VariableDataType.None;

        if (data instanceof AST_String)
            return VariableDataType.String;
        else if (data instanceof AST_Number)
            return VariableDataType.Number;
        else if (data instanceof AST_Bool)
            return VariableDataType.Bool;
        return VariableDataType.None;
    }

    public static detectDataTypeOfAll(data: AbstractSyntaxTree, variables: Record<string, IVariable>, functions: Record<string, FunctionItem>): VariableDataType {
        let datatype = this.detectDataTypeOfAST(data);
        if(datatype == VariableDataType.None){
            if(data instanceof AST_FunctionCall) {
                let func_call = data as AST_FunctionCall;
                if(functions[func_call.name] !== undefined){
                    return this.detectDataTypeOfAST(functions[func_call.name].returnValue);
                }
            }
            else if(data instanceof AST_VariableCall) {
                let item = variables[(data as AST_VariableCall).variablename];
                if(item === undefined)
                    throw new Error(`The variable ${(data as AST_VariableCall).variablename} does not exist`);
                return item.variableDataType;
            }
        }
        return datatype;
    }
    
    public static detectArrayDatatype(items: AbstractSyntaxTree[]): VariableDataType
    {
        //update this to check not only the first, but all items:
        return this.detectDataTypeOfAST(items[0]);
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