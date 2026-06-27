# Extract Highlights to Note

Creates a clean note containing only the highlighted passages (`==...==`) of the active note.

Designed to distill a long note — for example a video transcript fetched with the *YouTube transcript fetcher* — down to just its highlights, ready for further work.

## Features

- Extracts every `==highlighted==` passage from the active note into a brand-new, clean note.
- Adds a highlighter icon to the ribbon, plus a command in the command palette.
- Works on **mobile, desktop, and remote desktop** (`isDesktopOnly: false`).

## Usage

1. Open a note that contains `==highlighted==` passages.
2. Run the command **Extract Highlights to Note** (command palette) or click the **highlighter icon** in the ribbon.
3. A new note is created containing only the highlighted passages.

## Settings

- **Keep timestamps** — preserve timestamps found alongside highlights (useful for video transcripts).
- **Delete the original note** — remove the source note after extraction.
- **Destination folder** — choose where the extracted note is created.

## Installation

### From the Community Plugins browser

1. Open **Settings → Community plugins → Browse**.
2. Search for **Extract Highlights to Note**.
3. Click **Install**, then **Enable**.

### Manual installation

1. Download `manifest.json` and `main.js` from the latest [release](https://github.com/DevidCode/obsidian-extract-highlights/releases).
2. Copy them into `<your-vault>/.obsidian/plugins/extract-highlights/`.
3. Reload Obsidian and enable the plugin in **Settings → Community plugins**.

## License

[MIT](LICENSE)
