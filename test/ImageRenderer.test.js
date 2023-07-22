const fs = require('fs/promises');
const puppeteer = require("puppeteer");
const express = require('express')

test("renderToBase64Png generates correct base64 encoded PNG image", async () => {
    /**
     * 
     * This is a very simply test to see if the red square (define by styled <div>) is rendered correctly
     * Some caveats:
     * -- The test has to be simple to account for rendering differences between browsers in different environments (e.g. between dev and CI environments)
     * -- Check PNG output (in base64 or any respresentation) is probably not a good idea. It works here but, even with visually identical images, PNG may encode them differently or the encoder may add additional data
     * 
     */
    const expectedBase64PngOutput = await fs.readFile('test/assets/render-to-base64-png/expected-data-url-output.txt', { encoding: 'utf8' });

    const browser = await puppeteer.launch({"headless": "new"});

    const ex = express();
    ex.use(express.static('test/assets'));
    ex.use(express.static('dist'));

    const port = 3736;
    const testServer = ex.listen(port);

    try {
        const page = await browser.newPage();
        await page.goto(`http://localhost:${port}/render-to-base64-png`);

        let snapshotContainer = await page.$("#snapshotContainer img");
        let snapshotContainerValue = await snapshotContainer.evaluate((el) => el.getAttribute("src"));

        expect(snapshotContainerValue).toEqual(expectedBase64PngOutput);

    } finally {
        await browser.close();
        testServer.close();
    }
}, 120000);
