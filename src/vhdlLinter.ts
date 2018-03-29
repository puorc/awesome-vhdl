import { Disposable, Range, workspace, TextDocument, TextDocumentChangeEvent, DiagnosticSeverity, DiagnosticCollection, Diagnostic, languages } from "vscode";
import * as child from 'child_process';

export default class vhdlLinter {
	protected subscriptions: Disposable[];
	protected diagnostic_collection: DiagnosticCollection;
	protected lintCount: number;

	constructor() {
		this.diagnostic_collection = languages.createDiagnosticCollection();

		this.lintCount = 10;
		workspace.onDidOpenTextDocument(this.startLint, this, this.subscriptions);
		workspace.onDidSaveTextDocument(this.startLint, this, this.subscriptions);
		workspace.onDidCloseTextDocument(this.removeFileDiagnostics, this, this.subscriptions)
	}

	private startLint(doc: TextDocument) {
		if (doc.languageId == "vhdl") {
			var tmp: child.ChildProcess = child.exec('ghdl -s ' + doc.fileName,{env:process.env},(error:Error, stdout:string, stderr:string) => {
				let diagnostics: Diagnostic[] = [];
				let lines = stderr.split(/\r?\n/g);
				if (lines[0].substring(0,6)=='\'ghdl\''){
					console.log("GHDL Linter not found.");
				}
				else{
					lines.forEach((line, i) => {
						if(line.startsWith(doc.fileName)){
							line = line.replace(doc.fileName, '');
							let terms = line.split(':');
							let lineNum = parseInt(terms[1].trim()) - 1;
							let colNum = parseInt(terms[2].trim()) - 1;
							if(terms.length == 4){
								diagnostics.push({
									severity: DiagnosticSeverity.Error,
									range:new Range(lineNum, 0, lineNum, Number.MAX_VALUE),
									message: terms[3].trim(),
									code: 'GHDL',
									source: 'GHDL'
								});
							}
						}
					})
					this.diagnostic_collection.set(doc.uri, diagnostics)
				}
			})
		}
	}

	private removeFileDiagnostics(doc: TextDocument) {
		this.diagnostic_collection.delete(doc.uri);
	}

    protected lint(doc: TextDocument) {
	}
	
}
