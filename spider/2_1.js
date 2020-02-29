const puppeteer = require('puppeteer');

(async () => {
    // console.log(puppeteer);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(180000);
    page.setDefaultTimeout(180000);

    page.on('console', msg => {
        console.log(msg);
    });

    page.on('error', err => {
        console.error(err);
    });

    page.on('load', () => {
        console.log('-------------------------------');
        console.log('page loaded');
    });

    let url = 'http://bid.norincogroup-ebuy.com/retrieve.do';

    await page.goto(url);
    await page.screenshot({path: 'main.png'});

    await page.evaluate(() => {
        let list = document.querySelector('form>div:last-child>div:first-child>div:first-child');
        console.log(list.innerText);
    });

    browser.close();
})();
