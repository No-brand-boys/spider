package com.example.zy.control;

import com.example.zy.service.PuppetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class PuppetController {
    @Autowired
    private PuppetService service;

    @RequestMapping(value = "/bid/add", method = RequestMethod.GET)
    @ResponseBody
    public long insertData(@RequestParam("site") int site) {
        long result = service.saveData(site);
        return result;
    }
}
