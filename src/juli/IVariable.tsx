import { VariableDataType } from "./Parser";

interface IVariable {
    variableDataType: VariableDataType;
    value: any;
    curlyBracketDepth: number;
}

class ArrayVariable implements IVariable {
    constructor(public variableDataType: VariableDataType, public value: any, public curlyBracketDepth = 0) {}
}
class ScalarVariable implements IVariable {
    constructor(public variableDataType: VariableDataType, public value: any, public curlyBracketDepth = 0) {}
}


export {ArrayVariable, ScalarVariable};
export type {IVariable};