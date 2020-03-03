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
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

/**
 *
 * @author ssylvest
 */
public class Services {

    World readWorldFromXml() throws JAXBException {

        
        InputStream input = getClass().getClassLoader().getResourceAsStream("world.xml");
        JAXBContext jaxbContext = JAXBContext.newInstance(World.class);
        Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
        World world = (World) jaxbUnmarshaller.unmarshal(input);
        return world;
    }

    void saveWorldToXml(World world) throws FileNotFoundException {

        OutputStream output = new FileOutputStream("world.xml");

    }
}
