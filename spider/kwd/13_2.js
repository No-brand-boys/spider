//http://www.chinaunicombidding.cn/jsp/cnceb/web/forword.jsp
//http://www.chinaunicombidding.cn/jsp/cnceb/web/info1/infoList.jsp?type=2&page=1 子页面操作
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const fs = require('fs');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(180000);
    page.setDefaultTimeout(180000);
    let url = 'http://www.chinaunicombidding.cn/jsp/cnceb/web/info1/infoList.jsp';
    let json_data=[];//全局存储数据
    let file = '.\\13_2.json';
    //21页
    for(let i=1;i<=21;i++){
        let html = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
                'Cookie':'isFir=false; FSSBBIl1UgzbN7N8004S=lMlJBAoxLJR0HmjxUoCO2g1wJYgYCn3i04nWrYEa49Tl1TwAZZVPiX1eDxyc_iQy; FSSBBIl1UgzbN7N8004T=3JLgkA7tynC342z_yq1ev0I21Sr4uY.D157UnPlu.llfIaqah2.riwJDk_J82vabq10WxLFOOqUxVzJq75Bj235aChp0ShFUj.pgleelUHkgUi.dXFKIvzglrZRcwgguIX69KJYqXKo8hf_zcpKdKSOcLMyJ5CaB9uWoZ5Wub2zGR2u4vCpw6_GDT113V27Q.wQpqFq9tu9urZbsB_6npOsUuqoduHMqV2053S8AP8no3Rw0LlKWt7fi6.jqL0M_AViHfx7tc93z.uJJ8Nmh60Gym1nISAixrPzuyZj54mkAua.9R8ALB3BskNIt6wBgsTT1PI1T3KBaYOrE_wqXR2AL4jbgJxyUEppJCSXs3580glq; FSSBBIl1UgzbN7N8001S=.BNxtpUpimUCLwRsbXo4TKDDRCwLh0xsWTa6MT6_9plm03Eo8u71gZ2rqW7Jxh7z; BIGipServerpool_anquanfanghu=801252228.16671.0000; PURWW_SESSIONID=ZsPy3ODymCFOPc_b1_NlgByCgyNo0Lq-3LXoQiKveE4A7JQyDRBO!364386817; FSSBBIl1UgzbN7N8001T=3CachuFwwEOTkoSQhSIgCddAnWTfdcj0._Yc2hQw0otjTX3S8cxdls3kglyZ2mQlGkomQ_97QTus0aje5eiX7ijPk.XGQsIPRsE8.IeUyy91MFGgOIEEyK4faZoieUT5rUlE3_e06zWVDyUWUJXGaqlxEPZPnXpbe9GI84T18L3jtSruB8eK33UHTdUseuLt1iPecWKCtscPc9e1wkjaFaoJguQyyCw8HeBHGopqyW33n1vB5biP6ZGwO7sZsCk6zeElGUQEhaxyJDc9UJu1gS4Ec0R80nRtra_ejJJ1zeBbkJa'
            },
            body:'type=2&page='+i
        }).then(response=>response.text());
        await page.setContent(html);
        let links = await page.evaluate(() => {
            let links=[];
            let strArray = document.querySelectorAll('tbody>tr>td>span');
            for(let i=0;i<10;i++){
                let link = 'http://www.chinaunicombidding.cn'+strArray[i].onclick.toString().split('"')[1];
                links.push(link);
            }
            return links;
        });

        //links的长度 links.length
        for (let i = 0; i < links.length; i++) {
            try{
                let data = await getData(links[i]);
                console.log(data.url);
                json_data.push(data);
            }catch (e) {
                console.log(e);
            }
        }

        async function getData(url) {
            let detail = await browser.newPage();
            let html = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
                    'Cookie':'isFir=false; FSSBBIl1UgzbN7N8004S=lMlJBAoxLJR0HmjxUoCO2g1wJYgYCn3i04nWrYEa49Tl1TwAZZVPiX1eDxyc_iQy; FSSBBIl1UgzbN7N8004T=3JLgkA7tynC342z_yq1ev0I21Sr4uY.D157UnPlu.llfIaqah2.riwJDk_J82vabq10WxLFOOqUxVzJq75Bj235aChp0ShFUj.pgleelUHkgUi.dXFKIvzglrZRcwgguIX69KJYqXKo8hf_zcpKdKSOcLMyJ5CaB9uWoZ5Wub2zGR2u4vCpw6_GDT113V27Q.wQpqFq9tu9urZbsB_6npOsUuqoduHMqV2053S8AP8no3Rw0LlKWt7fi6.jqL0M_AViHfx7tc93z.uJJ8Nmh60Gym1nISAixrPzuyZj54mkAua.9R8ALB3BskNIt6wBgsTT1PI1T3KBaYOrE_wqXR2AL4jbgJxyUEppJCSXs3580glq; FSSBBIl1UgzbN7N8001S=.BNxtpUpimUCLwRsbXo4TKDDRCwLh0xsWTa6MT6_9plm03Eo8u71gZ2rqW7Jxh7z; BIGipServerpool_anquanfanghu=801252228.16671.0000; PURWW_SESSIONID=ZsPy3ODymCFOPc_b1_NlgByCgyNo0Lq-3LXoQiKveE4A7JQyDRBO!364386817; FSSBBIl1UgzbN7N8001T=3CachuFwwEOTkoSQhSIgCddAnWTfdcj0._Yc2hQw0otjTX3S8cxdls3kglyZ2mQlGkomQ_97QTus0aje5eiX7ijPk.XGQsIPRsE8.IeUyy91MFGgOIEEyK4faZoieUT5rUlE3_e06zWVDyUWUJXGaqlxEPZPnXpbe9GI84T18L3jtSruB8eK33UHTdUseuLt1iPecWKCtscPc9e1wkjaFaoJguQyyCw8HeBHGopqyW33n1vB5biP6ZGwO7sZsCk6zeElGUQEhaxyJDc9UJu1gS4Ec0R80nRtra_ejJJ1zeBbkJa'
                }
            }).then(response=>response.text());
            await detail.setContent(html);

            let data = await detail.evaluate(() => {
                let data = {};
                let regExp1 = /(第一中标候选人：|1\t|入围候选人如下：\n|入围供应商为|第一名：)\S+/;
                let body = document.querySelectorAll('span')[3];
                let content = body.innerText;
                try{
                    data.type = true;
                    data.body = body.innerHTML;
                    data.source = '合信招标网';
                    data.source_type = '企业';
                    data.status = 1;
                    data.title = document.querySelector('.MsoNormal').innerText;
                    data.release_time =document.querySelector('tbody').innerText.split('\t')[1];
                    data.bidding_uid = document.querySelector('tbody').innerText.split('\t')[0];
                    data.puchaser = document.querySelectorAll('.MsoNormal')[3].innerText;
                    data.winning_bidder = content.match(regExp1)[0];
                }catch (e) {
                    console.log(e);
                }
                return data;
            });
            data.url = url;
            return data;
        }
    }

    browser.close();
    fs.writeFile(file, JSON.stringify(json_data,null,'\t'),'gbk',function(err){
        if(err)
            console.info("fail " + err);
        else
            console.info("写入文件ok!");
    });
})();
