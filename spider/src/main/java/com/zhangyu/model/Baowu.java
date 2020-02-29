package com.zhangyu.model;

import java.util.List;

public class Baowu {
    private int total;

    private int pages;

    private List<Data> newsPage;

    private int pageSize;

    private int pageNum;

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getPages() {
        return pages;
    }

    public void setPages(int pages) {
        this.pages = pages;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public int getPageNum() {
        return pageNum;
    }

    public void setPageNum(int pageNum) {
        this.pageNum = pageNum;
    }

    public List<Data> getNewsPage() {
        return newsPage;
    }

    public void setNewsPage(List<Data> newsPage) {
        this.newsPage = newsPage;
    }
}
