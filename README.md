# foreign-html-renderer

A library to render HTML to images using the SVG \<foreignObject\> element. 

The process is detailed in [this blog post](https://semisignal.com/rendering-web-content-to-image-with-svg-foreign-object/).

No dependencies

## Installation
`npm install foreign-html-renderer`

foreign-html-renderer is an ES module.

However, dist/foreign-html-renderer.min.js is not, this file will create a global `ForeignHtmlRenderer` object. This will likely change in the near future as ESM support is now more widespread.

## Usage

### Creating a renderer
```javascript
const renderer = new ForeignHtmlRenderer.ImageRenderer(document.styleSheets);
```

Note that the constructor takes a `StyleSheetList` argument for style sheets with styles used by the HTML elements to be rendered. To use the style sheets in the current document simply pass `document.styleSheets`.

### Rendering
There are 3 rendering methods, all with the same signature:

```javascript
const markup = `<p>Hello World</p>`;
const width = 200;
const height = 100;

renderer.renderToBase64Png(markup, width, height);
renderer.renderToCanvas(markup, width, height);
renderer.renderToImage(markup, width, height);
```

Each method returns a `Promise` which resolves as follows:

- `renderToBase64Png()` resolves to a `String`; a data URL with the PNG image data
- `renderToCanvas()` resolves to an `HTMLCanvasElement`
- `renderToImage()` resolves to an `Image`

## Things to keep in mind

### CORS
As with most browser components, \<foreignObject\> will restrict cross-origin HTTP requests unless [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) headers are sent by the server.


