module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'postcss-where-to-is-and-prefix',
    Once(root, { result }) {
      root.walkRules((rule) => {
        rule.selector = rule.selector.replace(/\:where\(([^)]*)\)/g, ':is($1)');
        if (rule.selector.match(/\:is\([^)]*\)/)) {
          rule.selector = rule.selector + ", " +
            rule.selector.replace(/\:is\(([^)]*)\)/g, ':-moz-any($1)') + ", " + 
            rule.selector.replace(/\:is\(([^)]*)\)/g, ':-webkit-any($1)')
        }
      });
    }
  }
};

module.exports.postcss = true;