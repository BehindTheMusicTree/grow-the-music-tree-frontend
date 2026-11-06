import { globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

const config = [
  globalIgnores([".claude/**"]),
  ...nextCoreWebVitals,
  {
    rules: {
      "import/no-anonymous-default-export": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-children-prop": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/use-memo": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // The section frame (padding, title, border) comes from PanelSection in @behindthemusictree/ui.
      // gtv-info-panel-* classes belong to genre-tree-view's tree content; genre-tree-view 8.0.0 dropped
      // the section rule and silently unstyled every host section that relied on it.
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/gtv-info-panel/], TemplateElement[value.raw=/gtv-info-panel/]",
          message: "Build panel sections with PanelSection from @behindthemusictree/ui, not gtv-info-panel-* classes.",
        },
      ],
    },
  },
];

export default config;
