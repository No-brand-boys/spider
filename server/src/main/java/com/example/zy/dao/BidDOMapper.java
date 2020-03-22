package com.example.zy.dao;

import com.example.zy.dataobject.BidDO;

public interface BidDOMapper {
    int deleteByPrimaryKey(Integer id);

    int insert(BidDO record);

    int insertSelective(BidDO record);

    BidDO selectByPrimaryKey(Integer id);

    int updateByPrimaryKeySelective(BidDO record);

    int updateByPrimaryKeyWithBLOBs(BidDO record);

    int updateByPrimaryKey(BidDO record);
}