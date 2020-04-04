const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];
//todo 更改要爬取的总页面数
const PAGE_NUM = 100;
(async () => {
    let pageNum = 95;
    const browser = await puppeteer.launch();
    let url = 'https://dzzb.ciesco.com.cn/gg/ggList?currentPage=' + pageNum;
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
            let list = [];
            try {
                list = document.querySelector('table tbody').children
            } catch (e) {

            }
            for (let i = 2; i < list.length; i++) {
                try {
                    let link = list[i].children[2].querySelector('a');
                    links.push(link.href);
                } catch (e) {
                    console.log('link error')
                }
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
                let bodyWithoutScript = document.querySelector('html').innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                let body = document.querySelector('.template').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';
                let qualification_requirements = '';
                let tender_amount = 0;
                let release_time = '';

                if (document.querySelector('.template-one table tbody tr:nth-child(5) td:nth-child(2)') != null)
                    release_time = parseTimeString(document.querySelector('.template-one table tbody tr:nth-child(5) td:nth-child(2)').innerText);
                if (document.querySelector('.template-three table tbody tr:last-child td') != null)
                    qualification_requirements = document.querySelector('.template-three table tbody tr:last-child td').innerHTML.replace(/<[^>]+>/g, "");
                if (document.querySelector('.template-five table tbody tr:nth-child(2) td') != null)
                    startTimeString = document.querySelector('.template-five table tbody tr:nth-child(2) td').innerText;
                if (document.querySelector('.template-five table tbody tr:nth-child(2) td:nth-child(4)') != null)
                    endTimeString = document.querySelector('.template-five table tbody tr:nth-child(2) td:nth-child(4)').innerText;
                if (document.querySelector('.template-two table tbody tr td') != null)
                    purchaser = document.querySelector('.template-two table tbody tr td').innerText;

                data.type = false;  //招标是false'
                data.bidding_uid = '';
                data.body = bodyWithoutScript;
                data.title = document.querySelector('.title').innerText;
                data.purchaser = purchaser;
                data.release_time = release_time;
                data.source = '招商局';
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
        url = 'https://dzzb.ciesco.com.cn/gg/ggList?currentPage=' + pageNum;
    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("15_1.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
