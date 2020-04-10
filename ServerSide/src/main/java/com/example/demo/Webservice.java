package com.example.demo;

import com.google.gson.Gson;
import generated.PallierType;
import generated.ProductType;
import generated.World;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import static javax.ws.rs.HttpMethod.DELETE;
import static javax.ws.rs.HttpMethod.PUT;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
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
    static ArrayList<Long> mean = new ArrayList<>();

    public Webservice() {
        this.services = new Services();
    }

    @GET
    @Path("/world")
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public Response getXml(@Context HttpServletRequest request) throws JAXBException, IOException {
        String username = request.getHeader("X-user");
        World w = services.getWorld(username);
        services.saveWorldToXml(w, username);
        return Response.ok(w).build();
    }

    @PUT
    @Path("/product")
    @Consumes({MediaType.APPLICATION_JSON})
    public void putProduct(@Context HttpServletRequest request, ProductType product) throws FileNotFoundException, JAXBException, IOException {
        long timer = System.currentTimeMillis();
        String username = request.getHeader("X-user");
        services.updateProduct(username, product);
        long update = System.currentTimeMillis();

        mean.add(update - timer);
        if (mean.size() % 10 == 0) {
            double sum = 0;
            for (int i = 0; i < mean.size(); i++) {
                sum = sum + mean.get(i);
            }
        }
    }

    @PUT
    @Path("/manager")
    @Consumes({MediaType.APPLICATION_JSON})
    public void putManager(@Context HttpServletRequest request, PallierType manager) throws FileNotFoundException, JAXBException, IOException {
        String username = request.getHeader("X-user");
        services.updateManager(username, manager);
    }

    @PUT
    @Path("/upgrade")
    @Consumes({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public void putUpgrade(@Context HttpServletRequest request, PallierType upgrade) throws JAXBException, FileNotFoundException, IOException {
        String username = request.getHeader("X-user");
        services.updateUpgrade(username, upgrade);
    }

    @PUT
    @Path("/angelupgrade")
    @Consumes({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public void putAngelUpgrade(@Context HttpServletRequest request, PallierType ange) throws JAXBException, FileNotFoundException, IOException {
        String username = request.getHeader("X-user");
        services.updateUpgrade(username, ange);
    }

    @PUT
    @Path("world")
    public void putWorld(@Context HttpServletRequest request, World world) throws JAXBException, IOException {
        String username = request.getHeader("X-user");
        services.saveWorldToXml(world, username);
    }

    @DELETE
    @Path("/world")
    @Consumes({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public void resetWorld(String username) throws FileNotFoundException, JAXBException, IOException {
        World w = services.readWorldFromXml(username);
        double scoreToKeep = w.getScore();
        double totalangels = w.getTotalangels();
        double activeangels = 150 * Math.sqrt(w.getScore() / Math.pow(10, 15)) - totalangels;
        JAXBContext jaxbContext;

        InputStream input = getClass().getClassLoader().getResourceAsStream("world.xml");
        jaxbContext = JAXBContext.newInstance(World.class);
        Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
        World newWorld = (World) jaxbUnmarshaller.unmarshal(input);
        newWorld.setScore(scoreToKeep);
        newWorld.setTotalangels(totalangels + activeangels);
        newWorld.setActiveangels(activeangels);
        services.saveWorldToXml(newWorld, username);
    }
}
