const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
    //2012页
    const browser = await puppeteer.launch();
    const html = await browser.newPage();
    let json_data =[];//数据存储部分
    let file = '.\\1_2.json';
    for (let i=1;i<=2012;i++){
        let page = await fetch('http://baowu.ouyeelbuy.com/baowu-shp/notice/moreBiddingNoticeList', {
            method: 'POST',
            credentials: 'include',
            headers: {'Accept': 'application/json, text/plain, */*', 'Content-Type': 'application/x-www-form-urlencoded'},
            body: "type=1&jqMethod=newsList&pageNow="+i // 注意 post 时候参数的形式
        }).then(res=>res.json());
        //console.log(JSON.stringify(page,null,'\t'));
        let list=page.obj.list;
        for (let i=0;i<10;i++){
            let data={};
            let body =  await getBody(list[i].noticeUrl);
            data.body = body;
            data.type = false;
            data.source = '合信招标网';
            data.source_type = '企业';
            data.status = 1;
            data.titile = list[i].noticeName;
            data.url = list[i].noticeUrl;
            data.release_time = list[i].issueDate;
            data.bidding_uid = list[i].biddingNum;
            data.winning_bidder = list[i].winningBidder;
            json_data.push(data);
            console.log(data.url);
        }
        async function getBody(url) {
            try{
                let newPage = await fetch(url).then(res=>res.text()).then(res=>res.toString());
                await html.setContent(newPage);
                let body = await html.evaluate(() => {
                    let body = document.querySelector('.m-bd').innerHTML;
                    body = body.replace(/\s+/g,'');
                    return body;
                });
                return body;
            }catch (e) {
                console.log(e)
            }
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
