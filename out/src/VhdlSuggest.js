'use strict';
var vscode = require('vscode');
var vhdlScopeGuesser_1 = require('./vhdlScopeGuesser');
var kwSyntax = createCompletionKeyword('syntax');
var kwPackage = createCompletionKeyword('package');
var kwOption = createCompletionKeyword('option');
var kwImport = createCompletionKeyword('import');
var kwMessage = createCompletionKeyword('message');
var kwEnum = createCompletionKeyword('enum');
var kwReserved = createCompletionKeyword('reserved');
var fileOptions = [
    createCompletionOption('java_package', "\nSets the Java package where classes generated from this .proto will be\nplaced.  By default, the proto package is used, but this is often\ninappropriate because proto packages do not normally start with backwards\ndomain names.\n    "),
    createCompletionOption('java_outer_classname', "\nIf set, all the classes from the .proto file are wrapped in a single\nouter class with the given name.  This applies to both Proto1\n(equivalent to the old \"--one_java_file\" option) and Proto2 (where\na .proto always translates to a single class, but you may want to\nexplicitly choose the class name).\n    "),
    createCompletionOption('java_multiple_files', "\nIf set true, then the Java code generator will generate a separate .java\nfile for each top-level message, enum, and service defined in the .proto\nfile.  Thus, these types will *not* be nested inside the outer class\nnamed by java_outer_classname.  However, the outer class will still be\ngenerated to contain the file's getDescriptor() method as well as any\ntop-level extensions defined in the file.\n    "),
    createCompletionOption('java_generate_equals_and_hash', "\nIf set true, then the Java code generator will generate equals() and\nhashCode() methods for all messages defined in the .proto file.\nThis increases generated code size, potentially substantially for large\nprotos, which may harm a memory-constrained application.\n- In the full runtime this is a speed optimization, as the\nAbstractMessage base class includes reflection-based implementations of\nthese methods.\n- In the lite runtime, setting this option changes the semantics of\nequals() and hashCode() to more closely match those of the full runtime;\nthe generated methods compute their results based on field values rather\nthan object identity. (Implementations should not assume that hashcodes\nwill be consistent across runtimes or versions of the protocol compiler.)\n    "),
    createCompletionOption('java_string_check_utf8', "\nIf set true, then the Java2 code generator will generate code that\nthrows an exception whenever an attempt is made to assign a non-UTF-8\nbyte sequence to a string field.\nMessage reflection will do the same.\nHowever, an extension field still accepts non-UTF-8 byte sequences.\nThis option has no effect on when used with the lite runtime.\n    "),
    createCompletionOption('optimize_for', "\nGenerated classes can be optimized for speed or code size.\n    "),
    createCompletionOption('go_package', "\nSets the Go package where structs generated from this .proto will be\nplaced. If omitted, the Go package will be derived from the following:\n  - The basename of the package import path, if provided.\n  - Otherwise, the package statement in the .proto file, if present.\n  - Otherwise, the basename of the .proto file, without extension.\n    "),
    //createCompletionOption('cc_generic_services'),
    //createCompletionOption('java_generic_services'),
    //createCompletionOption('py_generic_services'),
    createCompletionOption('deprecated', "\nIs this file deprecated?\nDepending on the target platform, this can emit Deprecated annotations\nfor everything in the file, or it will be completely ignored; in the very\nleast, this is a formalization for deprecating files.\n    "),
    createCompletionOption('cc_enable_arenas', "\nEnables the use of arenas for the proto messages in this file. This applies\nonly to generated classes for C++.\n    "),
    createCompletionOption('objc_class_prefix', "\nSets the objective c class prefix which is prepended to all objective c\ngenerated classes from this .proto. There is no default.\n    "),
    createCompletionOption('csharp_namespace', "\nNamespace for generated classes; defaults to the package.\n    "),
];
var msgOptions = [
    createCompletionOption('message_set_wire_format', "\nSet true to use the old proto1 MessageSet wire format for extensions.\nThis is provided for backwards-compatibility with the MessageSet wire\nformat.  You should not use this for any other reason:  It's less\nefficient, has fewer features, and is more complicated.\n    "),
    createCompletionOption('no_standard_descriptor_accessor', "\nDisables the generation of the standard \"descriptor()\" accessor, which can\nconflict with a field of the same name.  This is meant to make migration\nfrom proto1 easier; new code should avoid fields named \"descriptor\".\n    "),
    createCompletionOption('deprecated', "\nIs this message deprecated?\nDepending on the target platform, this can emit Deprecated annotations\nfor the message, or it will be completely ignored; in the very least,\nthis is a formalization for deprecating messages.\n    "),
];
var fieldOptions = [
    //createCompletionOption('ctype', ``),
    createCompletionOption('packed', "\nThe packed option can be enabled for repeated primitive fields to enable\na more efficient representation on the wire. Rather than repeatedly\nwriting the tag and type for each element, the entire array is encoded as\na single length-delimited blob. In proto3, only explicit setting it to\nfalse will avoid using packed encoding.\n    "),
    createCompletionOption('jstype', "\nThe jstype option determines the JavaScript type used for values of the\nfield.  The option is permitted only for 64 bit integral and fixed types\n(int64, uint64, sint64, fixed64, sfixed64).  By default these types are\nrepresented as JavaScript strings.  This avoids loss of precision that can\nhappen when a large value is converted to a floating point JavaScript\nnumbers.  Specifying JS_NUMBER for the jstype causes the generated\nJavaScript code to use the JavaScript \"number\" type instead of strings.\nThis option is an enum to permit additional types to be added,\ne.g. goog.math.Integer.\n    "),
    createCompletionOption('lazy', "\nShould this field be parsed lazily?  Lazy applies only to message-type\nfields.  It means that when the outer message is initially parsed, the\ninner message's contents will not be parsed but instead stored in encoded\nform.  The inner message will actually be parsed when it is first accessed.\n\nThis is only a hint.  Implementations are free to choose whether to use\neager or lazy parsing regardless of the value of this option.  However,\nsetting this option true suggests that the protocol author believes that\nusing lazy parsing on this field is worth the additional bookkeeping\noverhead typically needed to implement it.\n\nThis option does not affect the public interface of any generated code;\nall method signatures remain the same.  Furthermore, thread-safety of the\ninterface is not affected by this option; const methods remain safe to\ncall from multiple threads concurrently, while non-const methods continue\nto require exclusive access.\n\n\nNote that implementations may choose not to check required fields within\na lazy sub-message.  That is, calling IsInitialized() on the outher message\nmay return true even if the inner message has missing required fields.\nThis is necessary because otherwise the inner message would have to be\nparsed in order to perform the check, defeating the purpose of lazy\nparsing.  An implementation which chooses not to check required fields\nmust be consistent about it.  That is, for any particular sub-message, the\nimplementation must either *always* check its required fields, or *never*\ncheck its required fields, regardless of whether or not the message has\nbeen parsed.\n    "),
    createCompletionOption('deprecated', "\nIs this field deprecated?\nDepending on the target platform, this can emit Deprecated annotations\nfor accessors, or it will be completely ignored; in the very least, this\nis a formalization for deprecating fields.\n    "),
];
var fieldDefault = createCompletionOption('default', "");
var enumOptions = [
    createCompletionOption('allow_alias', "\nSet this option to true to allow mapping different tag names to the same\nvalue.\n    "),
    createCompletionOption('deprecated', "\nIs this enum deprecated?\nDepending on the target platform, this can emit Deprecated annotations\nfor the enum, or it will be completely ignored; in the very least, this\nis a formalization for deprecating enums.\n    "),
];
var enumValueOptions = [
    createCompletionOption('deprecated', "\nIs this enum value deprecated?\nDepending on the target platform, this can emit Deprecated annotations\nfor the enum value, or it will be completely ignored; in the very least,\nthis is a formalization for deprecating enum values.\n    "),
];
var serviceOptions = [
    createCompletionOption('deprecated', "\nIs this service deprecated?\nDepending on the target platform, this can emit Deprecated annotations\nfor the service, or it will be completely ignored; in the very least,\nthis is a formalization for deprecating services.\n    "),
];
var fieldRules = [
    createCompletionKeyword('repeated'),
    createCompletionKeyword('required'),
    createCompletionKeyword('optional'),
];
var scalaTypes = [
    createCompletionKeyword('bool', ""),
    createCompletionKeyword('int32', "\nUses variable-length encoding. \nInefficient for encoding negative numbers \u2013 if your field is likely to have \nnegative values, use sint32 instead."),
    createCompletionKeyword('int64', "\nUses variable-length encoding. \nInefficient for encoding negative numbers \u2013 if your field is likely to have \nnegative values, use sint64 instead.    \n    "),
    createCompletionKeyword('uint32', "Uses variable-length encoding."),
    createCompletionKeyword('uint64', "Uses variable-length encoding."),
    createCompletionKeyword('sint32', "\nUses variable-length encoding. \nSigned int value. \nThese more efficiently encode negative numbers than regular int32s.    \n    "),
    createCompletionKeyword('sint64', "\nUses variable-length encoding. \nSigned int value. \nThese more efficiently encode negative numbers than regular int64s.    \n    "),
    createCompletionKeyword('fixed32', "\nAlways four bytes. \nMore efficient than uint32 if values are often greater than 2^28.    \n    "),
    createCompletionKeyword('fixed64', "\nAlways eight bytes. \nMore efficient than uint64 if values are often greater than 2^56.    \n    "),
    createCompletionKeyword('sfixed32', "Always four bytes."),
    createCompletionKeyword('sfixed64', "Always eight bytes."),
    createCompletionKeyword('float', ""),
    createCompletionKeyword('double', ""),
    createCompletionKeyword('string', "\nA string must always contain UTF-8 encoded or 7-bit ASCII text.\n    "),
    createCompletionKeyword('bytes', "\nMay contain any arbitrary sequence of bytes.\n    "),
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
                    if (textBeforeCursor.match(/^\s*\w*$/)) {
                        suggestions.push(kwSyntax);
                        suggestions.push(kwPackage);
                        suggestions.push(kwOption);
                        suggestions.push(kwImport);
                        suggestions.push(kwMessage);
                        suggestions.push(kwEnum);
                    }
                    else if (textBeforeCursor.match(/^\s*option\s+\w*$/)) {
                        suggestions.push.apply(suggestions, fileOptions);
                    }
                    break;
                }
                case vhdlScopeGuesser_1.VhdlScopeKind.Entity: {
                    if (textBeforeCursor.match(/^\s*\w*$/)) {
                        suggestions.push(kwOption);
                        suggestions.push(kwMessage);
                        suggestions.push(kwEnum);
                        suggestions.push(kwReserved);
                        suggestions.push.apply(suggestions, scalaTypes);
                    }
                    else if (textBeforeCursor.match(/(repeated|required|optional)\s*\w*$/)) {
                        suggestions.push.apply(suggestions, scalaTypes);
                    }
                    else if (textBeforeCursor.match(/^\s*option\s+\w*$/)) {
                        suggestions.push.apply(suggestions, msgOptions);
                    }
                    else if (textBeforeCursor.match(/.*\[.*/)) {
                        suggestions.push.apply(suggestions, fieldOptions);
                    }
                    break;
                }
                case vhdlScopeGuesser_1.VhdlScopeKind.Architecture: {
                    if (textBeforeCursor.match(/^\s*\w*$/)) {
                        suggestions.push(kwOption);
                    }
                    else if (textBeforeCursor.match(/^\s*option\s+\w*$/)) {
                        suggestions.push.apply(suggestions, enumOptions);
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