"use strict";

function parse(text /*, parsers, opts */) {
  // Inline the require to avoid loading all the JS if we don't use it
  const glimmer = require("@glimmer/syntax");

  return glimmer.preprocess(text);
}

module.exports = parse;
