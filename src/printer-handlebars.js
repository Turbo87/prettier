"use strict";

// const util = require("./util");
const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
const hardline = docBuilders.hardline;
const line = docBuilders.line;
const softline = docBuilders.softline;
const group = docBuilders.group;
const indent = docBuilders.indent;
// const ifBreak = docBuilders.ifBreak;

// http://w3c.github.io/html/single-page.html#void-elements
const voidTags = {
  area: true,
  base: true,
  br: true,
  col: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
};

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

    case "AttrNode": {
      const value = n.value;

      if (value.type === "TextNode") {
        if (
          value.loc.start.line === value.loc.end.line &&
          value.loc.start.column === value.loc.end.column
        ) {
          return n.name;
        }

        return concat([n.name, '="', value.chars, '"']);
      }

      throw new Error("unsupported handlebars attribute type: " + value.type);
    }

    case "ElementNode": {
      const selfClose = voidTags[n.name] ? ">" : " />";
      const children = printChildren("children", path, print);

      return group(
        concat([
          "<",
          n.tag,
          printAttributes(path, print),
          n.children.length ? ">" : selfClose,
          indent(children),
          n.children.length ? concat([softline, "</", n.tag, ">"]) : hardline
        ])
      );
    }

    case "TextNode": {
      return n.chars.replace(/\s+/g, " ").trim();
    }

    case "MustacheStatement": {
      return group(concat(["{{", path.call(print, "path"), "}}"]));
    }

    case "MustacheCommentStatement": {
      const text = n.value.trim();
      const hasBraces = text.includes("{{") || text.includes("}}");
      const open = hasBraces ? "{{!--" : "{{!";
      const close = hasBraces ? "--}}" : "}}";

      return group(concat([open, line, text, line, close]));
    }

    case "PathExpression": {
      return join(".", n.parts);
    }

    default:
      /* istanbul ignore next */
      throw new Error("unsupported handlebars type: " + n.type);
  }
}

function printAttributes(path, print) {
  const node = path.getValue();

  return concat([
    node.attributes.length ? " " : "",
    indent(join(line, path.map(print, "attributes")))
  ]);
}

function printChildren(childProp, path, print) {
  const children = [];
  path.each(childPath => {
    children.push(childPath.call(print));
  }, childProp);
  return concat(children);
}

module.exports = printPath;
