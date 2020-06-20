const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];
//todo 更改要爬取的总页面数
const PAGE_NUM = 35;
(async () => {
    let pageNum = 30;
    let url = 'https://www.chdtp.com.cn/webs/queryWebZbgg.action?page.currentpage=' + pageNum;
    const browser = await puppeteer.launch();
    let page = await browser.newPage();
    do {
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
            let list = document.querySelector('.wwFormTable tbody').children;
            for (let i = 1; i < list.length; i++) {
                let id = list[i].children[0].querySelector('a').href.match(/\((.+?)\)/g)[0].replace(/[\(|\)|']/g, '');
                let link = 'https://www.chdtp.com.cn/staticPage/' + id;
                links.push(link);
            }
            console.log(links);
            return links;
        });

        console.log(links);

        let releaseTimes = await page.evaluate(() => {
            let list = document.querySelector('.wwFormTable tbody').children;
            let times = [];
            for (let i = 1; i < list.length; i++) {
                let time = list[i].children[1].innerText.replace(/[\[\]]/g, '');
                times.push(time);
            }
            return times;
        });

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
            let data = await detail.evaluate(() => {
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
                let bodyWithoutScript = document.querySelector('.Basic_information').innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                let body = document.querySelector('.Basic_information').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let qualification_requirements_pattern = /(?<=(三、投标人资格要求))(\S|\s)*(?=四、)/;
                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';
                let qualification_requirements = '';
                let tender_amount = 0;

                if (qualification_requirements_pattern.exec(body) != null)
                    qualification_requirements = qualification_requirements_pattern.exec(body)[0];
                if (document.querySelector('a[name="BL_000006_20180511172611"]') != null)
                    startTimeString = document.querySelector('a[name="BL_000006_20180511172611"]').innerText;
                if (document.querySelector('a[name="BL_000155_20180401134245"]') != null)
                    endTimeString = document.querySelector('a[name="BL_000155_20180401134245"]').innerText;
                if (purchaser = document.querySelector('a[name="BL_000001_20180323170055"]') != null)
                    purchaser = document.querySelector('a[name="BL_000001_20180323170055"]').innerText;

                data.type = false;  //招标是false
                data.bidding_uid = '';
                data.body = bodyWithoutScript;
                data.title = document.querySelector('.headline').innerText;
                data.purchaser = purchaser;
                data.source = '华电集团电子商务平台';
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
        url = 'https://www.chdtp.com.cn/webs/queryWebZbgg.action?page.currentpage=' + pageNum;
    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("16_1.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
