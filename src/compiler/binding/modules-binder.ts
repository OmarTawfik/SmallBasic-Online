import { StatementBinder } from "./statement-binder";
import { Diagnostic, ErrorCode } from "../utils/diagnostics";
import { BaseSyntaxNode, ParseTreeSyntax } from "../syntax/syntax-nodes";
import { BaseBoundStatement } from "./bound-nodes";

export class ModulesBinder {
    public static readonly MainModuleName: string = "<Main>";

    private _definedSubModules: { [name: string]: boolean } = {};
    private _boundModules: { [name: string]: ReadonlyArray<BaseBoundStatement<BaseSyntaxNode>> } = {};

    public get boundModules(): { readonly [name: string]: ReadonlyArray<BaseBoundStatement<BaseSyntaxNode>> } {
        return this._boundModules;
    }

    public constructor(parseTree: ParseTreeSyntax, private readonly _diagnostics: Diagnostic[]) {
        this.constructSubModulesMap(parseTree);

        this._boundModules[ModulesBinder.MainModuleName] = this.bindModule(parseTree.mainModule);

        parseTree.subModules.forEach(subModule => {
            this._boundModules[subModule.subCommand.nameToken.token.text] = this.bindModule(subModule.statementsList);
        });
    }

    private constructSubModulesMap(parseTree: ParseTreeSyntax): void {
        parseTree.subModules.forEach(subModule => {
            const nameToken = subModule.subCommand.nameToken;
            if (this._definedSubModules[nameToken.token.text]) {
                this._diagnostics.push(new Diagnostic(
                    ErrorCode.TwoSubModulesWithTheSameName,
                    nameToken.range,
                    nameToken.token.text));
            } else {
                this._definedSubModules[nameToken.token.text] = true;
            }
        });
    }

    private bindModule(statements: ReadonlyArray<BaseSyntaxNode>): ReadonlyArray<BaseBoundStatement<BaseSyntaxNode>> {
        return new StatementBinder(statements, this._definedSubModules, this._diagnostics).result;
    }
}
