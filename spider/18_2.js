const puppeteer = require('puppeteer');
var fs = require("fs");
var datas = [];
const PAGE_NUM = 2;
(async () => {
    var pageNum = 1;
    var url = 'http://www.ccgp-jiangxi.gov.cn/web/jyxx/002006/002006004/' + pageNum + '.html';
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
            path: '19_2.png'
        });

        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelector('.ewb-infolist ul').children;
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
                    if (timeNums !== null) {
                        let times = [];
                        for (let i = 0; i < 6; i++) {
                            if (typeof (timeNums[i]) !== "undefined") {
                                times[i] = timeNums[i];
                            } else {
                                times[i] = '00';
                            }
                        }
                        return times[0] + '-' + times[1] + '-' + times[2] + ' ' + times[3] + ':' + times[4] + ':' + times[5];
                    } else {
                        return '';
                    }
                }
                function getTenderAmount(){
                    let index = -1;  //用于定位哪一列是采购金额
                    let allRows = document.querySelector('table tbody').children; //表格所有行
                    let firstRowAllCols = allRows[0].children; //表格 第一行所有列
                    let isTenThousand = false;
                    let isNeedJudge = false;
                    for (let j = 0; j <firstRowAllCols.length ; j++) {
                        if (firstRowAllCols[j].innerText.search(/(金额)|(总价)/)!==-1) {
                            index = j;
                            if (firstRowAllCols[j].innerText.search('万')===-1){
                                isNeedJudge = true;
                            }else {
                                isTenThousand = true;
                            }
                            break;
                        }
                    }
                    if (index!==-1){
                        let str= allRows[1].children[index].innerText;
                        let num = str.match(/[\d.]+/g)[0];
                        if (!isTenThousand&&isNeedJudge){
                            if (str.search('万')!==-1){
                                isTenThousand = true;
                            }
                        }
                        if (isTenThousand){
                            return parseInt(num)*1000000;
                        } else {
                            return parseInt(num)*100;
                        }
                    }else {
                        return 0;
                    }
                }
                function getWinnerBidder(){
                    let index = -1;  //用于定位哪一列是中标人
                    let allRows = document.querySelector('table tbody').children; //表格所有行
                    let firstRowAllCols = allRows[0].children; //表格 第一行所有列
                    for (let j = 0; j <firstRowAllCols.length ; j++) {
                        if (firstRowAllCols[j].innerText.search(/((成[ ]*交[ ]*)|(中[ ]*标[ ]*))((供[ ]*应[ ]*商[ ]*)|(人[ ]*)|(单[ ]*位[ ]*))((名[ ]*称[ ]*)|(全[ ]*称[ ]*))*/)!==-1) {
                            index = j;
                            console.log('bidder列'+index);
                            break;
                        }
                    }
                    if (index!==-1){
                        let str= allRows[1].children[index].innerText;
                        return str;
                    }else {
                        return '';
                    }
                }

                let winning_bidder_index = -1;
                let tender_amount_index = -1;
                let data = {};
                let body = document.querySelector('.con').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let startTimeString = '';
                let endTimeString = '';
                let purchaser = '';
                let winning_bidder = '';
                let purchasing_area = '';
                let tender_amount = 0;
                try {

                }catch (e) {
                    tender_amount = getTenderAmount();
                }
                try {
                    winning_bidder = getWinnerBidder();
                } catch (e) {
                    console.log('winning_bidder error')
                }
                try {
                    purchasing_area = '';
                } catch (e) {
                    console.log('purchasing_area error')
                }
                try {
                    purchaser = '';
                } catch (e) {
                    console.log('purchaser error');
                }
                finally {
                    data.type = true;
                    data.bidding_uid = '';
                    data.winning_bidder = winning_bidder;
                    // todo 有的页面purchaser 无展示 所以爬不到
                    data.purchaser = purchaser;
                    data.release_time = parseTimeString(document.querySelector('.infotime').innerText);
                    data.title = document.querySelector('.article-info h1').innerText;
                    data.body = body;
                    data.source = '江西公共资源交易网';
                    data.source_type = '企业';
                    data.information_type = '中标公告';
                    data.status = 1;
                    // todo 不好爬
                    data.tender_amount = tender_amount;
                    // todo 没有明显字段 就忽略了
                    data.tender_acquisition_start_date = '';
                    // todo 没有明显字段 就忽略了
                    data.tender_acquisition_end_date = '';
                    // todo 没有明显字段 忽略了
                    data.purchasing_area = purchasing_area;
                    data.region_type_id = '';
                    // todo 没有明显字段 忽略了
                    data.qualification_requirements = '';
                    return data;
                }
            });
            data.url = url;
            return data;
        }

        pageNum++;
        url = 'http://www.ccgp-jiangxi.gov.cn/web/jyxx/002006/002006004/' + pageNum + '.html';
    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("18_2.json", JSON.stringify(datas, null, '\t'), {flag: "w"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
