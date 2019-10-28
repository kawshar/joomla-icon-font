import serialize from "serialize-javascript";
export default ({ markup, helmet, initialData  }) => {
	return `<!doctype html>
        <html ${helmet.htmlAttributes.toString()}>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            ${helmet.title.toString()}
            ${helmet.meta.toString()}
            ${helmet.link.toString()}
            <link rel="stylesheet" href="/icofont/icofont.min.css"/>
            <link rel="stylesheet" href="/css/all.min.css"/>
            <link rel="icon" type="image/x-icon" href="/images/favicon.png">
            <script>window.___INITIAL_STATE__ = ${serialize(initialData)}</script>
        </head>
        
        <body ${helmet.bodyAttributes.toString()}>
            <div id="root">${markup}</div>
        <script src="/bundle.js" defer></script>
        </body>
        </html>`
}
