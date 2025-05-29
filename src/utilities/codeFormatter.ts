// ../utilities/codeFormatter.ts
import * as prettierStandalone from "prettier/standalone"; // Import runtime from standalone

// Import types from the main 'prettier' package
import type {
  BuiltInParserName,
  Plugin as PrettierPlugin,
  Options as PrettierOptions,
} from "prettier";

// Import necessary Prettier plugins.
// The .js extension might be needed for ESM compatibility with some bundlers like Vite.
import prettierPluginBabel from "prettier/plugins/babel.js"; // For JavaScript/JSX
import prettierPluginEstree from "prettier/plugins/estree.js"; // Core JS features, used by many parsers
import prettierPluginHtml from "prettier/plugins/html.js"; // For HTML
import prettierPluginTypeScript from "prettier/plugins/typescript.js"; // For TypeScript/TSX
import prettierPluginMarkdown from "prettier/plugins/markdown.js"; // For Markdown
import prettierPluginYaml from "prettier/plugins/yaml.js"; // For YAML
import prettierPluginPostcss from "prettier/plugins/postcss.js"; // For CSS/SCSS/Less

export async function formatCodeWithPrettier(
  codeString: string = "",
  language: string,
): Promise<string> {
  console.log(`[codeFormatter (standalone)] Called. Language: "${language}".`);
  let parser: BuiltInParserName | string | undefined = undefined;
  // Start with estree as it's fundamental for many JS-like syntaxes.
  const plugins: PrettierPlugin[] = [prettierPluginEstree];

  switch (language.toLowerCase()) {
    case "json":
      parser = "json";
      // For JSON with standalone, relying on 'estree' (already included)
      // and the 'json' parser name is often sufficient.
      // Explicitly adding babel here might be causing the 'languages' issue in some standalone contexts.
      // If 'json' parser alone with estree doesn't work, then standalone has issues resolving it.
      break;
    case "javascript":
    case "jsx":
      parser = "babel"; // 'babel' parser implies JS/JSX features
      plugins.push(prettierPluginBabel); // Babel plugin provides the 'babel' parser
      break;
    case "typescript":
    case "tsx":
      parser = "typescript";
      plugins.push(prettierPluginTypeScript); // TypeScript plugin
      plugins.push(prettierPluginBabel); // Babel can be complementary for TSX or broader JS features
      break;
    case "markdown":
    case "md":
      parser = "markdown";
      plugins.push(prettierPluginMarkdown);
      break;
    case "yaml":
    case "yml":
      parser = "yaml";
      plugins.push(prettierPluginYaml);
      break;
    case "html":
      parser = "html";
      plugins.push(prettierPluginHtml);
      break;
    case "css":
      parser = "css";
      plugins.push(prettierPluginPostcss);
      break;
    case "scss":
      parser = "scss";
      plugins.push(prettierPluginPostcss);
      break;
    case "less":
      parser = "less";
      plugins.push(prettierPluginPostcss);
      break;
    default:
      console.warn(
        `[codeFormatter (standalone)] Language "${language}" not configured. Returning original code.`,
      );
      return codeString;
  }

  try {
    const options: PrettierOptions = {
      parser: parser as BuiltInParserName,
      plugins: plugins, // Pass the determined plugins
      semi: true,
      singleQuote: false,
      tabWidth: 2,
      printWidth: 100,
      trailingComma: "es5",
    };
    const formattedCode = await prettierStandalone.format(codeString, options);
    console.log(
      `[codeFormatter (standalone)] Formatting successful for "${language}".`,
    );
    return formattedCode;
  } catch (error) {
    console.error(
      `[codeFormatter (standalone)] Error formatting code for language "${language}":`,
      error,
    );
    return codeString;
  }
}
