const puppeteer = require('puppeteer');
let fs = require("fs");
let datas = [];
const PAGE_NUM = 100;
(async () => {
    let pageNum = 90;
    let url = 'https://ecp.cgnpc.com.cn/CmsNewsController.do?method=newsList&channelCode=zgh_zhongbgg&parentCode=zgh_cgxx&param=bulletin&rp=20&page=' + pageNum;
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
            let list = document.querySelector('.infoList ul').children;
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
                console.log(data)
            } catch (e) {
                console.log(e);
            }
        }

        async function getData(url) {
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
                let startTimeStringPattern = /(?<=公示开始时间：)([\s|\S])*(?=公示结束时间：)/;
                let endTimeStringPattern = /(?<=公示结束时间：)([\s])*([\S])*/;
                let purchaser_pattern = /((招[ ]*标[ ]*(人[ ]*|单[ ]*位[ ]*)*)|(联[ ]*系[ ]*方[ ]*法[ ]*)|(采[ ]*购[ ]*(人[ ]*|单[ ]*位[ ]*)*))(联[ ]*系[ ]*方[ ]*式：[ ]*)*(名[ ]*称)*(：)([ ]*)(\S)*(公司|中心|局|部|协会|院|学)/;
                let winning_bidder_pattern = /(((中[ ]*标[ ]*)|(成[ ]*交[ ]*))((人[ ]*)|(供[ ]*应[ ]*商[ ]*)))(名[ ]*称[ ]*)*(：)( )*(\S)*([ ])*(公[ ]*司[ ]*)/;
                let body = '';
                let startTimeString = '';
                let endTimeString = '';
                let purchaser = '';
                let winning_bidder = '';

                if (document.querySelector(".frameReport") != null)
                    body = document.querySelector(".frameReport").innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                if (startTimeStringPattern.exec(body) != null)
                    startTimeString = startTimeStringPattern.exec(body)[0];
                if (endTimeStringPattern.exec(body) != null)
                    endTimeString = endTimeStringPattern.exec(body)[0];
                if (purchaser_pattern.exec(body) != null)
                    purchaser = purchaser_pattern.exec(body)[0];
                if (winning_bidder_pattern.exec(body) != null)
                    winning_bidder = winning_bidder_pattern.exec(body)[0];

                data.type = true;
                data.bidding_uid = '';
                data.winning_bidder = winning_bidder;
                data.purchaser = purchaser;
                data.release_time = document.querySelector('.reportTitle').children[1].innerText.split('：')[1];
                data.title = document.querySelector('.reportTitle h1').innerText;
                data.body = bodyWithoutScript;
                data.source = '中广核';
                data.source_type = '企业';
                data.status = 1;
                data.tender_amount = 0;
                data.tender_acquisition_start_date = parseTimeString(startTimeString);
                data.tender_acquisition_end_date = parseTimeString(endTimeString);
                data.purchasing_area = '';
                data.region_type_id = '';
                data.qualification_requirements = '';
                return data;
            });
            data.url = url;
            return data;
        }

        pageNum++;
        url = 'https://ecp.cgnpc.com.cn/CmsNewsController.do?method=newsList&channelCode=zgh_zhongbgg&parentCode=zgh_cgxx&param=bulletin&rp=20&page=' + pageNum;
    } while (pageNum < PAGE_NUM) ;

    browser.close();

    fs.writeFile("21_2.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();




