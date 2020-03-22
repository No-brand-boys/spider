const fetch = require('node-fetch');
const fs = require('fs');

(async () => {
    //1307页
    let json_data = [];//数据存储部分
    let file = '.\\1_1.json';
    for (let i = 1; i <= 1307; i++) {
        let page = await fetch('http://baowu.ouyeelbuy.com/baowu-shp/notice/moreBiddingNoticeList', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: "type=0&jqMethod=newsList&pageNow=" + i // 注意 post 时候参数的形式
        }).then(res => res.json());

        let list = page.obj.list;
        //每页10个
        for (let i = 0; i < 10; i++) {
            let data = {};
            try {
                let body = await getBody(list[i].noticeUrl);
                data.body = body;
                data.type = true;
                data.source = '合信招标网';
                data.source_type = '企业';
                data.status = 1;
                data.titile = list[i].noticeName;
                data.url = list[i].noticeUrl;
                data.release_time = list[i].issueDate;
                data.bidding_uid = list[i].biddingNum;
                json_data.push(data);
                console.log(data.url);
            } catch (e) {

            }
        }

        async function getBody(url) {
            let regExp1 = /<table[^>]*>([\s\S]*)<\/table>/;
            try {
                let newPage = await fetch(url)
                    .then(res => res.text())
                    .then(res => res.toString());
                return newPage.match(regExp1)[0];
            } catch (e) {

            }
        }
    }
    fs.writeFile(file, JSON.stringify(json_data, null, '\t'), function (err) {
        if (err)
            console.info("fail " + err);
        else
            console.info("写入文件ok!");
    });

})();
