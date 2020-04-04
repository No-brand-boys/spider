const puppeteer = require('puppeteer');
var fs = require("fs");
var datas = [];
var PAGE_NUM = 17;
(async () => {
    let pageNum = 1;
    const browser = await puppeteer.launch();
    let page = await browser.newPage();
    page.setDefaultNavigationTimeout(180000);
    page.setDefaultTimeout(180000);
    page.on('console', msg => {
        console.log(msg.text());
    });

    page.on('error', err => {
        console.error(err.text());
    });
    let url = 'http://bidding.ceiec.com.cn/zbgs/index.jhtml';

    do {
        await page.goto(url);
        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelector('.bidlist ul').children;
            for (let i = 0; i < list.length; i++) {
                let link = list[i].querySelector('a');
                links.push(link.href);
            }
            return links;
        });

        for (let i = 0; i < links.length; i++) {
            let data = await getData(links[i]);
            datas.push(data);
            console.log(data);
        }

        async function getData(link) {
            let detail = await browser.newPage();

            await detail.goto(link);
            let data = await detail.evaluate((url) => {
                function parseTimeString(timeString) {
                    let timeNums = timeString.match(/(\d)+/g);
                    let timeStr = '';
                    if (timeNums !== null) {
                        let times = [];
                        for (let i = 0; i < 5; i++) {
                            if (typeof (timeNums[i]) !== "undefined") {
                                times[i] = timeNums[i];
                            } else {
                                times[i] = '00';
                            }
                        }
                        timeStr = times[0] + '-' + times[1] + '-' + times[2] + ' ' + times[3] + ':' + times[4] + ':' + '00';
                        if (!isNaN(new Date(timeStr).getTime())) {
                            return timeStr;
                        } else {
                            return '';
                        }
                    } else {
                        return '';
                    }
                }
                let data = {};
                let bodyWithoutScript = document.querySelector('html').innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                let body = document.querySelector('.main-text').innerText;
                let purchaser_pattern = /(?<=招标人名称：)(\S)*/;
                let winning_bidder_pattern = /(?<=中标候选人排名如下：)(\S|\s)*(?=联系机构：)/;
                let purchaser = '';
                let tender_amount = 0;
                let winning_bidder = '';
                if (winning_bidder_pattern.exec(body)!=null){
                    winning_bidder = winning_bidder_pattern.exec(body)[0];
                }
                if (purchaser_pattern.exec(body)!=null) {
                    purchaser = purchaser_pattern.exec(body)[0];
                }
                data.type = true;
                data.bidding_uid = '';
                data.winning_bidder = winning_bidder;
                data.purchaser = purchaser;
                data.title = document.querySelector('.article-title').innerText;
                data.release_time = parseTimeString(document.querySelector('.article-author').innerText);
                data.body = bodyWithoutScript;
                data.source = '中国电子进出口有限公司招标采购网';
                data.source_type = '企业';
                data.status = 1;
                data.tender_amount = tender_amount;
                data.tender_acquisition_start_date = '';
                data.tender_acquisition_end_date = '';
                data.purchasing_area = '';
                data.region_type_id = '';
                data.qualification_requirements = '';
                return data;
            });
            data.url = link;
            return data;
        }
        pageNum++;
        url = 'http://bidding.ceiec.com.cn/zbgs/index_' + pageNum + '.jhtml'
    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("3_2.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();




