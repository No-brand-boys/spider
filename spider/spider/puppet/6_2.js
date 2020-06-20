//http://ec.chng.com.cn/ecmall/more.do?type=104
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
    let file = '.\\6_2.json';
    //800页
    for(let i=0; i<880; i++) {
        let url = 'http://ec.chng.com.cn/ecmall/more.do?type=104&start=' + i*10 ;
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
            // await page.screenshot({path: '6_2.png'});

            let data = await detail.evaluate(() => {
                let data = {};
                let regExp1 =/[A-Z][A-Z,0-9,\-]+[0-9]/;
                let regExp2 = /((中标人: |中标候选人第1名：|中标人：\s?)\S+)|(中标人名称*.+)/;
                let regExp3 = /(招 标 人：\S+)|(招标人：.+)/;
                let body = document.querySelector('.detail_box');
                let content = body.innerText;
                let date = document.querySelector('.company').innerText.split(' ')[1];
                try{
                    data.type = false;
                    data.body = body.innerHTML;//.replace(/\s+/g,'');
                    data.source = '合信招标网';
                    data.source_type = '企业';
                    data.status = 1;
                    data.title = document.querySelector('.article_tit').innerText;
                    data.release_time =date.split('\uff1a')[1];
                    data.bidding_uid = content.match(regExp1)[0];
                    data.winning_bidder = content.match(regExp2)[0];
                    data.puchaser = content.match(regExp3)[0];
                }catch (e) {

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
