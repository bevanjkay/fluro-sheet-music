// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt()
  .append({
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "vue/multi-word-component-names": "off",
    },
  });
