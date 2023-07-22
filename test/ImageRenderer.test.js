const fs = require('fs/promises');
const puppeteer = require("puppeteer");
const express = require('express')

test("renderToBase64Png generates correct base64 encoded PNG image", async () => {
    const expectedBase64PngOutput = await fs.readFile('test/assets/render-to-base64-png/expected-data-url-output.txt', { encoding: 'utf8' });

    const browser = await puppeteer.launch({"headless": "new"});

    const ex = express();
    ex.use(express.static('test/assets'));
    ex.use(express.static('dist'));

    const port = 3736;
    const testServer = ex.listen(port, () => { });

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
