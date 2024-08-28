module.exports = {
  printWidth: 250,
  htmlWhitespaceSensitivity: 'ignore',
  bracketSameLine: true,
  plugins: ["prettier-plugin-tailwindcss","prettier-plugin-go-template"],
  tailwindConfig: "./tailwind.config.js",
  overrides: [
    {
      "files": ["*.html"],
      "options": {
        "parser": "go-template",
      },
    },
  ],
};
