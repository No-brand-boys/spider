const puppeteer = require('puppeteer');
var fs = require("fs");
var datas = [];
const PAGE_NUM = 3;
(async () => {
    var pageNum = 1;
    var url = 'https://ecp.cgnpc.com.cn/CmsNewsController.do?method=newsList&channelCode=zgh_zhongbgg&parentCode=zgh_cgxx&param=bulletin&rp=20&page=' + pageNum;
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
            path: '21_2.png'
        });

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
                console.log(data);
            } catch (e) {
                console.log(e);
            }
        }
        async function getData(url, i) {
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
                    if (timeNums !== null){
                        let times = [];
                        for (let i = 0; i < 6; i++) {
                            if (typeof (timeNums[i]) !== "undefined") {
                                times[i] = timeNums[i];
                            } else {
                                times[i] = '00';
                            }
                        }
                        return times[0] + '-' + times[1] + '-' + times[2] + ' ' + times[3] + ':' + times[4] + ':' + times[5];
                    }else {
                        return '';
                    }

                }

                let data = {};
                let startTimeStringPattern = /(?<=公示开始时间：)([\s|\S])*(?=公示结束时间：)/;
                let endTimeStringPattern = /(?<=公示结束时间：)([\s])*([\S])*/;
                let purchasing_area_pattern = /(?<=所在地区：)([\S])*(?=一、招标条件本项目)/;
                let purchaser_pattern = /((招[ ]*标[ ]*(人[ ]*|单[ ]*位[ ]*)*)|(联[ ]*系[ ]*方[ ]*法[ ]*)|(采[ ]*购[ ]*(人[ ]*|单[ ]*位[ ]*)*))(联[ ]*系[ ]*方[ ]*式：[ ]*)*(名[ ]*称)*(：)([ ]*)(\S)*(公司|中心|局|部|协会|院|学)/;
                let purchasing_area_str = '';
                let winning_bidder_pattern = /(((中[ ]*标[ ]*)|(成[ ]*交[ ]*))((人[ ]*)|(供[ ]*应[ ]*商[ ]*)))(名[ ]*称[ ]*)*(：)( )*(\S)*([ ])*(公[ ]*司[ ]*)/;
                let body = '';
                let startTimeString = '';
                let endTimeString = '';
                let purchaser = '';
                let winning_bidder = '';
                try {
                    body = $(".frameReport")[0].children[2].innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                } catch (e) {
                    console.log('body error');
                }
                try {
                    startTimeString = startTimeStringPattern.exec(body)[0];
                } catch (e) {
                    console.log('startTimeString error');
                }
                try {
                    endTimeString = endTimeStringPattern.exec(body)[0];
                } catch (e) {
                    console.log('endTimeString error');
                }
                try {
                    purchaser = purchaser_pattern.exec(body)[0];
                } catch (e) {
                    console.log('purchaser error');
                }
                try {
                    winning_bidder = winning_bidder_pattern.exec(body)[0];
                } catch (e) {
                    console.log('winning_bidder error');
                }
                finally {
                    data.type = true;
                    data.bidding_uid = '';
                    //todo 很多中标候选人 跟中标人不一样 就没爬
                    data.winning_bidder = winning_bidder;
                    data.purchaser = purchaser;
                    data.release_time = document.querySelector('.reportTitle').children[1].innerText.split('：')[1];
                    data.title = document.querySelector('.reportTitle h1').innerText;
                    data.body = body;
                    data.source = '中广核';
                    data.source_type = '企业';
                    data.information_type = '中标公告';
                    data.status = 1;
                    data.tender_amount = 0;
                    //todo 有很多页面没有
                    data.tender_acquisition_start_date = parseTimeString(startTimeString);
                    //todo 有很多页面没有
                    data.tender_acquisition_end_date = parseTimeString(endTimeString);
                    //todo 页面没有
                    data.purchasing_area = '';
                    data.region_type_id = '';
                    //todo 页面没有
                    data.qualification_requirements ='' ;
                    return data;
                }
            });
            data.url = url;
            return data;
        }
        pageNum++;
        url = 'https://ecp.cgnpc.com.cn/CmsNewsController.do?method=newsList&channelCode=zgh_zhongbgg&parentCode=zgh_cgxx&param=bulletin&rp=20&page=' + pageNum;
    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("21_2.json", JSON.stringify(datas, null, '\t'), {flag: "w"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();




