'use strict';

import vscode = require('vscode');


const ENT_BEGIN = /\s*entity\s+(\w*)\s+is.*/;
const ARCH_BEGIN = /\s*architecture\s+(\w*)\s+of\s+(\w*)\s+is.*/;
const CONF_BEGIN = /\s*configuration\s+(\w*)\s+of\s+(\w*)\s+is.*/;
const SCOPE_END = /\s*end\s+(\w*).*/;


export function guessScope(doc: vscode.TextDocument,
                           cursorLineNum: number): VhdlScope {
    return new ScopeGuesser(cursorLineNum).guess(doc);
}


export enum VhdlScopeKind {
    Vhdl,
    Entity,
    Architecture,
    Configuration,
}


export class VhdlScope {

    kind: VhdlScopeKind;
    parent: VhdlScope;
    children: VhdlScope[];
    lineFrom: number;
    lineTo: number;

    constructor(kind: VhdlScopeKind, lineFrom: number) {
        this.kind = kind;
        this.children = [];
        this.lineFrom = lineFrom;
    }

    addChild(child: VhdlScope) {
        this.children.push(child);
        child.parent = this;
    }

}


class ScopeGuesser {

    private currentScope: VhdlScope;
    private scopeAtCursor: VhdlScope;
    private cursorLineNum: number;

    constructor(cursorLineNum: number) {
        this.cursorLineNum = cursorLineNum;
    }

    guess(doc: vscode.TextDocument): VhdlScope {
        this.enterScope(VhdlScopeKind.Vhdl, 0);
        for (var i = 0; i < doc.lineCount; i++) {
            var line = doc.lineAt(i);
            if (!line.isEmptyOrWhitespace) {
                let lineText = line.text;
                if (lineText.match(/^\s*\-\-/)) {
                    continue;
                } else if (lineText.match(ENT_BEGIN)) {
                    this.enterScope(VhdlScopeKind.Entity, i);
                } else if (lineText.match(ARCH_BEGIN)) {
                    this.enterScope(VhdlScopeKind.Architecture, i);
                } else if (lineText.match(CONF_BEGIN)) {
                    this.enterScope(VhdlScopeKind.Configuration, i);
                } else if (lineText.match(SCOPE_END)) {
                    this.exitScope(i);
                }
            }
        }
        this.exitScope(doc.lineCount);
        return this.scopeAtCursor;
    }

    private enterScope(kind: VhdlScopeKind, lineNum: number) {
        let newScope = new VhdlScope(kind, lineNum);
        if (this.currentScope) {
            this.currentScope.addChild(newScope);
        }
        this.currentScope = newScope;
    }

    private exitScope(lineNum: number) {
        this.currentScope.lineTo = lineNum;
        if (!this.scopeAtCursor) {
            if (this.currentScope.lineFrom <= this.cursorLineNum
                    && this.currentScope.lineTo >= this.cursorLineNum) {
                this.scopeAtCursor = this.currentScope;
            }
        }
        if (this.currentScope.parent) {
            this.currentScope = this.currentScope.parent;
        }
    }
    
}
