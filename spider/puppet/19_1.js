const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];

(async () => {
    let pageNum = 1;
    let url = 'http://search.ccgp.gov.cn/bxsearch?searchtype=1&page_index=' + pageNum + '&bidSort=0&buyerName=&projectId=&pinMu=0&bidType=1&dbselect=bidx&kw=&start_time=2020%3A03%3A04&end_time=2020%3A03%3A07&timeType=1&displayZone=&zoneId=&pppStatus=0&agentName='
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
            path: '20_1.png'
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
            await detail.screenshot({
                path: i + '.png'
            });
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
                let body = document.querySelector('.vF_detail_main').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let qualification_requirements_pattern = /(?<=资格要求)([\S|\s])*(?=3.)/;
                let startTimeAndEndTime = document.querySelector('table tbody').children[5].children[1].innerText.split('至');
                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';
                let qualification_requirements = '';
                let tender_amount = 0;
                try {
                    let str = document.querySelector('table tbody').children[10].children[1].innerText.match(/[\d.]+/g)
                    tender_amount = parseInt(str) * 1000000;
                } catch (e) {
                    console.log('tender amount error');
                }
                try {
                    startTimeString = startTimeAndEndTime[0];
                } catch (e) {
                    console.log('startTime error');
                }
                try {
                    endTimeString = startTimeAndEndTime[1];
                } catch (e) {
                    console.log('endTime error');
                }
                try {
                    purchasing_area_str = document.querySelector('table tbody').children[4].children[1].innerText;
                } catch (e) {
                    console.log('purchasing_area_str error');
                }
                try {
                    purchaser = document.querySelector('table tbody').children[3].children[1].innerText
                } catch (e) {
                    console.log('purchaser error');
                }
                finally {
                    data.type = false;  //招标是false
                    data.bidding_type = '';
                    data.bidding_uid = '';
                    data.body = body;
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
                }
            });
            data.url = url;
            return data;
        }

        pageNum++;
        url = 'http://search.ccgp.gov.cn/bxsearch?searchtype=1&page_index=' + pageNum + '&bidSort=0&buyerName=&projectId=&pinMu=0&bidType=1&dbselect=bidx&kw=&start_time=2020%3A03%3A04&end_time=2020%3A03%3A07&timeType=1&displayZone=&zoneId=&pppStatus=0&agentName='
    } while (pageNum < 2) ;
    browser.close();
    fs.writeFile("19_1.json", JSON.stringify(datas, null, '\t'), {flag: "w"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
