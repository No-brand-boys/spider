const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];
const PAGE_NUM = 1;
(async () => {
    let pageNum = 15;
    let url = 'https://ecp.cgnpc.com.cn/CmsNewsController.do?method=newsList&channelCode=zgh_zbgg&parentCode=zgh_cgxx&param=bulletin&rp=20&page=' + pageNum;
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
        await page.goto(url);
        console.log(url);
        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelector('.infoList ul').children;
            for (let i = 0; i < list.length; i++) {
                let link = list[i].querySelector('a');
                links.push(link.href);
            }
            console.log(links);
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
                let bodyWithoutScript = document.querySelector('.frameReport').innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                let body = document.querySelector('.frameReport').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let startTimeStringPattern = /([ ]*开[ ]*始[ ]*时[ ]*间[ ]*)(：)(\s|\S)*(；)/;
                let endTimeStringPattern = /((截[ ]*止[ ]*时[ ]*间[ ]*)|(开[ ]*标[ ]*时[ ]*间[ ]*))(\S)*((：)|(为))(\s|\S)*(分)/;
                let qualification_requirements_pattern = /(?<=资格要求)([\s|\S])*(?=四)/;
                let purchasing_area_pattern = /(?<=所在地区：)([\S])*(?=一、招标条件本项目)/;
                let purchaser_pattern = /((招[ ]*标[ ]*(人[ ]*|单[ ]*位[ ]*)*)|(采[ ]*购[ ]*(人[ ]*|单[ ]*位[ ]*)*))(联[ ]*系[ ]*方[ ]*式：[ ]*)*(名[ ]*称[ ]*)*(：[ ]*)([ ]*)(\S)*(公司|中心|局|部|协会|院|学)/;
                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';

                if (startTimeStringPattern.exec(body)!=null)
                    startTimeString = startTimeStringPattern.exec(body)[0];
                if (endTimeStringPattern.exec(body) != null)
                    endTimeString = endTimeStringPattern.exec(body)[0];
                if (purchasing_area_pattern.exec(body) != null)
                    purchasing_area_str = purchasing_area_pattern.exec(body)[0];
                if (purchaser_pattern.exec(body) != null)
                    purchaser = purchaser_pattern.exec(body)[0]

                data.type = false;  //招标是false
                data.bidding_uid = '';
                data.body = bodyWithoutScript;
                data.title = document.querySelector('.reportTitle h1').innerText;
                data.purchaser = purchaser;
                data.release_time = document.querySelector('.reportTitle .publishTime').innerText.split('：')[1];
                data.source = '中广核';
                data.source_type = '企业';
                data.status = 1;
                data.tender_amount = 0;
                data.tender_acquisition_start_date = parseTimeString(startTimeString);
                data.tender_acquisition_end_date = parseTimeString(endTimeString);
                data.purchasing_area = purchasing_area_str;
                data.region_type_id = '';
                data.qualification_requirements = qualification_requirements_pattern.exec(body)[0];
                return data;
            });
            data.url = url;
            return data;
        }

        pageNum++;
        url = 'https://ecp.cgnpc.com.cn/CmsNewsController.do?method=newsList&channelCode=zgh_zbgg&parentCode=zgh_cgxx&param=bulletin&rp=20&page=' + pageNum;

    } while (pageNum < PAGE_NUM) ;

    browser.close();

    fs.writeFile("21_1.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();




