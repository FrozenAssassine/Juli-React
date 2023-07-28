// interpreter.ts
import { Parser, VariableDataType } from "./Parser";
import { Lexer } from "./Lexer";
import { AbstractSyntaxTree } from "./AbstractSyntaxTree";
import { AST_MathOperation, MathOperation } from "./AST/AST_MathOperation";
import { AST_VariableCall, VariableCallAction } from "./AST/AST_VariableCall";
import { VariableHelper } from "./VariableHelper";
import { AST_String } from "./AST/AST_String";
import { AST_Number } from "./AST/AST_Number";
import { AST_Concatinate } from "./AST/AST_Concatinate";
import { AST_Bool } from "./AST/AST_Bool";
import { AST_Arrayaccess } from "./AST/AST_Arrayaccess";
import { AST_If } from "./AST/AST_If";
import { AST_Len } from "./AST/AST_Len";
import { ArrayVariable, IVariable, ScalarVariable } from "./IVariable";
import { AST_FunctionCall } from "./AST/AST_FunctionCall";
import { FunctionItem } from "./FunctionItem";
import { AST_FunctionArgument } from "./AST/AST_FunctionArgument";
import { AST_Return } from "./AST/AST_Return";
import { AST_FunctionCreate } from "./AST/AST_FunctionCreate";
import { AST_ForLoop } from "./AST/AST_ForLoop";
import { AST_VariableAssignment, VariableType } from "./AST/AST_VariableAssignment";
import { AST_BoolOperation, BoolOperation } from "./AST/AST_BoolOperation";
import { AST_Range } from "./AST/AST_Range";
import { OutputHandler } from "./OutputHandler";
import { AST_ArrayValues } from "./AST/AST_ArrayValues";

export class Interpreter {
    private parser: Parser;

    private Variables: Record<string, IVariable> = {};
    private Functions: Record<string, FunctionItem> = {};

    constructor(public code: string, public outputHandler: OutputHandler) {
        const lexer = new Lexer(code);
        this.parser = new Parser(lexer);
    }

    private calculateMath(value1: any, value2: any, operation: MathOperation): any {
        switch (operation) {
            case MathOperation.Add:
                return value1 + value2;
            case MathOperation.Subtract:
                return value1 - value2;
            case MathOperation.Multiply:
                return value1 * value2;
            case MathOperation.Divide:
                return value1 / value2;
            case MathOperation.Modulo:
                return value1 % value2;
        }
        throw new Error(`Could not calculate ${value1} and ${value2} with ${operation}`);
    }

    private breakDownMath(nodes: AbstractSyntaxTree[]): { val: number; lastingNodes: AbstractSyntaxTree[] | null } {
        let operation = MathOperation.Add;
        let result = 0;

        for (let node of nodes) {
            if (node instanceof AST_MathOperation) {
                operation = (node as AST_MathOperation).mathOperation;
            } else if (VariableHelper.isNumber(node)) {
                result = this.calculateMath(result, VariableHelper.getNumberFromAST(node), operation);
            } else if (node instanceof AST_VariableCall) {
                let variable_call = node as AST_VariableCall;
                if (variable_call.variableCallAction === VariableCallAction.Change)
                    throw new Error("Currently not possible to change variable in assignment");
                else {
                    var variableItem = this.getVariableValue(variable_call);
                    var datatype = VariableHelper.detectDataType(variableItem);
                    if (datatype === VariableDataType.Number)
                        result = this.calculateMath(result, parseFloat(variableItem), operation);
                    else throw new Error(`Variable ${variable_call.variablename} has invalid datatype`);
                }
            } else {
                return { val: result, lastingNodes: nodes.slice(nodes.indexOf(node), -1) };
            }
        }
        return { val: result, lastingNodes: null };
    }

