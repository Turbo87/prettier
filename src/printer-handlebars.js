"use strict";

// const util = require("./util");
const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
// const join = docBuilders.join;
// const hardline = docBuilders.hardline;
const line = docBuilders.line;
// const softline = docBuilders.softline;
const group = docBuilders.group;
// const indent = docBuilders.indent;
// const ifBreak = docBuilders.ifBreak;

function printPath(path, options, print) {
  const n = path.getValue();
  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  switch (n.type) {
    case "Program": {
      return printChildren("body", path, print);
    }

    case "MustacheCommentStatement": {
      const text = n.value.trim();
      const hasBraces = text.includes("{{") || text.includes("}}");
      const open = hasBraces ? "{{!--" : "{{!";
      const close = hasBraces ? "--}}" : "}}";

      return group(concat([open, line, text, line, close]));
    }

    default:
      /* istanbul ignore next */
      throw new Error("unsupported handlebars type: " + n.type);
  }
}

function printChildren(childProp, path, print) {
  const children = [];
  path.each(childPath => {
    children.push(childPath.call(print));
  }, childProp);
  return concat(children);
}

module.exports = printPath;
