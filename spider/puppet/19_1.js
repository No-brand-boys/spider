const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];

let PAGE_NUM = 100;
(async () => {
    let pageNum = 90;
    let url = 'http://search.ccgp.gov.cn/bxsearch?searchtype=1&page_index=' + pageNum + '&bidSort=0&buyerName=&projectId=&pinMu=0&bidType=1&dbselect=bidx&kw=&start_time=2020%3A03%3A06&end_time=2020%3A03%3A13&timeType=2&displayZone=&zoneId=&pppStatus=0&agentName='
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
                let data = await getData(links[i], i);
                datas.push(data);
                console.log(data);
            } catch (e) {
                console.log(e);
            }
        }

        async function getData(url, i) {
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
                let bodyWithoutScript = document.querySelector('.vF_detail_main').innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                let body = document.querySelector('.vF_detail_main').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');

                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';
                let qualification_requirements = '';
                let tender_amount = 0;

                if (document.querySelector('table tbody tr:nth-child(6) td:nth-child(2)')!=null) {
                    let startTimeAndEndTime = document.querySelector('table tbody tr:nth-child(6) td:nth-child(2)').innerText.split('至');
                    if (startTimeAndEndTime.length>=2) {
                        startTimeString = startTimeAndEndTime[0];
                        endTimeString = startTimeAndEndTime[1];
                    }
                }
                if (document.querySelector('table tbody tr:nth-child(11) td:nth-child(2)') != null) {
                    let str = document.querySelector('table tbody tr:nth-child(11) td:nth-child(2)').innerText.match(/[\d.]+/g);
                    tender_amount = parseInt(str) * 1000000;
                }
                if (document.querySelector('table tbody tr:nth-child(5) td:nth-child(2)') != null)
                    purchasing_area_str = document.querySelector('table tbody tr:nth-child(5) td:nth-child(2)').innerText;
                if (document.querySelector('table tbody tr:nth-child(4) td:nth-child(2)') != null)
                    purchaser = document.querySelector('table tbody tr:nth-child(4) td:nth-child(2)').innerText;

                data.type = false;  //招标是false
                data.bidding_uid = '';
                data.body = bodyWithoutScript;
                data.title = document.querySelector('.vF_detail_header h2').innerText;
                data.purchaser = purchaser;
                data.release_time = parseTimeString(document.querySelector('#pubTime').innerText);
                data.source = '中国政府采购网';
                data.source_type = '政府';
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
        url = 'http://search.ccgp.gov.cn/bxsearch?searchtype=1&page_index=' + pageNum + '&bidSort=0&buyerName=&projectId=&pinMu=0&bidType=1&dbselect=bidx&kw=&start_time=2020%3A03%3A04&end_time=2020%3A03%3A07&timeType=1&displayZone=&zoneId=&pppStatus=0&agentName='
    } while (pageNum < PAGE_NUM) ;

    browser.close();

    fs.writeFile("19_1.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
