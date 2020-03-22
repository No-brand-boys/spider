//http://bid.norincogroup-ebuy.com/retrieve.do?typflag=1
//https://bidfile.norincogroup-ebuy.com/bdfileservice//bdsnapshot/zbgg/C1100000096006932001/C1100000096006932001.html 子页面
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(180000);
    page.setDefaultTimeout(180000);

   /* page.on('console', msg => {
        console.log(msg.text());
    });

    page.on('error', err => {
        console.error(err.text());
    }); */

    page.on('load', () => {
        console.log("\n-------------------------------");
        console.log('page loaded\n');
    });

    let json_data =[];//数据存储部分
    let file = '.\\2_1.json';
    //页数295
    for(let i=1; i<=295; i++) {
        let url = "http://bid.norincogroup-ebuy.com/retrieve.do?typflag=1&pageNumber=" + i;
        await page.goto(url);
        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelectorAll('.tit');
            for (let i = 0; i < list.length; i++) {
                let link = list[i].href;
                // console.log(link);
                links.push(link);
            }
            return links;
        });
        //links.length
        for (let i = 0; i < links.length; i++) {
            let data = await getData(links[i]);
            console.log(data.url);
            json_data.push(data);
        }

        async function getData(url) {
            let detail = await browser.newPage();
            await detail.goto(url);
            //await page.screenshot({path: '2_1.png'});
            let src = await detail.evaluate(() => {return document.querySelector('#iframecontract').src});
            let data= await detail.evaluate(() => {
                let data = {};
                let regExp1 = /\d{4}[-/]\d{2}[-/]\d{2}/;
                try{
                    data.title = document.querySelector('.zbztb_filetit>h3').innerText.split(' ')[0];
                    let date = document.querySelector('.time').innerText;
                    data.release_time = date.match(regExp1)[0];
                    data.puchaser = document.querySelector('.zbztb_up_com>span').innerText;
                    data.type = true;
                    data.source = '合信招标网';
                    data.source_type = '企业';
                    data.status = 1;
                    data.bidding_uid = ''//网站无生成bidding_uid;
                }catch (e) {

                }
                return data;
            });
            data.url = url;
            await detail.goto(src);
            let body = await detail.evaluate(()=>{
                let body;
                try{
                    body = document.querySelector('body').innerHTML;
                    body = body.replace(/\s+/g,"");
                }catch (e) {

                }
                return body;
            });
            data.body = body;
            return data;
        }
    }
    page.close();
    browser.close();
    fs.writeFile(file, JSON.stringify(json_data, null, '\t'), function (err) {
        if (err)
            console.info("fail " + err);
        else
            console.info("写入文件ok!");
    });
})();