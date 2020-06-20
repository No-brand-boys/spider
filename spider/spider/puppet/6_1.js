//http://ec.chng.com.cn/ecmall/more.do?type=103
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
        console.log("\n-------------------------------");
        console.log('page loaded\n');
    });

    let json_data =[];//数据存储部分
    let file = '.\\6_1.json';
    //<1066页
    for(let i=0; i<1000; i++) {
        let url = 'http://ec.chng.com.cn/ecmall/more.do?type=103&start=' + i*10 ;
        await page.goto(url);
        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelectorAll('.main_r_con>li>a');
            for (let i = 0; i < list.length; i++) {
                let id = list[i].href.split("'")[1];
                let link = 'http://ec.chng.com.cn/ecmall/announcement/announcementDetail.do?announcementId='+id;
                // console.log(link);
                links.push(link);
            }
            return links;
        });

        //links的长度 links.length
        for (let i = 0; i < links.length; i++) {
            let data = await getData(links[i]);
            console.log(data.url);
            json_data.push(data);
        }

        async function getData(url) {
            let detail = await browser.newPage();
            await detail.goto(url);
            // await page.screenshot({path: '6_1.png'});

            let data = await detail.evaluate(() => {
                let data = {};
                let regExp1 =/招标编号\uff1a\S+/;
                let regExp2 = /(招标人|采购人)为[\u4e00-\u9fa5]+/;
                let body = document.querySelector('.detail_box');
                let content = body.innerText;
                let date = document.querySelector('.company').innerText.split(' ')[1];
                try{
                    data.type = true;
                    data.body = body.innerHTML;//.replace(/\s+/,'');
                    data.source = '合信招标网';
                    data.source_type = '企业';
                    data.status = 1;
                    data.title = document.querySelector('.article_tit').innerText;
                    data.release_time =date.split('\uff1a')[1];
                    data.puchaser = content.match(regExp2)[0].replace(/(招标人|采购人)为/,'');
                    data.bidding_uid = content.match(regExp1)[0];
                }catch (e) {
                    data.puchaser = '';
                    data.bidding_uid = '';
                }
                return data;
            });
            data.url = url;
            return data;
        }
    }
    fs.writeFile(file, JSON.stringify(json_data,null,'\t'), function(err){
        if(err)
            console.info("fail " + err);
        else
            console.info("写入文件ok!");
    });

    browser.close();
})();
