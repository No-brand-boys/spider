const puppeteer = require('puppeteer');
var fs = require("fs");
var datas = [];
const PAGE_NUM = 2;
(async () => {
    var pageNum = 1;
    var url = 'http://search.ccgp.gov.cn/bxsearch?searchtype=1&page_index=' + pageNum + '&bidSort=0&buyerName=&projectId=&pinMu=0&bidType=7&dbselect=bidx&kw=&start_time=2020%3A03%3A04&end_time=2020%3A03%3A07&timeType=1&displayZone=&zoneId=&pppStatus=0&agentName=';
    const browser = await puppeteer.launch();
    do {
        let page = await browser.newPage();
        await page.addScriptTag({
            url: "https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"
        });
        page.setDefaultNavigationTimeout(180000);
        page.setDefaultTimeout(180000);
        page.on('console', msg => {
            console.log(msg.text());
        });
        page.on('error', err => {
            console.error(err.text());
        });
        await page.goto(url);
        await page.screenshot({
            path: '19_2.png'
        });

        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelector('.vT-srch-result-list-bid').children;
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
                console.log(data);
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

                let data = {};

                let body = document.querySelector('.vF_detail_main').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let startTimeString = '';
                let endTimeString = '';
                let purchaser = '';
                let winning_bidder = '';
                let purchasing_area = '';
                let tender_amount = 0;
                try {
                    let str = document.querySelector('table tbody').children[7].children[1].innerText.match(/[\d.]+/g);
                    tender_amount = parseInt(str) * 1000000;
                    if (tender_amount === null) {
                        tender_amount = 0;
                    }
                } catch (e) {
                    console.log('tender_amount error')
                }
                try {
                    winning_bidder = document.querySelector('table tbody').children[14].children[1].innerText;
                } catch (e) {
                    console.log('winning_bidder error')
                }
                try {
                    purchasing_area = document.querySelector('table tbody').children[4].children[1].innerText;
                } catch (e) {
                    console.log('purchasing_area error')
                }
                try {
                    startTimeString = '';
                } catch (e) {
                    console.log('startTimeString error');
                }
                try {
                    endTimeString = '';
                } catch (e) {
                    console.log('endTimeString error');
                }
                try {
                    purchaser = document.querySelector('table tbody').children[3].children[1].innerText;
                } catch (e) {
                    console.log('purchaser error');
                }
                finally {
                    data.type = true;
                    data.bidding_uid = '';
                    data.winning_bidder = winning_bidder;
                    data.purchaser = purchaser;
                    data.release_time = parseTimeString(document.querySelector('#pubTime').innerText);
                    data.title = document.querySelector('.vF_detail_header h2').innerText;
                    data.body = body;
                    data.source = '中国政府采购网';
                    data.source_type = '政府';
                    data.information_type = '中标公告';
                    data.status = 1;
                    data.tender_amount = tender_amount;
                    data.tender_acquisition_start_date = parseTimeString(startTimeString);
                    data.tender_acquisition_end_date = parseTimeString(endTimeString);
                    data.purchasing_area = purchasing_area;
                    data.region_type_id = '';
                    data.qualification_requirements = '';
                    return data;
                }
            });
            data.url = url;
            return data;
        }

        pageNum++;
        url = 'http://search.ccgp.gov.cn/bxsearch?searchtype=1&page_index=' + pageNum + '&bidSort=0&buyerName=&projectId=&pinMu=0&bidType=7&dbselect=bidx&kw=&start_time=2020%3A03%3A04&end_time=2020%3A03%3A07&timeType=1&displayZone=&zoneId=&pppStatus=0&agentName=';
    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("19_2.json", JSON.stringify(datas, null, '\t'), {flag: "w"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
