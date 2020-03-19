//http://www.china-tender.com.cn/zbgg/index.jhtml
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(180000);
    page.setDefaultTimeout(180000);

   /* page.on('console', msg => {
        console.log(msg);
    });

    page.on('error', err => {
        console.log(err);
    });*/

    page.on('load', () => {
        console.log("\n-------------------------------");
        console.log('page loaded\n');
    });

    let json_data =[];//数据存储部分
    let file = '.\\12_1.json';//
    //页数658
    for(let i=1; i<=650; i++) {
        let url = 'http://www.china-tender.com.cn/zbgg/index.jhtml' ;
        if(i>1)
            url = 'http://www.china-tender.com.cn/zbgg/index_'+i+'.jhtml';
        await page.goto(url);
        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelectorAll('.List2>ul>li>a');
            for (let i = 0; i < list.length; i++) {
                let link = list[i].href;
                // console.log(link);
                links.push(link);
            }
            return links;
        });

        // links的长度 links.length
        for (let i = 0; i < links.length; i++) {
            let data = await getData(links[i]);
            console.log(data.url);
            json_data.push(data);
        }

        async function getData(url) {
            let detail = await browser.newPage();
            await detail.goto(url);
            // await page.screenshot({path: '12_1.png'});

            let data = await detail.evaluate(() => {
                let data = {};
                let regExp1 = /\d{4}[-/]\d{2}[-/]\d{2}/;
                let regExp2 =/(招标|采购|项目)编号[:,：][^)\n）]+/;
                let regExp4 = /(招标人为|采购人：|招标人：|招 标 人：|采购人名称：|比选人：)[\u4e00-\u9fa5]+/;
                let body = document.querySelector('.Contnet');
                let content = body.innerText;
                try{
                    data.type = true;
                    data.body = body.innerHTML;
                    data.source = '合信招标网';
                    data.source_type = '企业';
                    data.status = 1;
                    data.title = document.querySelector('.TxtCenter').innerText;
                    data.release_time = document.querySelector('.Gray').innerText.match(regExp1)[0];
                    data.bidding_uid = content.match(regExp2)[0];
                    data.puchaser = content.match(regExp4)[0];
                }catch (e) {

                }
                return data;
            });
            data.url = url;
            return data;
        }
    }

    browser.close();
    fs.writeFile(file, JSON.stringify(json_data,null,'\t'), function(err){
        if(err)
            console.info("fail " + err);
        else
            console.info("写入文件ok!");
    });
})();
