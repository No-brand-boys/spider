package com.zhangyu.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhangyu.model.Data;
import com.zhangyu.model.Result;
import com.zhangyu.service.SpiderService;
import com.zhangyu.util.MapperUtil;
import okhttp3.*;
import org.springframework.stereotype.Controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Controller
public class SpiderServiceImpl implements SpiderService {
    private static ObjectMapper mapper = MapperUtil.getDefaultMapper();;
    private static OkHttpClient client = new OkHttpClient().newBuilder().build();

    public List<Data> grab(int currentPage) {

        MediaType mediaType = MediaType.parse("application/x-www-form-urlencoded");
        FormBody.Builder builder = new FormBody.Builder();
        builder.add("title", "");
        builder.add("sDate", "");
        builder.add("eDate", "");
        builder.add("type", "0");
        builder.add("pageNow", String.valueOf(currentPage));
        builder.add("jqMthod", "newsList");
        builder.add("ouName", "");
        Request request = new Request.Builder()
                .url("http://baowu.ouyeelbuy.com/baowu-shp/notice/moreBiddingNoticeList")
                .addHeader("Content-Type", "application/x-www-form-urlencoded")
                .post(builder.build())
                .build();
        String data = null;
        try {
            Response response = client.newCall(request).execute();
            if (response.body() == null) {
                return null;
            }
            data = response.body().string();
            Result result = mapper.readValue(data, new TypeReference<Result>() {});
            return result.getObj().getNewsPage();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}
