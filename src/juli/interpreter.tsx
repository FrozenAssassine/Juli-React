// interpreter.ts
import { Parser } from "./parser";
import { Lexer } from "./lexer";
import { AbstractSyntaxTree } from "./AbstractSyntaxTree";

function printAST(ast: AbstractSyntaxTree | null){
    console.log("------------NODES------------");

    let node = ast;
    while(node != null) {
        console.log(node);
        node = node.nextToken;
    }
}

function interpret(code: string) {
    const lexer = new Lexer(code);
    const parser = new Parser(lexer);
    const ast = parser.parse();

    printAST(ast);
}

export { interpret };
