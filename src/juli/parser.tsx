// parser.ts
import { Lexer, SyntaxKind, Token } from "./lexer";
import { AbstractSyntaxTree } from "./AbstractSyntaxTree";
import { AST_Number } from "./AST/AST_Number";
import { BracketDepth } from "./BracketDepth";
import { AST_BoolOperation, BoolOperation } from "./AST/AST_BoolOperation";
import { AST_MathOperation, MathOperation } from "./AST/AST_MathOperation";
import { AST_Bool } from "./AST/AST_Bool";
import { AST_String } from "./AST/AST_String";
import { AST_Range } from "./AST/AST_Range";
import { AST_Len } from "./AST/AST_Len";
import { AST_Concatinate } from "./AST/AST_Concatinate";
import { AST_VariableAssignment, VariableType } from "./AST/AST_VariableAssignment";
import { AST_ForLoop } from "./AST/AST_ForLoop";
import { AST_FunctionCreate } from "./AST/AST_FunctionCreate";
import { AST_FunctionCall } from "./AST/AST_FunctionCall";
import { AST_FunctionArgument } from "./AST/AST_FunctionArgument";
import { AST_VariableCall, VariableCallAction } from "./AST/AST_VariableCall";
import { AST_Arrayaccess } from "./AST/AST_Arrayaccess";
import { AST_Return } from "./AST/AST_Return";
import { AST_Else } from "./AST/AST_Else";
import { AST_If } from "./AST/AST_If";

enum VariableDataType {
    Number,
    String,
    Bool,
    None,
}

