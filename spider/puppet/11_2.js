//http://www.ccgp-guizhou.gov.cn/list-1153531755759540.html?siteId=1
//http://www.ccgp-guizhou.gov.cn/article-search.html?siteId=1&articlePageSize=15&category.id=1153531755759540&articlePageNo=1 爬取页面
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.url().endsWith('.gif') )//|| interceptedRequest.url().endsWith('.js')
            interceptedRequest.abort();
        else
            interceptedRequest.continue();
    });

    page.setDefaultNavigationTimeout(180000);
    page.setDefaultTimeout(180000);

    /*page.on('console', msg => {
        console.log(msg.text());
    });

    page.on('error', err => {
        console.error(err.text());
    });*/

    page.on('load', () => {
        console.log("\n-------------------------------");
        console.log('page loaded\t此网站加载慢请耐心等待\n');
    });

    let json_data =[];//数据存储部分
    let file = '.\\11-1.json';
    //页数429
    for(let i=1; i<=427; i++) {
        let url = 'http://www.ccgp-guizhou.gov.cn/article-search.html?siteId=1&articlePageSize=15&category.id=1153531755759540&articlePageNo='+i;
        await page.goto(url);
        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelectorAll('.xnrx>ul>li>a');
            for (let i = 0; i < list.length; i++) {
                let link = list[i].href;
                //console.log(link);
                links.push(link);
            }
            return links;
        });
        //links.length
        for (let i = 0; i < links.length; i++) {
            let data = await getData(links[i]);
            console.log(data.url);
            json_data.push(data);
        }

        async function getData(url) {
            let detail = await browser.newPage();
            await detail.setRequestInterception(true);
            detail.on('request', interceptedRequest => {
                if (interceptedRequest.url().endsWith('.gif') )//|| interceptedRequest.url().endsWith('.js')
                    interceptedRequest.abort();
                else
                    interceptedRequest.continue();
            });
            await detail.goto(url);
            //await page.screenshot({path: '11_2.png'});截图检查

            let data = await detail.evaluate(() => {
                let data = {};
                let regExp1 = /\d{4}[-/]\d{2}[-/]\d{2}/;
                let regExp2 =/(招标|采购|项目)编号[：:][^)\n]+/;
                let regExp4 = /(招标人为|采购人名称: |招标人:|招 标 人:|采购单位:)[\u4e00-\u9fa5]+/;
                let regExp6 = /(?<=1\t)\S+/;
                let body = document.querySelector('#info');
                let content = body.innerText;
                let date = document.querySelector('.you>div>div').lastElementChild.innerText;
                try{
                    data.source = '合信招标网';
                    data.source_type = '政府';
                    data.purchasing_area = '贵州';
                    data.status = 1;
                    data.type = false;
                    data.title = document.querySelector('h3').innerText;
                    data.release_time = date.match(regExp1)[0];
                    data.body = body.innerHTML;
                    data.bidding_uid = content.match(regExp2)[0];
                    data.puchaser = content.match(regExp4)[0];
                    data.tender_amount = document.querySelector('#turnoverAmount').innerText;
                    data.winning_bidder = document.querySelector('.bidm').innerText.split('\t')[1];
                }catch (e) {
                    data.winning_bidder = content.match(regExp6)[0];
                }
                return data;
            });
            data.url = url;
            return data;
        }
    }

    browser.close();
    fs.writeFile(file, JSON.stringify(json_data, null, '\t'), function (err) {
        if (err)
            console.info("fail " + err);
        else
            console.info("写入文件ok!");
    });
})();
