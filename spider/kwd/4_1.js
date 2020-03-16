//link:http://cg.cdb.com.cn/web/ggxx/cggg/H600201index_1.htm
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(180000);
    page.setDefaultTimeout(180000);

    page.on('console', msg => {
        console.log(msg);
    });

    page.on('error', err => {
        console.log(err);
    });

    page.on('load', () => {
        console.log("-------------------------------");
        console.log('page loaded\n');
    });

    let file = '.\\4_1.json';//数据存储部分
    let json_data =[];
    //100页
    for(let i=1; i<=100; i++) {
        let url = 'http://cg.cdb.com.cn/web/ggxx/cggg/H600201index_' + i + '.htm';
        //http://cg.cdb.com.cn/web/ggxx/cggg/H600201index_1.htm
        await page.goto(url);
        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelectorAll('.LineRow>a');
            for (let i = 0; i < list.length; i++) {
                let link = list[i].href;
                // console.log(link.href);
                links.push(link);
            }
            return links;
        });
        // links的长度 links.length
        for (let i = 0; i < links.length; i++) {
            try{
                let data = await getData(links[i]);
                console.log(data);
                json_data.push(data);
            }catch (e) {
                
            }
        }

        async function getData(url) {
            let detail = await browser.newPage();
            await detail.goto(url);
            // await page.screenshot({path: '4_1.png'});

            let data = await detail.evaluate(() => {
                let data = {};
                let regExp1 = /[\u4e00-\u9fa5]{4}[\uff1a][^\n]+/;
                let regExp2 = /(招 标 人|采购人|招标人|采 购 人)\uff1a\S+/;
                let body = document.querySelector('#BodyLabel');
                let content = body.innerText;
                try {
                    data.type = true;
                    data.body = body.innerHTML;
                    data.source = '合信招标网';
                    data.source_type = '企业';
                    data.status = 1;
                    data.title = document.querySelector('.ArticleTitle').innerText;
                    let date = document.querySelectorAll('.GrayFontStyle')[1].innerText.split(" ")[0];
                    data.release_time = date.split('\uff1a')[1];
                    data.puchaser = content.match(regExp2)[0];
                    data.bidding_uid = content.match(regExp1)[0];
                } catch (e) {

                }
                return data;
            });
            data.url = url;
            return data;
        }
    }
    fs.writeFile(file,JSON.stringify(json_data, null, '\t'), function (err) {
        if (err)
            console.info("fail " + err);
        else
            console.info("Write ok!");
    });

    browser.close();
})();
