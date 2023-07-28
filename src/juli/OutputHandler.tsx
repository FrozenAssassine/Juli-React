export class OutputHandler{
    constructor(public output: HTMLElement) { }

    public printOutput(data: any) {
        this.output.innerText += data + "\n";
    }
}