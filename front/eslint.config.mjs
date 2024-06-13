/* eslint-disable import/no-anonymous-default-export */
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import stylisticJs from '@stylistic/eslint-plugin-js'

export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  pluginReactConfig,
  stylisticJs.configs["all-extends"],
  {plugins: {
    '@stylistic/js': stylisticJs
  },
  rules: {
    'indent': ['error', 2],
    '@stylistic/js/indent': ['error', 2],
  }}
];