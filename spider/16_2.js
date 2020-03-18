//只爬了一页 其他的后面的都是过期的 什么都没有 只有标题
const puppeteer = require('puppeteer');
var fs = require("fs");
var datas = [];
//todo 更改要爬取的总页面数
const PAGE_NUM = 1;
(async () => {
    var pageNum = 1;
    var url = 'https://www.chdtp.com.cn/webs/displayNewZbhxrgsZxzxAction.action?page.currentpage='+pageNum;
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
        await page.addScriptTag({
            url: "https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"
        });

        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelector('.wwFormTable tbody').children;
            for (let i = 1; i < list.length-1; i++) {
                try {
                    let strs = list[i].querySelector('a').href.match(/(?<=\()(.+?)(?=\))/g)[0].split(',');
                    let id = strs[0].replace(/'/g,'');
                    let num = strs[1].replace(/'/g,'');
                    let link = 'https://www.chdtp.com.cn/webs/detailNewZbhxrgsZxzxAction.action?chkedId='+id+'&cminid='+num;
                    links.push(link);
                }catch(e){

                }
            }
            console.log(links);
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
        async function getData(url) {
            let detail = await browser.newPage();
            detail.on('console', msg => {
                console.log(msg.text());
            });
            detail.on('error', err => {
                console.error(err.text());
            });
            await detail.addScriptTag({
                url: "https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"
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
                let body = document.querySelector('.Basic_information').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let qualification_requirements_pattern = '';
                let purchaser_pattern = /((招[ ]*标[ ]*人)|(采[ ]*购[ ]*人))(联[ ]*系[ ]*方[ ]*式：[ ]*)*(名[ ]*称)*(：)([ ]*)(\S)*(公司|中心)/;
                let winning_bidder_pattern = /(?<=一、评标情况)(\s|\S)*(?=二、提出异议的渠道和方式)/;
                let tender_amount_pattern = '';
                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';
                let qualification_requirements = '';
                let tender_amount = 0;
                let purchasing_area = '';
                let winning_bidder = '';
                try {
                    winning_bidder = winning_bidder_pattern.exec(body)[0];
                } catch (e) {
                    console.log('winner_bidding error')
                }
                try {
                    startTimeString = '';
                } catch (e) {
                    console.log('startTime error');
                }
                try {
                    endTimeString = $('a[name="GSENDTIME"]')[0].innerText;
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
                finally {
                    data.type = true;
                    data.bidding_uid = '';
                    data.winning_bidder = winning_bidder;
                    data.purchaser = purchaser;
                    data.title = document.querySelector('.headline').innerText;
                    data.body = body;
                    data.source = '华电集团电子商务平台';
                    data.source_type = '企业';
                    data.information_type = '中标公告';
                    data.status = 1;
                    data.tender_amount = tender_amount;
                    //todo  页面没有字段
                    data.tender_acquisition_start_date ='';
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
        url = 'https://www.dongfengtc.com/gg/zbjgList?currentPage=' + pageNum;
    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("16_2.json", JSON.stringify(datas, null, '\t'), {flag: "a"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
