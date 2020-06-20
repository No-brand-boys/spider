const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];
const PAGE_NUM = 80;
(async () => {
    let pageNum = 70;
    let url = 'http://thzb.crsc.cn/g2625/m6044/mp' + pageNum + '.aspx';
    const browser = await puppeteer.launch();

    do {
        let page = await browser.newPage();
        page.setDefaultNavigationTimeout(180000);
        page.setDefaultTimeout(180000);
        page.on('console', msg => {
            console.log(msg.text());
        });
        page.on('error', err => {
            console.error(err.text());
        });
        await page.goto(url);

        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelectorAll('.second-lb-module-module .second-lb-item');
            for (let i = 0; i < list.length; i++) {
                let link = list[i].querySelector('a');
                links.push(link.href);
            }
            return links;
        });
        console.log(links);
        for (let i = 0; i < links.length; i++) {
            try {
                let data = await getData(links[i]);
                datas.push(data);
                console.log(data)
            } catch (e) {
                console.log(e);
            }
        }

        async function getData(url, i) {
            let detail = await browser.newPage();
            await detail.goto(url);
            detail.on('console', msg => {
                console.log(msg.text());
            });
            detail.on('error', err => {
                console.error(err.text());
            });
            let data = await detail.evaluate(() => {
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
                let bodyWithoutScript = document.querySelector('#Content').innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                let body = document.querySelector('#Content').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let startTimeString = '';
                let endTimeString = '';
                let purchaser = '';
                let winning_bidder = '';

                data.type = true;
                data.bidding_uid = '';
                data.winning_bidder = winning_bidder;
                data.purchaser = purchaser;
                data.release_time = document.querySelector('#PublishTime').innerText;
                data.title = document.querySelector('#Title').innerText;
                data.body = bodyWithoutScript;
                data.source = '中国通号';
                data.source_type = '企业';
                data.status = 1;
                data.tender_amount = 0;
                data.tender_acquisition_start_date = startTimeString;
                data.tender_acquisition_end_date = endTimeString;
                data.purchasing_area = '';
                data.region_type_id = '';
                data.qualification_requirements = '';
                return data;
            });

            data.url = url;
            return data;
        }

        pageNum++;
        url = 'http://thzb.crsc.cn/g2625/m6044/mp' + pageNum + '.aspx';

    } while (pageNum < PAGE_NUM) ;

    browser.close();

    fs.writeFile("20_2.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();




