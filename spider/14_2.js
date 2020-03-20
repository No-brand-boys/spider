const puppeteer = require('puppeteer');
var fs = require("fs");
var datas = [];
const PAGE_NUM = 3;
(async () => {
    var pageNum = 1;
    var url = 'http://www.shenhuabidding.com.cn/bidweb/001/001006/'+pageNum+'.html';
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
            path: '14_1.png'
        });

        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelector('.right-items').children;
            for (let i = 0; i < list.length; i++) {
                let link = list[i].querySelector('a');
                links.push(link.href);
            }
            return links;
        });
        console.log(links);
        for (let i = 0; i < links.length; i++) {
            try {
                let data = await getData(links[i],i);
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
                    if (timeNums !== null){
                        let times = [];
                        for (let i = 0; i < 5; i++) {
                            if (typeof (timeNums[i]) !== "undefined") {
                                times[i] = timeNums[i];
                            } else {
                                times[i] = '00';
                            }
                        }
                        timeStr = times[0] + '-' + times[1] + '-' + times[2] + ' ' + times[3] + ':' + times[4] + ':' + '00';
                        if (!isNaN(new Date(timeStr).getTime())){
                            return timeStr;
                        } else {
                            return '';
                        }
                    }else {
                        return '';
                    }
                }

                //传一个包含
                function parseTenderAmountStr(tenderAmountStr) {
                    let tender_amount = 0;
                    try {
                        if (tenderAmountStr.search('万') === -1) {
                            tender_amount = parseInt(tenderAmountStr.match(/[\d.]+/g)[0]) * 100;
                        } else {
                            tender_amount = parseInt(tenderAmountStr.match(/[\d.]+/g)[0]) * 1000000;
                        }
                    } catch (e) {
                        console.log('parse tender amount error');
                    } finally {
                        return tender_amount;
                    }
                }

                let data = {};
                let body = document.querySelector('.article-info').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let purchaser_pattern =/(?<=受)(\s|\S)*(?=的委托)/;
                let purchaser = '';
                let tender_amount = 0;
                let purchasing_area = '';
                let winning_bidder = '';
                let startTimeString ='';
                let endTimeString ='';
                let  purchasing_area_str='';
                try {
                    let str = tender_amount_pattern.exec(body)[0];
                    tender_amount = parseTenderAmountStr(str);
                } catch (e) {
                    console.log('tender_amount error')
                }
                try {
                    winning_bidder = document.querySelector('table tbody').children[1].children[2].innerText;
                } catch (e) {
                    console.log('winner_bidding error')
                }
                try {
                    purchaser = purchaser_pattern.exec(body)[0];
                } catch (e) {
                    console.log('purchaser error');
                }
                finally {
                    data.type = true;
                    data.bidding_uid = '';
                    data.winning_bidder = winning_bidder;
                    data.purchaser = purchaser;
                    data.title = document.querySelector('strong').innerText;
                    data.body = body;
                    data.source = '国家能源招标网';
                    data.source_type = '企业';
                    data.information_type = '中标公告';
                    data.status = 1;
                    //todo  页面没有字段
                    data.tender_amount = tender_amount;
                    //todo  页面没有字段
                    data.tender_acquisition_start_date = parseTimeString(startTimeString);
                    //todo  页面没有字段
                    data.tender_acquisition_end_date = parseTimeString(endTimeString);
                    //todo  页面没有字段
                    data.purchasing_area = purchasing_area;
                    data.region_type_id = '';
                    //todo  页面没有字段
                    data.qualification_requirements = purchasing_area_str;
                    return data;
                }
            });
            data.url = url;
            return data;
        }
        pageNum++;
        url = 'http://www.shenhuabidding.com.cn/bidweb/001/001006/'+pageNum+'.html';
    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("14_2.json", JSON.stringify(datas, null, '\t'), {flag: "w"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
