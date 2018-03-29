'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import vscode = require('vscode');
import fs = require('fs');
import path = require('path');
import cp = require('child_process');
import { VHDL_MODE } from './vhdlMode';
import { VhdlCompletionItemProvider } from './VhdlSuggest';
import { workspace, DiagnosticCollection } from "vscode";
import * as child from 'child_process';
import vhdlLinter from "./vhdlLinter";

let diagnosticCollection: DiagnosticCollection;
var linter: vhdlLinter;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(ctx: vscode.ExtensionContext): void {
    //console.log('Congratulations, your extension "awesome-vhdl" is now active!');
    ctx.subscriptions.push(vscode.languages.registerCompletionItemProvider(VHDL_MODE, new VhdlCompletionItemProvider(), '.', '\"'));
     vscode.languages.setLanguageConfiguration(VHDL_MODE.language, {
        indentationRules: {
            // ^(.*\*/)?\s*\}.*$
            decreaseIndentPattern: /^end\s+\w*$/,
            // ^.*\{[^}'']*$
            increaseIndentPattern: /^.*(begin|then|loop|is)$/
        },
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
        comments: {
            lineComment: '--',
        },
        brackets: [
            ['(', ')'],
        ],

        __electricCharacterSupport: {
            brackets: [
                { tokenType: 'delimiter.curly.ts', open: '{', close: '}', isElectric: true },
                { tokenType: 'delimiter.square.ts', open: '[', close: ']', isElectric: true },
                { tokenType: 'delimiter.paren.ts', open: '(', close: ')', isElectric: true }
            ]
        },

        __characterPairSupport: {
            autoClosingPairs: [
                { open: '(', close: ')' },
                { open: '`', close: '`', notIn: ['string'] },
                { open: '"', close: '"', notIn: ['string'] },
            ]
        }
    });

    if (vscode.window.activeTextEditor) {
    }

    var tmp: child.ChildProcess = child.exec('ghdl -v',{env:process.env},(error:Error, stdout:string, stderr:string) => {
        let lines = stdout.split(/\r?\n/g);
        if (lines[0].substring(0,4)=='GHDL'){
            linter = new vhdlLinter();
            console.log("GHDL Linter version " + lines[0].substring(5,10) + " Enabled.");
        }
        else{
            console.log("GHDL Linter not found.");
        }
    })
}


// this method is called when your extension is deactivated
export function deactivate() {
}