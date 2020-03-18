const puppeteer = require('puppeteer');
var fs = require("fs");
var datas = [];
const PAGE_NUM = 3;
(async () => {
    var pageNum = 1;
    var url = 'http://www.shenhuabidding.com.cn/bidweb/001/001002/'+pageNum+'.html';
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

        async function getData(url,i) {
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
                let data = {};
                let body = document.querySelector('.article-info').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let qualification_requirements_pattern = /(3.投标人资格要求)([\S|\s])*(?=4.招标文件的获取)/;
                let purchaser_pattern = /((招[ ]*标[ ]*(人[ ]*|单[ ]*位[ ]*)*)|(联[ ]*系[ ]*方[ ]*法[ ]*)|(采[ ]*购[ ]*(人[ ]*|单[ ]*位[ ]*)*))(联[ ]*系[ ]*方[ ]*式：[ ]*)*(名[ ]*称)*(：)(\s*)(\S)*(公司|中心|局|部|协会|院|学)/;
                let startTimeString_pattern =/(招标文件购买时间：)(\s|\S)*(分至)/;
                let endTimeString_pattern = /(开[ ]*标[ ]*时[ ]*间[ ]*)(\S)*((：)|(为))(\s|\S)*(（北京时间)/;
                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';
                let qualification_requirements = '';
                let tender_amount = 0;
                try {
                    qualification_requirements = qualification_requirements_pattern.exec(body)[0];
                }catch (e) {
                    console.log('qualification_requirements error')
                }

                try {
                    purchaser = purchaser_pattern.exec(body)[0];
                }catch (e) {
                    console.log('purchaser error');
                }
                try {
                    startTimeString =startTimeString_pattern.exec(body)[0] ;
                } catch (e) {
                    console.log('startTime error');
                }
                try {
                    endTimeString = endTimeString_pattern.exec(body)[0];
                } catch (e) {
                    console.log('endTime error');
                }
                try {
                    purchasing_area_str = '';
                } catch (e) {
                    console.log('purchasing_area_str error');
                }
                finally {
                    data.type = false;  //招标是false
                    data.bidding_type = '';
                    data.bidding_uid = '';
                    data.body = body;
                    data.title = document.querySelector('#title').innerText;
                    //todo purchaser 因为页面不同 有的页面爬不下来
                    data.purchaser = purchaser;
                    data.release_time = parseTimeString(document.querySelector('.info-sources').innerText);
                    data.source = '国家能源招标网';
                    data.source_type = '企业';
                    data.status = 1;
                    data.tender_amount = tender_amount;
                    data.tender_acquisition_start_date = parseTimeString(startTimeString);
                    data.tender_acquisition_end_date = parseTimeString(endTimeString);
                    //todo 页面上没有明显字段
                    data.purchasing_area = purchasing_area_str;
                    data.region_type_id = '';
                    //todo  qualification_requirements 不好爬
                    data.qualification_requirements = qualification_requirements;
                    return data;
                }
            });
            data.url = url;
            return data;
        }
        pageNum++;
         url = 'http://www.shenhuabidding.com.cn/bidweb/001/001002/'+pageNum+'.html';
    } while (pageNum < PAGE_NUM) ;
    browser.close();
    fs.writeFile("14_1.json", JSON.stringify(datas, null, '\t'), {flag: "w"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();
