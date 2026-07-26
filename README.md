<div align="center">
  <img width="1000" alt="image" src="https://github.com/caido-community/.github/blob/main/content/banner.png?raw=true">

  <br />
  <br />
  <a href="https://github.com/caido-community" target="_blank">Github</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://developer.caido.io/" target="_blank">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://links.caido.io/www-discord" target="_blank">Discord</a>
  <br />
  <hr />
</div>

# Screenshot Mode

Create pretty screenshots of your requests and response right into Caido. No external tools, no pain. Start sharing!

<img width="1435" height="822" alt="Image" src="https://github.com/user-attachments/assets/afb25d54-42fc-4d58-8bca-8778c99b8c17" />

## Themes

The `Theme` setting in the overlay controls how the captured area is rendered:

- **Dark** — matches Caido. This is the default, and existing templates keep it.
- **Light** — white background with dark text and a print-friendly syntax
  palette. Use it for screenshots that end up in a report or a PDF, where dark
  backgrounds waste ink and read poorly.

`Syntax Highlighting` can be turned off independently of the theme, which drops
the request and response to plain text — white on dark, or near-black on white.
Useful when the point of the screenshot is a header or a value rather than the
structure, and the colors are just noise. It does not affect your own highlight
or redaction rules.

Both are part of the settings, so they are saved with a template like any other
option.

## Installation

### From Plugin Store

1. Install via the Caido Plugin Store
2. Navigate to `Replay`, open a tab and click on `Screenshot`
3. Configure your overlay and save the file

### Manual Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Build the plugin:

   ```bash
   pnpm build
   ```

3. Install in Caido:
   - Upload the `dist/plugin_package.zip` file by clicking "Install Package" in Caido's plugin settings
