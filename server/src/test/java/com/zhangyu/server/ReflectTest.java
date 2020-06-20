package com.zhangyu.server;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

public class ReflectTest {
    class Demo {
        private Integer id;
        private String name;

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    @Test
    public void fieldTest() {
        Demo demo = new Demo();
        demo.setId(1);
        Field[] fields = demo.getClass().getDeclaredFields();
        for (Field field : fields) {
            try {
                field.setAccessible(true);
                Object o = field.get(demo);
                System.out.println(o);
                System.out.println(field.getType().getName());
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }
        }
    }
}
