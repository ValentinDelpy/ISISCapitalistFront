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
Path("generic")
public class Webservice {

    Services services;

    public Webservice() {
        services = new Services();
    }
    
    @GET
    @Path("world")
    @Produces(MediaType.APPLICATION_XML)

    public Response getWorld() {
        return Response.ok(services.getWorld()).build();
    }

}
