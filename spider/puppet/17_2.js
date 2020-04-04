const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];
//todo 更改要爬取的总页面数
const PAGE_NUM = 20;
(async () => {
    let pageNum = 10;
    let url = 'https://www.dongfengtc.com/gg/zbjgList?currentPage=' + pageNum;
    const browser = await puppeteer.launch();
    let page = await browser.newPage();
    do {
        await page.goto(url);
        page.setDefaultNavigationTimeout(180000);
        page.setDefaultTimeout(180000);
        page.on('console', msg => {
            console.log(msg.text());
        });
        page.on('error', err => {
            console.error(err.text());
        });

        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelector('table tbody').children;
            for (let i = 1; i < list.length; i++) {
                let link = list[i].children[2].querySelector('a');
                links.push(link.href);
            }
            return links;
        });
        let releaseTimes = await page.evaluate(() => {
            let times = [];
            let list = document.querySelector('table tbody').children;
            for (let i = 1; i < list.length; i++) {
                let time = list[i].children[4].innerText;
                times.push(time);
            }
            return times;
        });

        console.log(links);
        for (let i = 0; i < links.length; i++) {
            try {
                let data = await getData(links[i]);
                data.release_time = releaseTimes[i];
                datas.push(data);
                console.log(data);
            } catch (e) {
                console.log(e);
            }
        }

        async function getData(url) {
            let detail = await browser.newPage();
            detail.on('console', msg => {
                console.log(msg.text());
            });
            detail.on('error', err => {
                console.error(err.text());
            });
            await detail.goto(url);

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

                function parseTenderAmountStr(tenderAmountStr) {
                    let tender_amount = 0;
                    try {
                        if (tenderAmountStr.search('万') === -1) {
                            tender_amount = parseInt(tenderAmountStr.match(/[\d.]+/g)[0]) * 100;
                        } else {
                            tender_amount = parseInt(tenderAmountStr.match(/[\d.]+/g)[0]) * 1000000;
                        }
                    } catch (e) {
                        console.log('parse tender amount error');
                    } finally {
                        return tender_amount;
                    }
                }

                let data = {};
                let bodyWithoutScript = document.querySelector('.text').innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                let body = document.querySelector('.text').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let purchaser_pattern = /((招 *标 *人)|(采 *购 *人))(联 *系 *方 *式： *)*(名[ ]*称)*(：)( *)([^(公 *司 *)(中 *心 *)])*(公 *司 *|中 *心 *)/;
                let winning_bidder_pattern = /(((中 *标 *)|(成 *交 *))((人 *)|(供 *应 *商 *)))(名 *称 *)*(：)*( )*([^公 *司 *])*(公 *司 *)/;
                let tender_amount_pattern = /(((中 *标 *)|(成 *交 *))([(价)(金额)]*)(：)( )*(\S)*(元))/;
                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';
                let tender_amount = 0;
                let purchasing_area = '';
                let winning_bidder = '';

                if (tender_amount_pattern.exec(body) != null) {
                    let str = tender_amount_pattern.exec(body)[0];
                    tender_amount = parseTenderAmountStr(str);
                }
                if (winning_bidder_pattern.exec(body) != null) {
                    winning_bidder = winning_bidder_pattern.exec(body)[0];
                    if (winning_bidder.length > 32) {
                        winning_bidder = '';
                    }
                }
                if (purchaser_pattern.exec(body) != null){
                    purchaser = purchaser_pattern.exec(body)[0];
                    if (purchaser.length > 32) {
                        purchaser = '';
                    }
                }

                data.type = true;
                data.bidding_uid = '';
                data.winning_bidder = winning_bidder;
                data.purchaser = purchaser;
                data.title = document.querySelector('.zhuti').innerText;
                data.body = bodyWithoutScript;
                data.source = '东风交易中心';
                data.source_type = '企业';
                data.status = 1;
                data.tender_amount = tender_amount;
                data.tender_acquisition_start_date = parseTimeString(startTimeString);
                data.tender_acquisition_end_date = parseTimeString(endTimeString);
                data.purchasing_area = purchasing_area;
                data.region_type_id = '';
                data.qualification_requirements = purchasing_area_str;
                return data;
            });
            data.url = url;
            return data;
        }

        pageNum++;
        url = 'https://www.dongfengtc.com/gg/zbjgList?currentPage=' + pageNum;

    } while (pageNum < PAGE_NUM) ;

    browser.close();

    fs.writeFile("17_2.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
