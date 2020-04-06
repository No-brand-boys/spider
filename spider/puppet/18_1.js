const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];
const PAGE_NUM = 100;
(async () => {
    let pageNum = 90;
    let url = 'http://www.ccgp-jiangxi.gov.cn/web/jyxx/002006/002006001/' + pageNum + '.html';
    const browser = await puppeteer.launch();
    let page = await browser.newPage();
    do {
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
            let list = document.querySelector('.ewb-infolist ul').children;
            for (let i = 0; i < list.length; i++) {
                let link = list[i].querySelector('a');
                links.push(link.href);
            }
            return links;
        });

        console.log(links);

        for (let i = 0; i < links.length; i++) {
            try {
                let data = await getData(links[i], i);
                datas.push(data);
                console.log(data)
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

                function getTenderAmount() {
                    let index = -1;  //用于定位哪一列是采购金额
                    let allRows = document.querySelector('table tbody').children; //表格所有行
                    let firstRowAllCols = allRows[0].children; //表格 第一行所有列
                    let isTenThousand = false;
                    let isNeedJudge = false;
                    for (let j = 0; j < firstRowAllCols.length; j++) {
                        if (firstRowAllCols[j].innerText.search(/(金额)|(预算)/) !== -1) {
                            index = j;
                            if (firstRowAllCols[j].innerText.search('万') === -1) {
                                isNeedJudge = true;
                            } else {
                                isTenThousand = true;
                            }
                            break;
                        }
                    }
                    if (index !== -1) {
                        let str = allRows[1].children[index].innerText;
                        let num = str.match(/[\d.]+/g)[0];
                        if (!isTenThousand && isNeedJudge) {
                            if (str.search('万') !== -1) {
                                isTenThousand = true;
                            }
                        }
                        if (isTenThousand) {
                            return parseInt(num) * 1000000;
                        } else {
                            return parseInt(num) * 100;
                        }
                    } else {
                        return 0;
                    }
                }
                let data = {};
                let bodyWithoutScript = document.querySelector('.con').innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                let body = document.querySelector('.con').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let purchaser_pattern = /((招 *标 *(人 *|单 *位 *)*)|(联 *系 *方 *法 *)|(采 *购 *(人 *|单 *位 *)*))(联 *系 *方 *式： *)*(名 *称)*(：)( *)(\S)*(公司|中心|局|部|协会|院|学)/;
                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';
                let qualification_requirements = '';
                let tender_amount = 0;
                //有时候是解析错误 就不改了
                try {
                    tender_amount = getTenderAmount();
                } catch (e) {
                    console.log('tender amount error');
                }
               if (purchaser_pattern.exec(body) != null)
                    purchaser = purchaser_pattern.exec(body)[0];

                data.type = false;
                data.bidding_uid = '';
                data.body = bodyWithoutScript;
                data.title = document.querySelector('.article-info h1').innerText;
                data.purchaser = purchaser;
                data.release_time = parseTimeString(document.querySelector('.infotime').innerText);
                data.source = '江西公共资源交易网';
                data.source_type = '企业';
                data.status = 1;
                data.tender_amount = tender_amount;
                data.tender_acquisition_start_date = parseTimeString(startTimeString);
                data.tender_acquisition_end_date = parseTimeString(endTimeString);
                data.purchasing_area = purchasing_area_str;
                data.region_type_id = '';
                data.qualification_requirements = qualification_requirements;
                return data;
            });
            data.url = url;
            return data;
        }

        pageNum++;
        url = 'http://www.ccgp-jiangxi.gov.cn/web/jyxx/002006/002006001/' + pageNum + '.html';
    } while (pageNum < PAGE_NUM) ;

    browser.close();

    fs.writeFile("18_1.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
