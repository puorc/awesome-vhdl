'use strict';
var ENT_BEGIN = /\s*entity\s+(\w*)\s+is.*/;
var ARCH_BEGIN = /\s*architecture\s+(\w*)\s+of\s+(\w*)\s+is.*/;
var CONF_BEGIN = /\s*configuration\s+(\w*)\s+of\s+(\w*)\s+is.*/;
var SCOPE_END = /\s*end\s+(\w*).*/;
function guessScope(doc, cursorLineNum) {
    return new ScopeGuesser(cursorLineNum).guess(doc);
}
exports.guessScope = guessScope;
(function (VhdlScopeKind) {
    VhdlScopeKind[VhdlScopeKind["Vhdl"] = 0] = "Vhdl";
    VhdlScopeKind[VhdlScopeKind["Entity"] = 1] = "Entity";
    VhdlScopeKind[VhdlScopeKind["Architecture"] = 2] = "Architecture";
    VhdlScopeKind[VhdlScopeKind["Configuration"] = 3] = "Configuration";
})(exports.VhdlScopeKind || (exports.VhdlScopeKind = {}));
var VhdlScopeKind = exports.VhdlScopeKind;
var VhdlScope = (function () {
    function VhdlScope(kind, lineFrom) {
        this.kind = kind;
        this.children = [];
        this.lineFrom = lineFrom;
    }
    VhdlScope.prototype.addChild = function (child) {
        this.children.push(child);
        child.parent = this;
    };
    return VhdlScope;
}());
exports.VhdlScope = VhdlScope;
var ScopeGuesser = (function () {
    function ScopeGuesser(cursorLineNum) {
        this.cursorLineNum = cursorLineNum;
    }
    ScopeGuesser.prototype.guess = function (doc) {
        this.enterScope(VhdlScopeKind.Vhdl, 0);
        for (var i = 0; i < doc.lineCount; i++) {
            var line = doc.lineAt(i);
            if (!line.isEmptyOrWhitespace) {
                var lineText = line.text;
                if (lineText.match(/^\s*\-\-/)) {
                    continue;
                }
                else if (lineText.match(ENT_BEGIN)) {
                    this.enterScope(VhdlScopeKind.Entity, i);
                }
                else if (lineText.match(ARCH_BEGIN)) {
                    this.enterScope(VhdlScopeKind.Architecture, i);
                }
                else if (lineText.match(CONF_BEGIN)) {
                    this.enterScope(VhdlScopeKind.Configuration, i);
                }
                else if (lineText.match(SCOPE_END)) {
                    this.exitScope(i);
                }
            }
        }
        this.exitScope(doc.lineCount);
        return this.scopeAtCursor;
    };
    ScopeGuesser.prototype.enterScope = function (kind, lineNum) {
        var newScope = new VhdlScope(kind, lineNum);
        if (this.currentScope) {
            this.currentScope.addChild(newScope);
        }
        this.currentScope = newScope;
    };
    ScopeGuesser.prototype.exitScope = function (lineNum) {
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
    };
    return ScopeGuesser;
}());
//# sourceMappingURL=vhdlScopeGuesser.js.map