const puppeteer = require('puppeteer');
var fs = require("fs");
var datas = [];
const PAGE_NUM = 2;
(async () => {
    var pageNum = 1;
    var url = 'http://thzb.crsc.cn/g2625/m6044/mp'+pageNum+'.aspx';
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
                let startTimeStringPattern = / /;
                let endTimeStringPattern = / /;
                let body = document.querySelector('#Content').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let startTimeString = '';
                let endTimeString = '';
                let purchaser = '';
                let winning_bidder = '';
                let purchasing_area = '';
                try {
                    let winners =[];
                    let trs = document.querySelector('table tbody').children;
                    let firstRow = trs[0];
                    let index = -1;
                    let  cols = firstRow.children;
                    for (let j = 0; j <cols.length ; j++) {
                        if (cols[j].innerHTML.search('中标候选人')!==-1) {
                            index= j;
                            break;
                        }
                    }
                    console.log(index);
                    if (index!==-1) {
                        for (let j = 1; j < trs.length; j++) {
                            console.log(trs[j].children[index].innerText.match(/[\u4e00-\u9fa5]/g).join(''));
                            winners.push(trs[j].children[index].innerText.match(/[\u4e00-\u9fa5]/g).join('')) ;
                        }
                        for (let j = 0; j < winners.length; j++) {
                            winning_bidder += winners[j] +' '
                        }
                    }
                }catch (e) {
                    console.log('winner_bidder error');
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
                    purchaser = $("#Content p").eq(-2)[0].innerText;
                } catch (e) {
                    console.log('purchaser error');
                }
                finally {
                    data.type = true;
                    data.bidding_uid = '';
                    //todo 部分会爬不到 展示不一样
                    data.winning_bidder = winning_bidder;
                    //todo 基本爬的到
                    data.purchaser = purchaser;
                    data.release_time = document.querySelector('#PublishTime').innerText;
                    data.title = document.querySelector('#Title').innerText;
                    data.body = body;
                    data.source = '中国通号';
                    data.source_type = '企业';
                    data.information_type = '中标公告';
                    data.status = 1;
                    //todo 没有明显字段
                    data.tender_amount = 0;
                    //todo 没有明显字段
                    data.tender_acquisition_start_date = parseTimeString(startTimeString);
                    //todo 没有明显字段
                    data.tender_acquisition_end_date = parseTimeString(endTimeString);
                    //todo 没有明显字段
                    data.purchasing_area = '';
                    data.region_type_id = '';
                    //todo 没有明显字段
                    data.qualification_requirements ='' ;
                    return data;
                }
            });
            data.url = url;
            return data;
        }
        pageNum++;
        url = 'http://thzb.crsc.cn/g2625/m6044/mp'+pageNum+'.aspx';
    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("20_2.json", JSON.stringify(datas, null, '\t'), {flag: "w"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();




