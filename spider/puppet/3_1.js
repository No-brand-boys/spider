const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];
let PAGE_NUM = 30;
(async () => {
    let pageNum =1;
    let url = 'http://bidding.ceiec.com.cn/zbgg/index_' + pageNum + '.jhtml';
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
        console.log("当前页面" + url);
        await page.goto(url);

        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelector('.bidlist ul').children;
            for (let i = 0; i < list.length; i++) {
                let link = list[i].querySelector('a');
                links.push(link.href);
            }
            return links;
        });

        for (let i = 0; i < links.length; i++) {
            let data = await getData(links[i]);
            datas.push(data);
            console.log(data);
        }

        async function getData(url) {
            let detail = await browser.newPage();
            await detail.goto(url);
            let data = await detail.evaluate((url) => {
                function parseTimeString(timeString) {
                    let timeNums = timeString.match(/(\d)+/g);
                    let timeStr = '';
                    if (timeNums !== null) {
                        let times = [];
                        for (let i = 0; i < 5; i++) {
                            if (typeof (timeNums[i]) !== 'undefined') {
                                times[i] = timeNums[i];
                            } else {
                                times[i] = '00';
                            }
                        }
                        timeStr = times[0] + '-' + times[1] + '-' + times[2] + ' ' + times[3] + ':' + times[4] + ':' + '00';
                        console.log('timeStr' + timeStr);
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
                let body = document.querySelector('.main-text').innerText;
                let purchaser = '';
                let end_time = '';
                let start_time = '';
                let qualification_requirements = '';
                let qualification_requirements_pattern = /(?<=六、投标人资格要求)(\S|\s)*(?=招标人：)/;
                let purchaser_pattern = /((招[ ]*标[ ]*(人[ ]*|单位[ ]*)*)|(采[ ]*购[ ]*(人[ ]*|单位[ ]*)*))(联[ ]*系[ ]*方[ ]*式：[ ]*)*(名[ ]*称)*(：)([ ]*)(\S)*(司|中心|局|协会|院|学)/;
                let end_time_pattern = /(?<=3、投标截止时间：)(\S)*(?=（北京)/;
                let start_time_pattern = /(?<=招标文件时间、地点(\s)*1、)(\S|\s)*(?=日至)/;
                if (qualification_requirements_pattern.exec(body)!=null){
                    qualification_requirements = qualification_requirements_pattern.exec(body)[0];
                }
                if (start_time_pattern.exec(body)!=null) {
                    start_time = start_time_pattern.exec(body)[0];
                }
                if (end_time_pattern.exec(body)!=null) {
                    start_time = start_time_pattern.exec(body)[0];
                }
                if (purchaser_pattern.exec(body)!=null) {
                    purchaser = purchaser_pattern.exec(body)[0];
                }
                data.type = false;      //招标是false
                data.bidding_uid = '';
                data.body = bodyWithoutScript;
                data.title = document.querySelector('.article-title').innerText;
                data.purchaser = purchaser;
                data.release_time = parseTimeString(document.querySelector('.article-author').innerText);
                data.source = '中国电子进出口有限公司招标采购网';
                data.source_type = '企业';
                data.status = 1;
                data.tender_amount = 0;
                data.tender_acquisition_start_date = parseTimeString(start_time);
                data.tender_acquisition_end_date = parseTimeString(end_time);
                data.purchasing_area = '';
                data.region_type_id = '';
                data.qualification_requirements = qualification_requirements;
                return data;
            });
            data.url = url;
            return data;
        }
        pageNum++;
        url = 'http://bidding.ceiec.com.cn/zbgg/index_' + pageNum + '.jhtml'
    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("3_1.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();




