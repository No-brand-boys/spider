package com.zhangyu.model;

/**
 *             {
 *                 "biddingType": "0",
 *                 "changeDesc": "",
 *                 "winningBidder": "",
 *                 "noticeName": "武汉钢铁有限公司能源环保部硅钢水处理（一期）改造MCC柜、母线桥等招标公告",
 *                 "noticeUrl": "http://bhzb.baosteelbidding.com/ebsbulletin/DispatchAction.do?efFormEname=PYBF20&packageId=00000000000000056486",
 *                 "issueDate": "2020-02-19 00:00:00",
 *                 "belongType": "1",
 *                 "start": 0,
 *                 "noticeType": "0",
 *                 "rows": 20,
 *                 "ouName": "宝华招标",
 *                 "souce": "",
 *                 "biddingNum": "0721-2064164GL805",
 *                 "page": 1
 *             },
 */
public class Data {
    private String biddingType;

    private String changeDesc;

    private String winningBidder;

    private String noticeName;

    private String noticeUrl;

    private String issueDate;

    private String belongType;

    private int start;

    private String noticeType;

    private int rows;

    private String ouName;

    private String souce;

    private String biddingNum;

    private int page;

    public String getBiddingType() {
        return biddingType;
    }

    public void setBiddingType(String biddingType) {
        this.biddingType = biddingType;
    }

    public String getChangeDesc() {
        return changeDesc;
    }

    public void setChangeDesc(String changeDesc) {
        this.changeDesc = changeDesc;
    }

    public String getWinningBidder() {
        return winningBidder;
    }

    public void setWinningBidder(String winningBidder) {
        this.winningBidder = winningBidder;
    }

    public String getNoticeName() {
        return noticeName;
    }

    public void setNoticeName(String noticeName) {
        this.noticeName = noticeName;
    }

    public String getNoticeUrl() {
        return noticeUrl;
    }

    public void setNoticeUrl(String noticeUrl) {
        this.noticeUrl = noticeUrl;
    }

    public String getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(String issueDate) {
        this.issueDate = issueDate;
    }

    public String getBelongType() {
        return belongType;
    }

    public void setBelongType(String belongType) {
        this.belongType = belongType;
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public String getNoticeType() {
        return noticeType;
    }

    public void setNoticeType(String noticeType) {
        this.noticeType = noticeType;
    }

    public int getRows() {
        return rows;
    }

    public void setRows(int rows) {
        this.rows = rows;
    }

    public String getOuName() {
        return ouName;
    }

    public void setOuName(String ouName) {
        this.ouName = ouName;
    }

    public String getSouce() {
        return souce;
    }

    public void setSouce(String souce) {
        this.souce = souce;
    }

    public String getBiddingNum() {
        return biddingNum;
    }

    public void setBiddingNum(String biddingNum) {
        this.biddingNum = biddingNum;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }
}
