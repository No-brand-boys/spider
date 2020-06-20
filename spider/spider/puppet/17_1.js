const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];
//todo 更改要爬取的总页面数
const PAGE_NUM = 100;
let pageNum = 90;  //当前页面
(async () => {
    let url = 'https://www.dongfengtc.com/gg/ggList?currentPage=' + pageNum;
    const browser = await puppeteer.launch();
    do {
        let page = await browser.newPage();
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

        console.log(links);

        let releaseTimes = await page.evaluate(() => {
            let times = [];
            let list = document.querySelector('table tbody').children;
            for (let i = 1; i < list.length; i++) {
                let time = list[i].children[4].innerText;
                times.push(time);
            }
            return times;
        });

        for (let i = 0; i < links.length; i++) {
            try {
                let data = await getData(links[i]);
                data.release_time = releaseTimes[i];
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

                let data = {};
                let bodyWithoutScript = document.querySelector('.text').innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                let body = document.querySelector('.text').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let qualification_requirements_pattern = /(投 *标 *人 *)*(资 *格 *)(要 *求 *)(：)*(\s|\S)*(\*五)/;
                let purchaser_pattern = /((招 *标 *(人 *|单位 *)*)|(采 *购 *(人 *|单位 *)*))(联 *系 *方 *式： *)*(名 *称)*(：)( *)(\S)*(公司|中心|局|部|协会|院|学)/;
                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';
                let qualification_requirements = '';
                let tender_amount = 0;

                if (qualification_requirements_pattern.exec(body) != null)
                    qualification_requirements = qualification_requirements_pattern.exec(body)[0];
                if (document.querySelector('table tbody tr:nth-child(2) td:nth-child(4)') != null)
                    startTimeString = document.querySelector('table tbody tr:nth-child(2) td:nth-child(4)').innerText;
                if (document.querySelector('table tbody tr:nth-child(2) td:nth-child(5)') != null)
                    endTimeString = document.querySelector('table tbody tr:nth-child(2) td:nth-child(5)').innerText;
                if (purchaser_pattern.exec(body) != null)
                    purchaser = purchaser_pattern.exec(body)[0];

                data.type = false;  //招标是false
                data.bidding_uid = '';
                data.body = bodyWithoutScript;
                data.title = document.querySelector('.zhuti').innerText;
                data.purchaser = purchaser;
                data.source = '东风交易中心';
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
        url = 'https://www.dongfengtc.com/gg/ggList?currentPage=' + pageNum;
    } while (pageNum < PAGE_NUM);

    browser.close();
    fs.writeFile("17_1.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();





