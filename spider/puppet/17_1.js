const puppeteer = require('puppeteer');
var fs = require("fs");
var datas = [];
//todo 更改要爬取的总页面数
const PAGE_NUM = 5;

(async () => {
    var pageNum = 1;
    var url = 'https://www.dongfengtc.com/gg/ggList';
    const browser = await puppeteer.launch();
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

    await page.addScriptTag({
        url: "https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"
    });

    do {
        await page.screenshot({
            path: pageNum + '.png'
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

                let data = {};
                let body = document.querySelector('.text').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let qualification_requirements_pattern = /(投[ ]*标[ ]*人[ ]*)*(资[ ]*格[ ]*)(要[ ]*求[ ]*)(：)*(\s|\S)*((\*五)|(4\.))/;
                let purchaser_pattern = /((招[ ]*标[ ]*(人[ ]*|单位[ ]*)*)|(采[ ]*购[ ]*(人[ ]*|单位[ ]*)*))(联[ ]*系[ ]*方[ ]*式：[ ]*)*(名[ ]*称)*(：)([ ]*)(\S)*(公司|中心|局|部|协会|院|学)/;
                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';
                let qualification_requirements = '';
                let tender_amount = 0;
                try {
                    qualification_requirements = qualification_requirements_pattern.exec(body)[0];
                } catch (e) {
                    console.log('qualification_requirements error');
                }
                try {
                    startTimeString = document.querySelector('table tbody').children[1].children[3].innerText;
                } catch (e) {
                    console.log('startTime error');
                }
                try {
                    endTimeString = document.querySelector('table tbody').children[1].children[4].innerText;
                } catch (e) {
                    console.log('endTime error');
                }
                try {
                    purchasing_area_str = '';
                } catch (e) {
                    console.log('purchasing_area_str error');
                }
                try {
                    purchaser = purchaser_pattern.exec(body)[0];
                } catch (e) {
                    console.log('purchaser error');
                }
                data.type = false;  //招标是false
                data.bidding_type = '';
                data.bidding_uid = '';
                data.body = body;
                data.title = document.querySelector('.zhuti').innerText;
                data.purchaser = purchaser;
                /*data.release_time = parseTimeString(document.querySelector('.infotime').innerText);*/
                data.source = '东风交易中心';
                data.source_type = '企业';
                data.status = 1;
                data.tender_amount = tender_amount;
                data.tender_acquisition_start_date = parseTimeString(startTimeString);
                data.tender_acquisition_end_date = parseTimeString(endTimeString);
                //todo 页面没有明显字段
                data.purchasing_area = purchasing_area_str;
                data.region_type_id = '';
                data.qualification_requirements = qualification_requirements;
                return data;
            });
            data.url = url;
            return data;
        }

        await page.click('.next-ye');
        pageNum++;
    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("17_1.json", JSON.stringify(datas, null, '\t'), {flag: "w"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
