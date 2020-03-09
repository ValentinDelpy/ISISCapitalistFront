/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.example.demo;

import generated.World;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

public class Services {

    World readWorldFromXml(String pseudo) throws JAXBException {
        InputStream input = getClass().getClassLoader().getResourceAsStream(pseudo+"world.xml");
        if(input==null){
            input = getClass().getClassLoader().getResourceAsStream("world.xml");
        }
        JAXBContext jaxbContext = JAXBContext.newInstance(World.class);
        Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
        World world = (World) jaxbUnmarshaller.unmarshal(input);
        return world;
    }

    void saveWorldToXml(World world, String pseudo) throws FileNotFoundException, JAXBException {

        OutputStream output = new FileOutputStream(pseudo+"world.xml");
        JAXBContext jaxbContext = JAXBContext.newInstance(World.class);
        Marshaller m = jaxbContext.createMarshaller();       
        m.marshal(world, output);
    }
    
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public World getWorld(String pseudo) throws JAXBException{
        return this.readWorldFromXml(pseudo);
    }
}
