const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(180000);
    page.setDefaultTimeout(180000);

    page.on('console', msg => {
        console.log(msg.text());
    });

    page.on('error', err => {
        console.error(err.text());
    });

    let url = 'http://www.bidding.csg.cn/zbgg/index.jhtml';

    await page.goto(url);

    let links = await page.evaluate(() => {
        let links = [];
        let list = document.querySelector('div.List2>ul').children;
        for (let i = 0; i < list.length; i++) {
            let link =  list[i].lastElementChild;
            // console.log(link.href);
            links.push(link.href);
        }
        return links;
    });

    // todo 改成links的长度
    for (let i = 0; i < 1; i++) {
        // let bid = new Bid();
        let data = await getData(links[i]);
        console.log(data);
    }

    async function getData(url) {
        let detail = await browser.newPage();
        await detail.goto(url);
        // await page.screenshot({path: 'page.png'});

        let data =  await detail.evaluate(() => {
            let data = {};
            let content = document.querySelector('div.s-content');
            data.title = content.children[0].innerHTML;
            data.tender_acquisition_start_date = content.children[1].innerHTML;
            let text = content.querySelector("div.Section0");
            return data;
        });
        return data;
    }

    browser.close();

})();
