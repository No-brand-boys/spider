package com.example.lyl.dataobject;

import java.util.Date;

public class BidDO {
    private Integer id;

    private Integer type;

    private String biddingUid;

    private String purchaser;

    private String title;

    private Date releaseTime;

    private String url;

    private String source;

    private String sourceType;

    private Integer status;

    private Integer tenderAmount;

    private Date tenderAcquisitionStartDate;

    private Date tenderAcquisitionEndDate;

    private String purchasingArea;

    private String regionTypeId;

    private String qualificationRequirements;

    private String body;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }

    public String getBiddingUid() {
        return biddingUid;
    }

    public void setBiddingUid(String biddingUid) {
        this.biddingUid = biddingUid;
    }

    public String getPurchaser() {
        return purchaser;
    }

    public void setPurchaser(String purchaser) {
        this.purchaser = purchaser;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Date getReleaseTime() {
        return releaseTime;
    }

    public void setReleaseTime(Date releaseTime) {
        this.releaseTime = releaseTime;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getTenderAmount() {
        return tenderAmount;
    }

    public void setTenderAmount(Integer tenderAmount) {
        this.tenderAmount = tenderAmount;
    }

    public Date getTenderAcquisitionStartDate() {
        return tenderAcquisitionStartDate;
    }

    public void setTenderAcquisitionStartDate(Date tenderAcquisitionStartDate) {
        this.tenderAcquisitionStartDate = tenderAcquisitionStartDate;
    }

    public Date getTenderAcquisitionEndDate() {
        return tenderAcquisitionEndDate;
    }

    public void setTenderAcquisitionEndDate(Date tenderAcquisitionEndDate) {
        this.tenderAcquisitionEndDate = tenderAcquisitionEndDate;
    }

    public String getPurchasingArea() {
        return purchasingArea;
    }

    public void setPurchasingArea(String purchasingArea) {
        this.purchasingArea = purchasingArea;
    }

    public String getRegionTypeId() {
        return regionTypeId;
    }

    public void setRegionTypeId(String regionTypeId) {
        this.regionTypeId = regionTypeId;
    }

    public String getQualificationRequirements() {
        return qualificationRequirements;
    }

    public void setQualificationRequirements(String qualificationRequirements) {
        this.qualificationRequirements = qualificationRequirements;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
}