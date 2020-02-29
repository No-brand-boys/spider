package com.zhangyu.test;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhangyu.model.Result;
import okhttp3.*;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.IOException;

public class HttpTest {
    private static ObjectMapper mapper = new ObjectMapper();

    @BeforeClass
    public static void init() {
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @Test
    public void baowuTest() throws Exception {
        int currentPage = 1;
        OkHttpClient client = new OkHttpClient().newBuilder()
                .build();
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
            if (response.body() != null) {
                data = response.body().string();
            }else{
                throw new Exception();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        Result result = mapper.readValue(data, new TypeReference<Result>() {});
        System.out.println(result.getObj());
    }
}
