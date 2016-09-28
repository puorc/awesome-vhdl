'use strict';

import vscode = require('vscode');
import { guessScope, VhdlScopeKind } from './vhdlScopeGuesser';

let kwLibrary = createCompletionKeyword('library');
let kwUse = createCompletionKeyword('use');
let kwPackage = createCompletionKeyword('package');
let kwArchitecture = createCompletionKeyword('architecture');
let kwEntity = createCompletionKeyword('entity');
let kwConfiguration = createCompletionKeyword('configuration');
let kwIs = createCompletionKeyword('is');
let kwBegin = createCompletionKeyword('begin');
let kwEnd = createCompletionKeyword('end');
let kwMap = createCompletionKeyword('map');

let operatorOptions = [
    createCompletionOption('abs'),
    createCompletionOption('and'),
    createCompletionOption('mod'),
    createCompletionOption('nand'),
    createCompletionOption('nor'),
    createCompletionOption('not'),
    createCompletionOption('or'),
    createCompletionOption('rem'),
    createCompletionOption('rol'),
    createCompletionOption('ror'),
    createCompletionOption('sla'),
    createCompletionOption('sll'),
    createCompletionOption('sra'),
    createCompletionOption('srl'),
    createCompletionOption('xnor'),
    createCompletionOption('xor'),
];

let archTypeOptions = [
    createCompletionOption('array'),
    createCompletionOption('type'),
    createCompletionOption('component'),
    createCompletionOption('constant'),
    createCompletionOption('signal'),
    createCompletionOption('subtype'),
    createCompletionOption('variable'),
    createCompletionOption('assert'),
    createCompletionOption('process'),
];

let portTypeOptions = [
    createCompletionOption('in'),
    createCompletionOption('out'),
    createCompletionOption('inout'),
    createCompletionOption('buffer'),
    createCompletionOption('linkage'),
]

let entityOptions = [
    createCompletionOption('generic'),
    createCompletionOption('port'),
];

let scalaTypes = [
    createCompletionKeyword('bit', `The bit data type can only have the value 0 or 1.`),
    createCompletionKeyword('bit_vector', `
The bit_vector data type is the vector version of the bit type consisting of two or more bits. Each bit in a bit_vector can only have the value 0 or 1.`
    ),
    createCompletionKeyword('boolean', `
True or false  
    `),
    createCompletionKeyword('integer', `32-bit	integers.`),
    createCompletionKeyword('natural', `non	negative integer.`),
     createCompletionKeyword('positive', `positive	integer.`),
    createCompletionKeyword('real', `
floating point number. 
    `),
    createCompletionKeyword('time', `
Time in fs,	ps,	ns,	us,	ms,	sec, min, hr  
    `),
    createCompletionKeyword('character', ``),
    createCompletionKeyword('string', `
String for VHDL.  
    `),
    createCompletionOption('downto'),
    createCompletionOption('severity'),
];

function createCompletionKeyword(label: string, doc?: string): vscode.CompletionItem {
    let item = new vscode.CompletionItem(label);
    item.kind = vscode.CompletionItemKind.Keyword;
    if (doc) {
        item.documentation = doc;
    }
    return item
}

function createCompletionOption(option: string, doc?: string): vscode.CompletionItem {
    let item = new vscode.CompletionItem(option);
    item.kind = vscode.CompletionItemKind.Value;
    item.documentation = doc;
    return item
}


export class Proto3CompletionItemProvider implements vscode.CompletionItemProvider {

    public provideCompletionItems(document: vscode.TextDocument,
                                  position: vscode.Position,
                                  token: vscode.CancellationToken)
            : Thenable<vscode.CompletionItem[]> {
        
        return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
            let filename = document.fileName;
            let lineText = document.lineAt(position.line).text;

            if (lineText.match(/^\s*\-\-/)) {
                return resolve([]);
            }

            let inString = false;
            if ((lineText.substring(0, position.character).match(/\"/g) || []).length % 2 === 1) {
                inString = true;
            }

            let suggestions = [];

            let textBeforeCursor = lineText.substring(0, position.character - 1)
            let scope = guessScope(document, position.line);
            //console.log(scope.syntax);
            //console.log(textBeforeCursor);

            switch (scope.kind) {
                case VhdlScopeKind.Vhdl: {
                    suggestions.push(kwArchitecture);
                    suggestions.push(kwBegin);
                    suggestions.push(kwConfiguration);
                    suggestions.push(kwEnd);
                    suggestions.push(kwEntity);
                    suggestions.push(kwIs);
                    suggestions.push(kwPackage);
                    suggestions.push(kwUse);
                    suggestions.push(kwLibrary);
                    break;
                }
                case VhdlScopeKind.Entity: {
                    suggestions.push(...entityOptions);
                    suggestions.push(...scalaTypes);
                    suggestions.push(...portTypeOptions);
                    suggestions.push(kwBegin);
                    suggestions.push(kwEnd);
                    suggestions.push(kwIs);
                    break;
                }
                case VhdlScopeKind.Architecture: {
                    if (textBeforeCursor.match(/^\s*\w*$/)) {
                    } else if (textBeforeCursor.match(/^\s*option\s+\w*$/)) {
                    }
                    break;
                }
            }

            return resolve(suggestions);
        });
    }

}
