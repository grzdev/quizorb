# @cedrugs/pdf-parse

**Pure JavaScript, cross-platform PDF text & metadata extraction.**  
A maintained fork of [`pdf-parse`](https://www.npmjs.com/package/pdf-parse) with **bundled TypeScript types**, **ESM-friendly default export**, and **Node 18+** support.

[![npm](https://img.shields.io/npm/v/%40cedrugs%2Fpdf-parse.svg)](https://www.npmjs.com/package/@cedrugs/pdf-parse)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

---

## Why this fork?

- **Types included** — ships `index.d.ts` (no need for `@types/pdf-parse`).
- **ESM & CJS friendly** — default import works out of the box.
- **Same API** as upstream for drop-in replacement.
- **Node 18+** minimum for modern runtimes.

> If you want to keep your existing `import pdf from "pdf-parse"` usage, see the **Install (alias)** section.

---

## Installation

### Option A — Use this scoped package directly
```bash
npm i @cedrugs/pdf-parse
# or
pnpm add @cedrugs/pdf-parse
# or
yarn add @cedrugs/pdf-parse
````

### Option B — Keep the old import name via npm alias

```bash
npm i pdf-parse@npm:@cedrugs/pdf-parse
```

Now `import pdf from "pdf-parse"` continues to work, but resolves to this fork.

---

## Basic Usage — Local Files

### CommonJS

```js
const fs = require('fs');
const pdf = require('@cedrugs/pdf-parse'); // or 'pdf-parse' if using the alias

const dataBuffer = fs.readFileSync('path/to/file.pdf');

pdf(dataBuffer).then((data) => {
    // number of pages
    console.log(data.numpages);
    // number of rendered pages
    console.log(data.numrender);
    // PDF info
    console.log(data.info);
    // PDF metadata
    console.log(data.metadata);
    // PDF.js version
    // see https://mozilla.github.io/pdf.js/getting_started/
    console.log(data.version);
    // PDF text
    console.log(data.text);
});
```

### ESM / TypeScript

```ts
import pdf from '@cedrugs/pdf-parse'; // default export supported
import { readFileSync } from 'node:fs';

const buf = readFileSync('path/to/file.pdf');
const data = await pdf(buf);

console.log(data.text);
```

---

## Basic Usage — HTTP

You can use packages like [`crawler-request`](https://www.npmjs.com/package/crawler-request) which integrate with `pdf-parse`.

---

## Exception Handling

```js
const fs = require('fs');
const pdf = require('@cedrugs/pdf-parse');

const buf = fs.readFileSync('path/to/file.pdf');

pdf(buf)
    .then((data) => {
        // use data
    })
    .catch((err) => {
        // handle exceptions
        console.error(err);
    });
```

---

## TypeScript

This fork bundles its own `.d.ts`. No external `@types/pdf-parse` needed.

```ts
import pdf from '@cedrugs/pdf-parse';

const res = await pdf(Buffer.from('...'));
res.text;       // string
res.numpages;   // number
res.version;    // "default" | "v1.9.426" | "v1.10.100" | "v1.10.88" | "v2.0.550"
```

---

## Options

```js
const DEFAULT_OPTIONS = {
    // internal page parser callback
    // set this if you need a custom output format instead of raw text
    pagerender: render_page,

    // max page number to parse (<= 0 means “all pages”)
    max: 0,

    // see https://mozilla.github.io/pdf.js/getting_started/
    version: 'v1.10.100'
};
```

### `pagerender` (callback)

Customize how each page is rendered/extracted if you need structured output beyond plain text.

### `max` (number)

Maximum number of pages to parse. Use `0` or a negative value to parse all pages.

### `version` (string, pdf.js version)

* `'default'`
* `'v1.9.426'`
* `'v1.10.100'`
* `'v1.10.88'`
* `'v2.0.550'`

> Default version is `v1.10.100`. See the [pdf.js getting started guide](https://mozilla.github.io/pdf.js/getting_started/).

---

## Extend — Custom `pagerender`

```js
function render_page(pageData) {
    // see https://mozilla.github.io/pdf.js/
    const render_options = {
        // replace all whitespace with standard spaces (0x20)
        normalizeWhitespace: false,
        // do not attempt to combine cedrugse-line TextItems
        disableCombineTextItems: false
    };

    return pageData.getTextContent(render_options).then((textContent) => {
        let lastY;
        let text = '';
        for (const item of textContent.items) {
            if (lastY === item.transform[5] || !lastY) {
                text += item.str;
            } else {
                text += '\n' + item.str;
            }
            lastY = item.transform[5];
        }
        return text;
    });
}

const options = { pagerender: render_page };
const dataBuffer = require('fs').readFileSync('path/to/file.pdf');

require('@cedrugs/pdf-parse')(dataBuffer, options).then((data) => {
    // use custom-formatted output
});
```

---

## Similar Packages

* [pdf2json](https://www.npmjs.com/package/pdf2json)
* [j-pdfjson](https://www.npmjs.com/package/j-pdfjson)
* [pdf-parser](https://github.com/dunso/pdf-parse)
* [pdfreader](https://www.npmjs.com/package/pdfreader)
* [pdf-extract](https://www.npmjs.com/package/pdf-extract)

*(Different trade-offs: dependencies, maintenance, platform support, and output formats.)*

---

## Tests

* `npm test` (runs `mocha`)
* See the `test` directory in upstream for usage ideas; contributions adding tests here are welcome.

---

## Support / Issues

* **Issues:** open on GitHub → [https://github.com/Cedrugs/pdf-parse/issues](https://github.com/Cedrugs/pdf-parse/issues)
* **Discussions/PRs:** welcome!

---

## License

[MIT](LICENSE)

### Acknowledgements

This project builds on the excellent work of the original [`pdf-parse`](https://www.npmjs.com/package/pdf-parse) and the PDF.js team.