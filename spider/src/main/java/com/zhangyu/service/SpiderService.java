package com.zhangyu.service;

import com.zhangyu.model.Data;
import com.zhangyu.model.Result;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

public interface SpiderService {

    @RequestMapping("/spider/baowu")
    @ResponseBody
    List<Data> grab(@RequestParam("page") int currentPage);

}