    private getVariablesValue(nodes: AbstractSyntaxTree[]): any {
        if (nodes.length === 1) return this.getVariableValue(nodes[0]);

        let output = "";
        if (
            (nodes[0] instanceof AST_VariableCall && nodes[1] instanceof AST_MathOperation) ||
            (VariableHelper.isNumber(nodes[0]) && nodes[1] instanceof AST_MathOperation)
        ) {
            var result = this.breakDownMath(nodes);
            if (result.lastingNodes == null) return result.val;
            else {
                output += result.val;
                output += this.getVariablesValue(result.lastingNodes);
                return output;
            }
        } else if (
            nodes[0] instanceof AST_String &&
            nodes[1] instanceof AST_MathOperation &&
            (nodes[1] as AST_MathOperation).mathOperation === MathOperation.Multiply &&
            nodes[2] instanceof AST_Number
        ) {
            let str = nodes[0] as AST_String;
            let integer = nodes[2] as AST_Number;

            //string repeat syntax eg. "Hello" * 10
            return str.value.repeat(integer.value);
        } else {
            for (var item of nodes) {
                output += this.getVariableValue(item);
            }
            return output;
        }
    }

    private getVariableByName(name: string): IVariable {
        if (this.variableExists(name)) {
            return this.Variables[name];
        }
        throw new Error(`The variable ${name} does not exist`);
    }

    private getVariableCallValue(variable_call: AST_VariableCall): any {
        return this.getVariableByName(variable_call.variablename).value;
    }

    private getArrayValueByIndex(array_access: AST_Arrayaccess): any {
        var array = this.getVariableByName(array_access.variableName).value as AbstractSyntaxTree[];

        let start = this.getVariableValue(array_access.start) as number;
        let end = this.getVariableValue(array_access.end) as number;

        if (start === end) return this.getVariableValue(array[start]);
        else if (end === -1) return array.slice(start);
        return array.slice(start, end);
    }

    private parameterAndArgumentMatch(params: AbstractSyntaxTree[], args: AbstractSyntaxTree[]): boolean {
        return params.length === args.length;
    }

    private assignFunctionParameterVariable(
        name: string,
        datatype: VariableDataType,
        value: any,
        minbracketDepth: number
    ): IVariable {
        return this.Variables[name] = new ScalarVariable(datatype, value, minbracketDepth);
    }

    private deleteVariable(name: string) {
        delete this.Variables[name];
    }

    private getArgumentsValue(items: AbstractSyntaxTree[]): string {
        let res = this.getVariablesValue(items);
        if (res == null) return "null";

        //print the array as actual values:
        if (Array.isArray(res)) return "[" + res.map((x) => this.getVariableValue(x)).join(",") + "]";
        return res;
    }

    private getBuiltinFunction(name: string, function_call: AST_FunctionCall) {
        if (name === "print") {
            this.outputHandler.printOutput(this.getArgumentsValue(function_call.args));
            return true;
        }
        return false;
    }

    private callFunction(function_call: AST_FunctionCall) {
        let returnValue: any = null;

        let functionItem: FunctionItem = this.Functions[function_call.name];

        if (functionItem !== undefined) {
            if (!this.parameterAndArgumentMatch(function_call.args, functionItem?.params))
                throw new Error(`The parameters for the function ${function_call.name} do not match`);

            for (let i = 0; i < function_call.args.length; i++) {
                let variableValue: any = this.getVariableValue(function_call.args[i]);
                let variableItem = functionItem.params[i] as AST_FunctionArgument;
                this.assignFunctionParameterVariable(
                    variableItem.name,
                    variableItem.datatype,
                    variableValue,
                    this.parser.bracketDepth.curlyBracket
                );
            }

            var interpretResult = this.interpretNexts(functionItem.actions);
            if (interpretResult == null) returnValue = null;
            if (interpretResult instanceof AST_Return)
                returnValue = this.getVariablesValue((interpretResult as AST_Return).subItems);

            //remove the variables:
            for (let i = 0; i < function_call.args.length; i++) {
                var variableItem = functionItem.params[i] as AST_FunctionArgument;
                this.deleteVariable(variableItem.name);
            }

            return returnValue;
        } else if (!this.getBuiltinFunction(function_call.name, function_call))
            throw new Error(`No function with the name ${function_call.name} was found`);

        return "";
    }

    private checkCondition(ast_if: AST_If) {
        //TODO: split conditions on && ||
        return this.checkSmallCondition(ast_if.condition);
    }

