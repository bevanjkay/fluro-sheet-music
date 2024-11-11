// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt()
  .prepend({
    rules: {
    //   '@stylistic/semi': ['error', 'always'],
    //   '@stylistic/quotes': ['error', 'double'],
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  });
