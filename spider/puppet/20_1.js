const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];
let PAGE_NUM = 100;
(async () => {
    let pageNum = 90;
    let url = 'http://thzb.crsc.cn/g2586/m5978/mp' + pageNum + '.aspx';
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
            let list = document.querySelectorAll('.second-lb-module-module .second-lb-item');
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
                let bodyWithoutScript = document.querySelector('#Content').innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                let body = document.querySelector('#Content').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let startTimeStringPattern = '';
                let endTimeStringPattern = /((截[ ]*止[ ]*时[ ]*间[ ]*)|(开[ ]*标[ ]*时[ ]*间[ ]*))(\S)*((：)|(为))(\s|\S)*(分)/;
                let purchasing_area_pattern = '';
                let purchaser_pattern = /(?<=招( )*标( )*人：)([\S])*(?=)/;
                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';
                let qualification_requirements = '';

                if (startTimeStringPattern.exec(body) != null)
                    startTimeString = startTimeStringPattern.exec(body)[0];
                if (endTimeString = endTimeStringPattern.exec(body) != null)
                    endTimeString = endTimeStringPattern.exec(body)[0];
                if (purchasing_area_pattern.exec(body) != null)
                    purchasing_area_str = purchasing_area_pattern.exec(body)[0];
                if (purchaser_pattern.exec(body) != null)
                    purchaser = purchaser_pattern.exec(body)[0]

                data.type = false;  //招标是false
                data.bidding_uid = '';
                data.body = bodyWithoutScript;
                data.title = document.querySelector('#Title').innerText;
                data.purchaser = purchaser;
                data.release_time = document.querySelector('#PublishTime').innerText;
                data.source = '中国通号';
                data.source_type = '企业';
                data.status = 1;
                data.tender_amount = 0;
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
        url = 'http://thzb.crsc.cn/g2586/m5978/mp' + pageNum + '.aspx';

    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("20_1.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();




