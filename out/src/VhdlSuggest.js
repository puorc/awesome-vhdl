'use strict';
var vscode = require('vscode');
var vhdlScopeGuesser_1 = require('./vhdlScopeGuesser');
var kwLibrary = createCompletionKeyword('library');
var kwUse = createCompletionKeyword('use');
var kwPackage = createCompletionKeyword('package');
var kwArchitecture = createCompletionKeyword('architecture');
var kwEntity = createCompletionKeyword('entity');
var kwConfiguration = createCompletionKeyword('configuration');
var kwIs = createCompletionKeyword('is');
var kwBegin = createCompletionKeyword('begin');
var kwEnd = createCompletionKeyword('end');
var kwMap = createCompletionKeyword('map');
var operatorOptions = [
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
var archTypeOptions = [
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
var portTypeOptions = [
    createCompletionOption('in'),
    createCompletionOption('out'),
    createCompletionOption('inout'),
    createCompletionOption('buffer'),
    createCompletionOption('linkage'),
];
var entityOptions = [
    createCompletionOption('generic'),
    createCompletionOption('port'),
];
var scalaTypes = [
    createCompletionKeyword('bit', "The bit data type can only have the value 0 or 1."),
    createCompletionKeyword('bit_vector', "\nThe bit_vector data type is the vector version of the bit type consisting of two or more bits. Each bit in a bit_vector can only have the value 0 or 1."),
    createCompletionKeyword('boolean', "\nTrue or false  \n    "),
    createCompletionKeyword('integer', "32-bit\tintegers."),
    createCompletionKeyword('natural', "non\tnegative integer."),
    createCompletionKeyword('positive', "positive\tinteger."),
    createCompletionKeyword('real', "\nfloating point number. \n    "),
    createCompletionKeyword('time', "\nTime in fs,\tps,\tns,\tus,\tms,\tsec, min, hr  \n    "),
    createCompletionKeyword('character', ""),
    createCompletionKeyword('string', "\nString for VHDL.  \n    "),
    createCompletionOption('downto'),
    createCompletionOption('severity'),
];
function createCompletionKeyword(label, doc) {
    var item = new vscode.CompletionItem(label);
    item.kind = vscode.CompletionItemKind.Keyword;
    if (doc) {
        item.documentation = doc;
    }
    return item;
}
function createCompletionOption(option, doc) {
    var item = new vscode.CompletionItem(option);
    item.kind = vscode.CompletionItemKind.Value;
    item.documentation = doc;
    return item;
}
var Proto3CompletionItemProvider = (function () {
    function Proto3CompletionItemProvider() {
    }
    Proto3CompletionItemProvider.prototype.provideCompletionItems = function (document, position, token) {
        return new Promise(function (resolve, reject) {
            var filename = document.fileName;
            var lineText = document.lineAt(position.line).text;
            if (lineText.match(/^\s*\-\-/)) {
                return resolve([]);
            }
            var inString = false;
            if ((lineText.substring(0, position.character).match(/\"/g) || []).length % 2 === 1) {
                inString = true;
            }
            var suggestions = [];
            var textBeforeCursor = lineText.substring(0, position.character - 1);
            var scope = vhdlScopeGuesser_1.guessScope(document, position.line);
            //console.log(scope.syntax);
            //console.log(textBeforeCursor);
            switch (scope.kind) {
                case vhdlScopeGuesser_1.VhdlScopeKind.Vhdl: {
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
                case vhdlScopeGuesser_1.VhdlScopeKind.Entity: {
                    suggestions.push.apply(suggestions, entityOptions);
                    suggestions.push.apply(suggestions, scalaTypes);
                    suggestions.push.apply(suggestions, portTypeOptions);
                    suggestions.push(kwBegin);
                    suggestions.push(kwEnd);
                    suggestions.push(kwIs);
                    break;
                }
                case vhdlScopeGuesser_1.VhdlScopeKind.Architecture: {
                    if (textBeforeCursor.match(/^\s*\w*$/)) {
                    }
                    else if (textBeforeCursor.match(/^\s*option\s+\w*$/)) {
                    }
                    break;
                }
            }
            return resolve(suggestions);
        });
    };
    return Proto3CompletionItemProvider;
}());
exports.Proto3CompletionItemProvider = Proto3CompletionItemProvider;
//# sourceMappingURL=VhdlSuggest.js.map