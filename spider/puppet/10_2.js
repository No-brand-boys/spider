//http://www.bidding.csg.cn/zbhxrgs/index.jhtml
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(180000);
    page.setDefaultTimeout(180000);

    page.on('console', msg => {
        console.log(msg.text());
    });

    page.on('error', err => {
        console.error(err.text());
    });

    page.on('load', () => {
        console.log("\n-------------------------------");
        console.log('page loaded\n');
    });

    let json_data =[];//数据存储部分
    let file = '.\\10_2.json';
    //页数16030
    for(let i=1; i<=5000; i++) {
        let url = 'http://www.bidding.csg.cn/zbhxrgs/index.jhtml';
        if(i>1)
            url = 'http://www.bidding.csg.cn/zbhxrgs/index_'+i+'.jhtml';
        await page.goto(url);
        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelectorAll('.List2>ul>li>a');
            for (let i = 1; i < list.length; i+=2) {//20个a标签 ,其中偶数标签无用,故写法改变
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
            //await page.screenshot({path: '10_2.png'});

            let data = await detail.evaluate(() => {
                let data = {};
                let regExp1 = /\d{4}[-/]\d{2}[-/]\d{2}/;
                let regExp2 =/(招标|采购|项目)编号：[^)\n\）]+/;
                let body = document.querySelector('.Section0');
                let content = body.innerText;
                let date = document.querySelector('.s-date').innerText;
                try{
                    data.source = '合信招标网';
                    data.source_type = '企业';
                    data.status = 1;
                    data.title = document.querySelector('.s-title').innerText;
                    data.release_time = date.match(regExp1)[0];
                    data.type = false;
                    data.body = body.innerHTML;//.replace(/\s+/g,'');
                    data.bidding_uid = content.match(regExp2)[0];
                    data.puchaser = '';//页面基本上完全不同,无法抓取
                }catch (e) {

                }
                return data;
            });
            data.url = url;
            return data;
        }
    }

    browser.close();
    fs.writeFile(file, JSON.stringify(json_data, null, '\t'), function (err) {
        if (err)
            console.info("fail " + err);
        else
            console.info("写入文件ok!");
    });
})();
