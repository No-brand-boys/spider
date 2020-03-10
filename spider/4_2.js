//link:http://cg.cdb.com.cn/web/ggxx/jggg/H600202index_1.htm

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

    let json_data =[];//数据存储部分
    let file = '.\\4-2.json';
    //todo 改成80页
    for(let i=1; i<=1; i++) {
        let url = 'http://cg.cdb.com.cn/web/ggxx/jggg/H600202index_' + i + '.htm';
        //http://cg.cdb.com.cn/web/ggxx/jggg/H600202index_1.htm
        await page.goto(url);
        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelectorAll('.LineRow>a');
            for (let i = 0; i < list.length; i++) {
                let link = list[i].href;
                // console.log(link);
                links.push(link);
            }
            return links;
        });

        //todo 改成links的长度 links.length
        for (let i = 0; i < 2; i++) {
            let data = await getData(links[i]);
            console.log(data);
            json_data.push(data);
        }

        async function getData(url) {
            let detail = await browser.newPage();
            await detail.goto(url);
            // await page.screenshot({path: '4_2.png'});

            let data = await detail.evaluate(() => {
                let data = {};
                let regExp1 = /(中标人名称|中选供应商名称|成交供应商名称)\uff1a\S+/;
                let regExp2 = /(采购编号|招标编号)\uff1a\S+/;
                let regExp3 = /(招标人名称|采购人|委托单位)\uff1a\S+/;
                let body = document.querySelector('#BodyLabel');
                let content = body.innerText;
                data.type = false;
                //data.body = body;
                data.source = '合信招标网';
                data.source_type = '企业';
                data.status = 1;
                data.title = document.querySelector('.ArticleTitle').innerText;
                let date = document.querySelectorAll('.GrayFontStyle')[1].innerText.split(" ")[0];
                data.release_time =date.split('\uff1a')[1];
                try{
                    data.bidding_uid = content.match(regExp2)[0];
                    data.winning_bidder = content.match(regExp1)[0];
                    data.puchaser = content.match(regExp3)[0];
                }catch (e) {
                    console.info('出错了!!!');
                    data.winning_bidder = '';
                    data.puchaser = '';
                    data.bidding_uid ='';
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