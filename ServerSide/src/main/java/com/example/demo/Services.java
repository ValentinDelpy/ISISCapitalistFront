/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.example.demo;

import generated.PallierType;
import generated.ProductType;
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
        InputStream input = getClass().getClassLoader().getResourceAsStream(pseudo + "world.xml");
        if (input == null) {
            input = getClass().getClassLoader().getResourceAsStream("world.xml");
        }
        JAXBContext jaxbContext = JAXBContext.newInstance(World.class);
        Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
        World world = (World) jaxbUnmarshaller.unmarshal(input);
        return world;
    }

    void saveWorldToXml(World world, String pseudo) throws FileNotFoundException, JAXBException {

        OutputStream output = new FileOutputStream(pseudo + "world.xml");
        JAXBContext jaxbContext = JAXBContext.newInstance(World.class);
        Marshaller m = jaxbContext.createMarshaller();
        m.marshal(world, output);
    }

    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public World getWorld(String pseudo) throws JAXBException {
        return this.readWorldFromXml(pseudo);
    }

    public Boolean updateProduct(String username, ProductType newproduct) throws FileNotFoundException, JAXBException {
        // aller chercher le monde qui correspond au joueur
        World world = getWorld(username);
        // trouver dans ce monde, le produit équivalent à celui passé
        // en paramètre
        ProductType product = findProductById(world, newproduct.getId());
        if (product == null) {
            return false;
        }

        // calculer la variation de quantité. Si elle est positive c'est
        // que le joueur a acheté une certaine quantité de ce produit
        // sinon c’est qu’il s’agit d’un lancement de production.
        int qtchange = newproduct.getQuantite() - product.getQuantite();
        if (qtchange > 0) {
            // soustraire de l'argent du joueur le cout de la quantité
            // achetée et mettre à jour la quantité de product

        } else {
            // initialiser product.timeleft à product.vitesse
            // pour lancer la production
        }
        // sauvegarder les changements du monde
        this.saveWorldToXml(world, username);
        return true;
    }

    // prend en paramètre le pseudo du joueur et le manager acheté.
// renvoie false si l’action n’a pas pu être traitée
    public Boolean updateManager(String username, PallierType newmanager) throws FileNotFoundException, JAXBException {
        // aller chercher le monde qui correspond au joueur
        World world = getWorld(username);
        // trouver dans ce monde, le manager équivalent à celui passé
        // en paramètre
        PallierType manager = findManagerByName(world, newmanager.getName());
        if (manager == null) {
            return false;
        }

        // débloquer ce manager
        // trouver le produit correspondant au manager
        ProductType product = findProductById(world, manager.getIdcible());
        if (product == null) {
            return false;
        }
        // débloquer le manager de ce produit

        // soustraire de l'argent du joueur le cout du manager
        // sauvegarder les changements au monde
        this.saveWorldToXml(world, username);
        return true;
    }

    private ProductType findProductById(World world, int id) {
        ProductType pt = null;
            for(ProductType p : world.getProducts().getProduct()){
                if(p.getId()==id){
                    pt = p;
                }
            }
        return pt;
    }

    private PallierType findManagerByName(World world, String name) {
            PallierType pt = null;
            for(PallierType p : world.getUpgrades().getPallier()){
                if(p.getName().equals(name)){
                    pt = p;
                }
            }
        return pt;
    }

}