    private checkSmallCondition(items: AbstractSyntaxTree[]) {
        if (items.length === 3) {
            let value1: any = this.getVariableValue(items[0]);
            let value2: any = this.getVariableValue(items[2]);
            var booloperation = (items[1] as AST_BoolOperation).boolOperation;

            switch (booloperation) {
                case BoolOperation.Equals:
                    return value1 === value2;
                case BoolOperation.NotEquals:
                    return value1 !== value2;
                case BoolOperation.Greater:
                    return value1 > value2;
                case BoolOperation.GreaterEquals:
                    return value1 >= value2;
                case BoolOperation.Smaller:
                    return value1 < value2;
                case BoolOperation.SmallerEquals:
                    return value1 <= value2;
            }
        }
        return false;
    }

    private handleIf(ast_if: AST_If): any {
        if (this.checkCondition(ast_if)) {
            for (let item of ast_if.subItems) {
                if (item == null) continue;
                var value = this.interpretNext(item as AbstractSyntaxTree);
                if (value != null) return value;
            }
        }
        return null;
    }

    private getVariableLength(ast_len: AST_Len): any {
        if (ast_len.value instanceof AST_VariableCall) {
            var val = this.getVariableValue(ast_len.value as AST_VariableCall);
            if (Array.isArray(val)) return (val as AbstractSyntaxTree[]).length;
            return val;
        } else if (ast_len.value instanceof AST_String) {
            return (ast_len.value as AST_String).value.length;
        }
        throw new Error(`Can not get length of ${ast_len.value}`);
    }

    private getVariableValue(node: AbstractSyntaxTree | null): any {
        if (node instanceof AST_VariableCall) return this.getVariableCallValue(node as AST_VariableCall);
        else if (node instanceof AST_String) return (node as AST_String).value;
        else if (node instanceof AST_Number) return (node as AST_Number).value;
        else if (node instanceof AST_Concatinate) return this.getVariableValue((node as AST_Concatinate).item2);
        else if (node instanceof AST_Bool) return (node as AST_Bool).value;
        else if (node instanceof AST_Arrayaccess) return this.getArrayValueByIndex(node as AST_Arrayaccess);
        else if (node instanceof AST_FunctionCall) return this.callFunction(node as AST_FunctionCall);
        else if (node instanceof AST_If) return this.handleIf(node as AST_If);
        else if (node instanceof AST_Len) return this.getVariableLength(node as AST_Len);
        else if (node instanceof AST_ArrayValues) return (node as AST_ArrayValues).items;
        throw new Error(`Could not get value of variable ${node} -> getVariableValue(node)`);
    }

    private variableExists(name: string): boolean {
        return this.Variables[name] !== undefined;
    }

    private assignVariable(variable_assign: AST_VariableAssignment) {
        let dataType: VariableDataType;
        let value: any;
        //do not assign single underscores as variable
        if (variable_assign.name === "_") return;

        if (variable_assign.type === VariableType.Array) {
            dataType = VariableHelper.detectArrayDatatype(variable_assign.assignItems);
            value = variable_assign.assignItems;
        } else {
            value = this.getVariableValue(variable_assign.assignItems[0]);
            dataType = VariableHelper.detectDataTypeOfAny(value);
        }

        if (this.variableExists(variable_assign.name)) {
            this.Variables[variable_assign.name].value = value;
        } else {
            if (variable_assign.type === VariableType.Array)
                this.Variables[variable_assign.name] = new ArrayVariable(dataType, value);
            else this.Variables[variable_assign.name] = new ScalarVariable(dataType, value);
        }
    }

    private interpretNexts(nodes: AbstractSyntaxTree[]): any {
        for (let node of nodes) {
            var next = this.interpretNext(node);
            // if (next != null) return next;
        }
        return null;
    }

    private callVariable(variable_call: AST_VariableCall) {
        if (variable_call.variableCallAction === VariableCallAction.Change) {
            //when: variable = x
            if (variable_call.nextToken != null) this.interpretNext(variable_call.nextToken);
        }
        //no need for else, why call a variable without doing anything with it
    }

