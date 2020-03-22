const puppeteer = require('puppeteer');
var fs = require("fs");
var datas = [];

(async () => {
    var pageNum = 1;
    var url = 'http://thzb.crsc.cn/g2586/m5978/mp' + pageNum + '.aspx';
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
            path: '20_1.png'
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
            await detail.screenshot({
                path:i+'.png'
            });
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
                let body = document.querySelector('#Content').innerHTML.replace(/<\/?.+?\/?>/g, '').replace(/&nbsp;/g, '');
                let startTimeStringPattern = '';
                let endTimeStringPattern = /((截[ ]*止[ ]*时[ ]*间[ ]*)|(开[ ]*标[ ]*时[ ]*间[ ]*))(\S)*((：)|(为))(\s|\S)*(分)/;
                let qualification_requirements_pattern = /(?<=资格要求)([\S|\s])*(?=3.)/;
                let purchasing_area_pattern = '';
                let purchaser_pattern = /(?<=招( )*标( )*人：)([\S])*(?=)/;
                let startTimeString = '';
                let endTimeString = '';
                let purchasing_area_str = '';
                let purchaser = '';
                let qualification_requirements = '';
                try {
                    qualification_requirements = qualification_requirements_pattern.exec(body)[0];
                }catch (e) {
                    console.log('qualification_requirements error');
                }
                try {
                    startTimeString = startTimeStringPattern.exec(body)[0];
                } catch (e) {
                    console.log('startTime error');
                }
                try {
                    endTimeString = endTimeStringPattern.exec(body)[0];
                } catch (e) {
                    console.log('endTime error');
                }
                try {
                    purchasing_area_str = purchasing_area_pattern.exec(body)[0];
                } catch (e) {
                    console.log('purchasing_area_str error');
                }
                try {
                    purchaser = purchaser_pattern.exec(body)[0]
                } catch (e) {
                    console.log('purchaser error');
                }
                finally {
                    data.type = false;  //招标是false
                    data.bidding_type = '';
                    data.bidding_uid = '';
                    data.body = body;
                    data.title = document.querySelector('#Title').innerText;
                    data.purchaser = purchaser;
                    data.release_time = document.querySelector('#PublishTime').innerText;
                    data.source = '中国通号';
                    data.source_type = '企业';
                    data.status = 1;
                    //todo  没有明显字段
                    data.tender_amount = 0;
                    //todo 不好爬
                    data.tender_acquisition_start_date = parseTimeString(startTimeString);
                    //todo 基本能爬到
                    data.tender_acquisition_end_date = parseTimeString(endTimeString);
                    //todo  没有明显字段
                    data.purchasing_area = purchasing_area_str;
                    data.region_type_id = '';
                    //todo  爬多了 后面有多余的内容  不知道怎么办
                    data.qualification_requirements = qualification_requirements;
                    return data;
                }
            });
            data.url = url;
            return data;
        }
        pageNum++;
        url = 'http://thzb.crsc.cn/g2586/m5978/mp' + pageNum + '.aspx';
    } while (pageNum < 2) ;
    browser.close();
    fs.writeFile("20_1.json", JSON.stringify(datas, null, '\t'), {flag: "w"}, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("写入成功");
        }
    });
})();