class Parser {
    private lexer: Lexer;
    private currentToken: Token;
    private bracketDepth: BracketDepth;
    private lastToken: Token | null;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
        this.bracketDepth = new BracketDepth();
        this.lastToken = null;
    }

    public detectDataType(token: Token): VariableDataType {
        let identifier = token.type;
        if (identifier === SyntaxKind.String_ID) return VariableDataType.String;
        if (identifier === SyntaxKind.Number_ID) return VariableDataType.Number;
        if (identifier === SyntaxKind.Bool_ID) return VariableDataType.Bool;
        throw new Error("Datatype of variable could not be determinated: " + token.type);
    }

    private nextToken(tokenType: SyntaxKind) {
        if (this.currentToken.type === tokenType) {
            this.nextTokenAny();
        } else {
            throw new Error("Expected " + tokenType + " but got " + this.currentToken.type);
        }
    }
    private nextTokenAny(): Token {
        this.lastToken = this.currentToken;
        let next = this.lexer.getNextToken();
        return (this.currentToken = next);
    }

    private getAddOperator(): AbstractSyntaxTree {
        const last = this.lastToken;
        this.nextToken(SyntaxKind.Add_ID);

        //concatenate strings:
        if (last?.type === SyntaxKind.String_ID) return new AST_Concatinate(this.identify(last), this.identify());
        return new AST_MathOperation(MathOperation.Add);
    }
    private getRangeKeyword(): AbstractSyntaxTree {
        this.nextToken(SyntaxKind.Range_KW);
        this.nextToken(SyntaxKind.LeftParen_ID);
        let start = this.identify(this.currentToken);
        this.nextToken(SyntaxKind.Comma_ID);
        let end = this.identify(this.currentToken);
        this.nextToken(SyntaxKind.RightParen_ID);

        return new AST_Range(start, end);
    }
    private getLenKeyword(): AbstractSyntaxTree {
        this.nextToken(SyntaxKind.Len_KW);
        this.nextToken(SyntaxKind.LeftParen_ID);
        let variable = this.identify();
        this.nextToken(SyntaxKind.RightParen_ID);
        return new AST_Len(variable);
    }
    private getVariableCreate(): AbstractSyntaxTree {
        console.log("Variable Create");
        this.nextToken(SyntaxKind.Variable_ID);
        const name = this.currentToken.value ?? "";
        this.nextToken(SyntaxKind.Identifier_ID);
        return this.getVariableAssingValue(name);
    }
    private getVariableAssingValue(variableName: string): AbstractSyntaxTree {
        this.nextToken(SyntaxKind.Equals_ID);
        let identifier: SyntaxKind = this.currentToken.type;
        let assignValues: AbstractSyntaxTree[] = [];

        //Array:
        if (identifier === SyntaxKind.LeftSqrBracket_ID) {
            do {
                let item = this.identify();
                identifier = this.currentToken.type;
                if (identifier !== SyntaxKind.Semicolon_ID && item != null) {
                    assignValues.push(item);
                }
            } while (identifier !== SyntaxKind.Semicolon_ID);
            return new AST_VariableAssignment(assignValues, variableName, VariableType.Array);
        }

        while (identifier !== SyntaxKind.Semicolon_ID) {
            let item = this.identify();
            if (item != null) {
                assignValues.push(item);
            }
            identifier = this.currentToken.type;
        }
        this.nextToken(SyntaxKind.Semicolon_ID);
        return new AST_VariableAssignment(assignValues, variableName);
    }
    private getForLoop(): AbstractSyntaxTree {
        //for(var item in range(0,100)) { }
        //for(var item in variable) { }

        const startDepth = new BracketDepth().fromBracketDepth(this.bracketDepth);

        this.nextToken(SyntaxKind.For_KW);

        this.identify(); //bracket
        this.nextToken(SyntaxKind.Variable_ID);
        let iterationVariableName = this.currentToken.value;
        this.nextToken(SyntaxKind.Identifier_ID);
        this.nextToken(SyntaxKind.In_KW);

        let iterationOperator: AbstractSyntaxTree | null = null;
        while (startDepth.parenthesis !== this.bracketDepth.parenthesis) {
            let item = this.identify();
            if (item == null) continue;

            iterationOperator = item;
        }

        //actions:
        let subItems: AbstractSyntaxTree[] = [];
        do {
            let item = this.identify();
            if (item != null) subItems.push(item);
        } while (startDepth.curlyBracket !== this.bracketDepth.curlyBracket);

        return new AST_ForLoop(iterationVariableName, subItems, iterationOperator);
    }

    private getFunctionCreate(): AbstractSyntaxTree {
        let startdepth = new BracketDepth().fromBracketDepth(this.bracketDepth);
        this.nextToken(SyntaxKind.Function_ID);
        let functionName = this.currentToken.value;
        this.nextToken(SyntaxKind.Identifier_ID);
        let parameter: AbstractSyntaxTree[] = [];
        let returnType: AbstractSyntaxTree | null = null;

        do {
            let item = this.identify();
            if (item != null) parameter.push(item);
        } while (startdepth.parenthesis !== this.bracketDepth.parenthesis);

        //if function has a return value:
        if (this.currentToken != null && this.currentToken.type === SyntaxKind.Colon_ID) {
            this.nextTokenAny();
            returnType = this.identify();

            if (
                !(
                    returnType instanceof AST_String ||
                    returnType instanceof AST_Number ||
                    returnType instanceof AST_Bool
                )
            )
                throw new Error("Invalid return type of function " + functionName);
        }

        this.identify(this.currentToken);

        let actions: AbstractSyntaxTree[] = [];
        while (startdepth.curlyBracket !== this.bracketDepth.curlyBracket) {
            let item = this.identify();
            if (item == null) continue;

            actions.push(item);
        }
        return new AST_FunctionCreate(functionName, returnType, parameter, actions);
    }

    private getFunctionCallArgument(): AbstractSyntaxTree[] {
        let startdepth = new BracketDepth().fromBracketDepth(this.bracketDepth);
        let args: AbstractSyntaxTree[] = [];

        do {
            var item = this.identify();
            if (item == null) continue;

            args.push(item);
        } while (startdepth.parenthesis !== this.bracketDepth.parenthesis);

        return args;
    }

    private getIdentifier(): AbstractSyntaxTree | null {
        let value = this.currentToken.value;
        if (value.length > 0) {
            let identifier = this.nextTokenAny().type;

            // identifier(... -> function call:
            if (identifier === SyntaxKind.LeftParen_ID)
                return new AST_FunctionCall(value, this.getFunctionCallArgument());
            else if (identifier === SyntaxKind.Colon_ID) return this.getFunctionArgument();
            else return this.getVariableCall(value, identifier);
        }
        this.nextTokenAny();
        return new AbstractSyntaxTree(null);
    }

    private getFunctionArgument(): AbstractSyntaxTree {
        let name = this.lastToken?.value;
        this.nextToken(SyntaxKind.Colon_ID);
        let datatype = this.detectDataType(this.currentToken);
        this.nextTokenAny();
        if (this.currentToken.type === SyntaxKind.Comma_ID) this.nextTokenAny();

        return new AST_FunctionArgument(name ?? "", datatype);
    }

    private getArrayAccessValue(ast_items: { item: AbstractSyntaxTree | null; id: SyntaxKind }[], index: number): any {
        if (ast_items[index].item instanceof AST_Number)
            return parseInt((ast_items[index].item as AST_Number).token.value);
        else if (ast_items[index].item instanceof AST_VariableCall) return ast_items[index].item as AST_VariableCall;
        return null;
    }

    private getArrayAccess(variableName: string): AST_Arrayaccess | null {
        this.nextToken(SyntaxKind.LeftSqrBracket_ID);

        //supported array access formats: [1], [1:5], [:5], [1:], [:]
        let identifier = this.currentToken.type;
        let ast_items: { item: AbstractSyntaxTree | null; id: SyntaxKind }[] = [];

        if (
            identifier === SyntaxKind.Number_ID ||
            identifier === SyntaxKind.Identifier_ID ||
            identifier === SyntaxKind.Colon_ID
        ) {
            do {
                let identify = this.identify();
                identifier = this.currentToken.type;
                ast_items.push({ id: identifier, item: identify });
            } while (identifier !== SyntaxKind.RightSqrBracket_ID);

            this.nextToken(SyntaxKind.RightSqrBracket_ID);

            //[:], [5]
            if (ast_items.length === 1) {
                if (ast_items[0].id === SyntaxKind.Colon_ID) return new AST_Arrayaccess(variableName, 0, -1);
                return new AST_Arrayaccess(
                    variableName,
                    this.getArrayAccessValue(ast_items, 0),
                    this.getArrayAccessValue(ast_items, 0)
                );
            } else if (ast_items.length === 2) {
                //[0:], [:1]
                //[:1]
                if (ast_items[0].id === SyntaxKind.Colon_ID)
                    return new AST_Arrayaccess(variableName, 0, this.getArrayAccessValue(ast_items, 1));
                //[0:]
                else return new AST_Arrayaccess(variableName, this.getArrayAccessValue(ast_items, 0), -1);
            } else if (ast_items.length === 3) {
                //[0:5]
                return new AST_Arrayaccess(
                    variableName,
                    this.getArrayAccessValue(ast_items, 0),
                    this.getArrayAccessValue(ast_items, 2)
                );
            }
            throw new Error("Invalid array access format. Supported: [1:5], [:5], [1:], [:], [5]");
        }
        return null;
    }

    private getVariableCall(value: string, identifier: SyntaxKind): AbstractSyntaxTree | null {
        //index access on an array:
        if (this.currentToken.type === SyntaxKind.LeftSqrBracket_ID) {
            var access = this.getArrayAccess(value);
            this.nextTokenAny();

            if (access != null)
                //&& this.currentToken.type == SyntaxKind.Equals_ID)
                access.access = VariableCallAction.Change;
            return access;
        }

        //change the variable
        if (identifier === SyntaxKind.Equals_ID) return this.getVariableAssingValue(value);
        //read variable:
        else return new AST_VariableCall(VariableCallAction.Read, value);
    }

    private getReturnValue(): AbstractSyntaxTree {
        this.nextToken(SyntaxKind.Return_ID);
        let Items: AbstractSyntaxTree[] = [];

        let identifier: SyntaxKind;
        do {
            identifier = this.currentToken.type;
            var identify = this.identify();
            if (identify != null) Items.push(identify);
        } while (identifier !== SyntaxKind.Semicolon_ID);

        return new AST_Return(Items);
    }

    private getIfKeyword(): AbstractSyntaxTree {
        let startDepth: BracketDepth = new BracketDepth().fromBracketDepth(this.bracketDepth);
        this.nextToken(SyntaxKind.If_KW); //skip if

        let actions: (AbstractSyntaxTree | null)[] = [];
        let condition: AbstractSyntaxTree[] = [];

        //if-condition:
        do {
            let identify = this.identify();
            if (identify != null) condition.push(identify);
        } while (startDepth.parenthesis !== this.bracketDepth.parenthesis);

        actions.push(this.identify());
        while (startDepth.curlyBracket !== this.bracketDepth.curlyBracket) {
            actions.push(this.identify());
        }

        return new AST_If(condition, actions);
    }
    private getElseKeyword(): AbstractSyntaxTree {
        let startDepth: BracketDepth = new BracketDepth().fromBracketDepth(this.bracketDepth);

        this.nextToken(SyntaxKind.Else_KW);
        this.identify(); //skip curly bracket

        let items: AbstractSyntaxTree[] = [];

        do {
            let item = this.identify();
            if (item != null) items.push(item);
        } while (startDepth.curlyBracket !== this.bracketDepth.curlyBracket);

        return new AST_Else(items);
    }

    private identify(token: Token | null = null): AbstractSyntaxTree | null {
        if (token == null) token = this.currentToken;

        if (token == null) return null;

        switch (token.type) {
            //bracketDepth:
            case SyntaxKind.LeftSqrBracket_ID:
                this.nextToken(SyntaxKind.LeftSqrBracket_ID);
                this.bracketDepth.squareBracket++;
                return null;
            case SyntaxKind.RightSqrBracket_ID:
                this.nextToken(SyntaxKind.RightSqrBracket_ID);
                this.bracketDepth.squareBracket--;
                return null;
            case SyntaxKind.LeftCurly_ID:
                this.nextToken(SyntaxKind.LeftCurly_ID);
                this.bracketDepth.curlyBracket++;
                return null;
            case SyntaxKind.RightCurly_ID:
                this.nextToken(SyntaxKind.RightCurly_ID);
                this.bracketDepth.curlyBracket--;
                return null;
            case SyntaxKind.LeftParen_ID:
                this.nextToken(SyntaxKind.LeftParen_ID);
                this.bracketDepth.parenthesis++;
                return null;
            case SyntaxKind.RightParen_ID:
                this.nextToken(SyntaxKind.RightParen_ID);
                this.bracketDepth.parenthesis--;
                return null;

            case SyntaxKind.GreaterEquals_ID:
                this.nextToken(SyntaxKind.GreaterEquals_ID);
                return new AST_BoolOperation(BoolOperation.GreaterEquals);
            case SyntaxKind.Greater_ID:
                this.nextToken(SyntaxKind.Greater_ID);
                return new AST_BoolOperation(BoolOperation.Greater);
            case SyntaxKind.Smaller_ID:
                this.nextToken(SyntaxKind.Smaller_ID);
                return new AST_BoolOperation(BoolOperation.Smaller);
            case SyntaxKind.SmallerEquals_ID:
                this.nextToken(SyntaxKind.SmallerEquals_ID);
                return new AST_BoolOperation(BoolOperation.SmallerEquals);
            case SyntaxKind.Not_ID:
                this.nextToken(SyntaxKind.Not_ID);
                return new AST_BoolOperation(BoolOperation.Not);
            case SyntaxKind.NotEquals_ID:
                this.nextToken(SyntaxKind.NotEquals_ID);
                return new AST_BoolOperation(BoolOperation.NotEquals);
            case SyntaxKind.Equals_ID:
                this.nextToken(SyntaxKind.Equals_ID);
                return new AST_BoolOperation(BoolOperation.Equals);
            case SyntaxKind.Or_ID:
                this.nextToken(SyntaxKind.Or_ID);
                return new AST_BoolOperation(BoolOperation.Or);
            case SyntaxKind.And_ID:
                this.nextToken(SyntaxKind.And_ID);
                return new AST_BoolOperation(BoolOperation.And);
            case SyntaxKind.Compare_ID:
                this.nextToken(SyntaxKind.Compare_ID);
                return new AST_BoolOperation(BoolOperation.Equals);
            case SyntaxKind.Divide_ID:
                this.nextToken(SyntaxKind.Divide_ID);
                return new AST_MathOperation(MathOperation.Divide);
            case SyntaxKind.Multiply_ID:
                this.nextToken(SyntaxKind.Multiply_ID);
                return new AST_MathOperation(MathOperation.Multiply);
            case SyntaxKind.Subtract_ID:
                this.nextToken(SyntaxKind.Subtract_ID);
                return new AST_MathOperation(MathOperation.Subtract);
            case SyntaxKind.Modulo_ID:
                this.nextToken(SyntaxKind.Modulo_ID);
                return new AST_MathOperation(MathOperation.Modulo);
            case SyntaxKind.Add_ID:
                return this.getAddOperator();
            case SyntaxKind.Variable_ID:
                return this.getVariableCreate();
            case SyntaxKind.Function_ID:
                return this.getFunctionCreate();
            case SyntaxKind.Identifier_ID:
                return this.getIdentifier();
            case SyntaxKind.Return_ID:
                return this.getReturnValue();
            case SyntaxKind.Semicolon_ID:
                this.nextToken(SyntaxKind.Semicolon_ID);
                return this.identify(); // new AST_None("End (Semicolon)");
            case SyntaxKind.Colon_ID:
                return this.getFunctionArgument();
            case SyntaxKind.Number_ID:
                this.nextToken(SyntaxKind.Number_ID);
                return new AST_Number(token);
            case SyntaxKind.String_ID:
                this.nextToken(SyntaxKind.String_ID);
                return new AST_String(token);
            case SyntaxKind.Bool_ID:
                this.nextToken(SyntaxKind.Bool_ID);
                return new AST_Bool(token);
            case SyntaxKind.Comma_ID:
                this.nextToken(SyntaxKind.Comma_ID);
                return this.identify();
            case SyntaxKind.If_KW:
                return this.getIfKeyword();
            case SyntaxKind.Else_KW:
                return this.getElseKeyword();
            case SyntaxKind.For_KW:
                return this.getForLoop();
            case SyntaxKind.Range_KW:
                return this.getRangeKeyword();
            case SyntaxKind.Len_KW:
                return this.getLenKeyword();
            default:
                this.nextTokenAny();
                return null;
        }
    }

    public parse(): AbstractSyntaxTree | null {
        let root = this.identify();
        let node = root;

        while (node != null) {
            node = node.nextToken = this.identify();
        }

        return root;
    }
}

export { Parser, VariableDataType };
