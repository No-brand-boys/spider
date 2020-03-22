//http://csscpd.shipbuilding.com.cn/bidding/index.html
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
    let file = '.\\5_2.json';
    // 页数153
    for(let i=1; i<=153; i++) {
        let url = 'http://csscpd.shipbuilding.com.cn/bidding/index.html' ;
        if(i>1)
            url = 'http://csscpd.shipbuilding.com.cn/bidding/index_'+i+'.html';
        await page.goto(url);
        let links = await page.evaluate(() => {
            let links = [];
            let list = document.querySelectorAll('.left-text>a');
            for (let i = 0; i < list.length; i++) {
                let link = list[i].href;
                // console.log(link);
                links.push(link);
            }
            return links;
        });

        // 改成links的长度 links.length
        for (let i = 0; i < links.length; i++) {
            try{
                let data = await getData(links[i]);
                console.log(data);
                json_data.push(data);
            }catch (e) {
                console.log(e);
            }
        }

        async function getData(url) {
            let detail = await browser.newPage();
            await detail.goto(url);
            // await page.screenshot({path: '5_2.png'});

            let data = await detail.evaluate(() => {
                let data = {};
                //let regExp1 = /[\u4e00-\u9fa5]{4}[\uff1a][^\n]+/;
                let body = document.querySelector('#mainContents > div:nth-child(2)');
                //let content = body.innerText;
                let table = document.querySelector('tbody>tr:nth-child(2)');
                try{
                    data.type = false;
                    data.body = body.innerHTML;
                    data.source = '合信招标网';
                    data.source_type = '企业';
                    data.status = 1;
                    data.title = document.querySelector('.search_code').innerText.split('\n')[0];
                    data.release_time =document.querySelector('.search_code').innerText.split('\n')[1];
                    data.bidding_uid = '';
                    data.winning_bidder = table.children[3].innerText;
                    data.puchaser = table.children[2].innerText.split(' ')[1];
                    return data;
                }catch (e) {
                    console.log(e);
                }
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
