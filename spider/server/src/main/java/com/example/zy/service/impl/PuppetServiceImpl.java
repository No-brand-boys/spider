package com.example.zy.service.impl;

import com.example.zy.dao.BidDOMapper;
import com.example.zy.dataobject.BidDO;
import com.example.zy.service.PuppetService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class PuppetServiceImpl implements PuppetService {
    private static ObjectMapper mapper;

    @Autowired
    private BidDOMapper bidDOMapper;

    static {
        mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @Override
    public long saveData(int site) {
        File file = new File(String.format("./spider/%d_1.json", site));
        File file1 = new File(String.format("./spider/%d_2.json", site));
        int result = 0;
        try {
            List<BidDO> list = mapper.readValue(file, new TypeReference<List<BidDO>>() {
            });
            list.forEach(e -> {
                e.setBiddingUid(UUID.randomUUID().toString().replace("-", ""));
                Field[] fields = e.getClass().getDeclaredFields();
                for (Field field : fields) {
                    try {
                        field.setAccessible(true);
                        Object o = field.get(e);
                        String typeName = field.getType().getName();
                        if (o == null) {
                            if ("java.lang.String".equals(typeName)) {
                                field.set(e, "");
                            }
                            if ("java.lang.Integer".equals(typeName)) {
                                field.set(e, 0);
                            }
                            if ("java.lang.Boolean".equals(typeName)) {
                                field.set(e, false);
                            }
                            if ("java.util.Date".equals(typeName)) {
                                field.set(e, new Date());
                            }
                        }
                    } catch (IllegalAccessException e1) {
                        e1.printStackTrace();
                    }
                }
            });
            result += bidDOMapper.batchInsert(list);
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            List<BidDO> list = mapper.readValue(file1, new TypeReference<List<BidDO>>() {
            });
            list.forEach(e -> {
                e.setBiddingUid(UUID.randomUUID().toString().replace("-", ""));
            });
            result += bidDOMapper.batchInsert(list);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return result;
    }

}
