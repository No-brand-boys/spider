const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];
const PAGE_NUM = 100;
(async () => {
    let pageNum = 90;
    let url = 'http://www.ccgp-jiangxi.gov.cn/web/jyxx/002006/002006004/' + pageNum + '.html';
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
                let data = await getData(links[i]);
                datas.push(data);
                console.log(data)
            } catch (e) {
                console.log(e);
            }
        }

        async function getData(url) {
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
                    if (timeNums !== null) {
                        let times = [];
                        for (let i = 0; i < 6; i++) {
                            if (typeof (timeNums[i]) !== "undefined") {
                                times[i] = timeNums[i];
                            } else {
                                times[i] = '00';
                            }
                        }
                        return times[0] + '-' + times[1] + '-' + times[2] + ' ' + times[3] + ':' + times[4] + ':' + times[5];
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
                        if (firstRowAllCols[j].innerText.search(/(金额)|(总价)/) !== -1) {
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

                function getWinnerBidder() {
                    let index = -1;  //用于定位哪一列是中标人
                    let allRows = document.querySelector('table tbody').children; //表格所有行
                    let firstRowAllCols = allRows[0].children; //表格 第一行所有列
                    for (let j = 0; j < firstRowAllCols.length; j++) {
                        if (firstRowAllCols[j].innerText.search(/((成[ ]*交[ ]*)|(中[ ]*标[ ]*))((供[ ]*应[ ]*商[ ]*)|(人[ ]*)|(单[ ]*位[ ]*))((名[ ]*称[ ]*)|(全[ ]*称[ ]*))*/) !== -1) {
                            index = j;
                            console.log('bidder列' + index);
                            break;
                        }
                    }
                    if (index !== -1) {
                        let str = allRows[1].children[index].innerText;
                        return str;
                    } else {
                        return '';
                    }
                }

                let data = {};
                let bodyWithoutScript = document.querySelector('.con').innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                let body = document.querySelector('.con').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let purchaser = '';
                let winning_bidder = '';
                let purchasing_area = '';
                let tender_amount = 0;

                try {
                    winning_bidder = getWinnerBidder();
                } catch (e) {
                    console.log('winning_bidder error')
                }

                data.type = true;
                data.bidding_uid = '';
                data.winning_bidder = winning_bidder;
                data.purchaser = purchaser;
                data.title = document.querySelector('.article-info h1').innerText;
                data.release_time = parseTimeString(document.querySelector('.infotime').innerText);
                data.body = bodyWithoutScript;
                data.source = '江西公共资源交易网';
                data.source_type = '企业';
                data.status = 1;
                data.tender_amount = tender_amount;
                data.tender_acquisition_start_date = '';
                data.tender_acquisition_end_date = '';
                data.purchasing_area = purchasing_area;
                data.region_type_id = '';
                data.qualification_requirements = '';
                return data;
            });
            data.url = url;
            return data;
        }

        pageNum++;
        url = 'http://www.ccgp-jiangxi.gov.cn/web/jyxx/002006/002006004/' + pageNum + '.html';

    } while (pageNum < PAGE_NUM) ;

    browser.close();

    fs.writeFile("18_2.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
