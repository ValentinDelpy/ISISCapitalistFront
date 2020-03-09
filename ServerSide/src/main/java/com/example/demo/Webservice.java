/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.example.demo;

import generated.World;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.bind.JAXBException;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;

/**
 *
 * @author Soul
 */
@Controller
@Path("/api")
public class Webservice {

    Services services;

    public Webservice() {
        this.services = new Services();
    }

@GET
@Path("world")
@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 public Response getWorld() throws JAXBException {
 return Response.ok(services.readWorldFromXml()).build();
 }

}