    private createFunction(function_create: AST_FunctionCreate) {
        this.Functions[function_create.functionName] = new FunctionItem(
            function_create.parameter,
            function_create.actions,
            function_create.returnType
        );
    }

    private assignIterableVariable(
        name: string,
        datatype: VariableDataType,
        value: any,
        minbracketDepth: number
    ): IVariable {
        return (this.Variables[name] = new ScalarVariable(datatype, value, minbracketDepth));
    }
    
    private changeIterableVariable(name: string, newValue: any) {
        this.Variables[name].value = newValue;
    }

    public isIteratable(variable_name: string) {
        let val = this.Variables[variable_name];
        if (this.variableExists(variable_name)) {
            if (val instanceof ArrayVariable) return true;
            else if (val instanceof ScalarVariable)
                return (val as ScalarVariable).variableDataType === VariableDataType.String;
        }
        return false;
    }

    private callArrayAccess(array_access: AST_Arrayaccess) {
        if (array_access.access === VariableCallAction.Read)
            this.callVariable(new AST_VariableCall(array_access.access, array_access.variableName));
        //ChangeArrayVariable(array_access);
    }

    private handleForLoop(for_loop: AST_ForLoop) {
        //when the iteration operator is of type range:
        if (for_loop.iterationOperator instanceof AST_Range) {
            let range = for_loop.iterationOperator as AST_Range;
            //create the iteration variable, with the value 0 and assign the current bracket depth to it.
            this.assignIterableVariable(
                for_loop.iterationVariableName,
                VariableDataType.Number,
                0,
                this.parser.bracketDepth.curlyBracket
            );

            let start: number = this.getVariableValue(range.start);
            let end: number = this.getVariableValue(range.end);

            for (let i = start; i < end; i++) {
                //update the value of the variable
                this.changeIterableVariable(for_loop.iterationVariableName, i);
                this.interpretNexts(for_loop.subItems);
            }
        }
        //When the iteration opoerator is of type array:
        else {
            let value = this.getVariableValue(for_loop.iterationOperator);
            if(value === null)
                return;
            
            // if (!this.isIteratable(variable_call.variablename))
            //     throw new Error("Variable " + variable_call.variablename + " is not iterable");

            //create the iteration variable, with null and assign the current bracket depth to it.
            this.assignIterableVariable(
                for_loop.iterationVariableName,
                VariableHelper.detectDataTypeOfAny(value),
                null,
                this.parser.bracketDepth.curlyBracket
            );

                console.log(value);

            //array item:
            if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    //update the value of the variable
                    this.changeIterableVariable(for_loop.iterationVariableName, this.getVariableValue(value[i]));
                    this.interpretNexts(for_loop.subItems);
                }
            } else if(typeof(value) == "string") {
                //string:
                for (let i = 0; i < value.length; i++) {
                    //update the value of the variable
                    this.changeIterableVariable(for_loop.iterationVariableName, value[i]);
                    this.interpretNexts(for_loop.subItems);
                }
            }
        }

        //remove the variable after the for loop finished:
        this.deleteVariable(for_loop.iterationVariableName);
    }

    private interpretNext(node: AbstractSyntaxTree): any {
        if (node == null) return null;
        if (node instanceof AST_VariableAssignment) this.assignVariable(node as AST_VariableAssignment);
        else if (node instanceof AST_VariableCall) this.callVariable(node as AST_VariableCall);
        else if (node instanceof AST_FunctionCall) this.callFunction(node as AST_FunctionCall);
        else if (node instanceof AST_FunctionCreate) this.createFunction(node as AST_FunctionCreate);
        else if (node instanceof AST_ForLoop) this.handleForLoop(node as AST_ForLoop);
        else if (node instanceof AST_Arrayaccess) this.callArrayAccess(node as AST_Arrayaccess);
        else if (node instanceof AST_Return) return node as AST_Return;
        else if (node instanceof AST_If) return this.handleIf(node as AST_If);
        else if (node instanceof AST_Len) return this.getVariableLength(node as AST_Len);
        return null;
    }

    public interpret() {
        var root = this.parser.parse();
        while (root?.nextToken != null) {
            this.interpretNext(root.nextToken);
            root = root.nextToken;
        }
    }
}
