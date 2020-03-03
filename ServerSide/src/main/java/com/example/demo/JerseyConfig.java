/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.example.demo;

/**
 *
 * @author ssylvest
 */
@Component
@ApplicationPath("/adventureisis")
public class JerseyConfig extends ResourceConfig {
    public JerseyConfig(){
        register(Webservice.class);
    }
}
