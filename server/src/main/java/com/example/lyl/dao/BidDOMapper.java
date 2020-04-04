package com.example.lyl.dao;

import com.example.lyl.dataobject.BidDO;

public interface BidDOMapper {
    int deleteByPrimaryKey(Integer id);

    int insert(BidDO record);

    int insertSelective(BidDO record);

    BidDO selectByPrimaryKey(Integer id);

    int updateByPrimaryKeySelective(BidDO record);

    int updateByPrimaryKeyWithBLOBs(BidDO record);

    int updateByPrimaryKey(BidDO record);
}