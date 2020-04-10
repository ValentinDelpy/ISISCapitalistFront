/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.example.demo;

import generated.PallierType;
import generated.ProductType;
import generated.TyperatioType;
import static generated.TyperatioType.ANGE;
import static generated.TyperatioType.GAIN;
import static generated.TyperatioType.VITESSE;
import generated.World;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashSet;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

public class Services {

    public World readWorldFromXml(String pseudo) {
        World world = null;
        JAXBContext jaxbContext;
        InputStream input;
        try {
            try {
                File f = new File(pseudo + "world.xml");
                input = new FileInputStream(f);
            } catch (Exception e) {
                input = getClass().getClassLoader().getResourceAsStream("world.xml");
                System.out.println("pas de monde associé au joueur" + e.getMessage());
            }
            jaxbContext = JAXBContext.newInstance(World.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            world = (World) jaxbUnmarshaller.unmarshal(input);
        } catch (JAXBException ex) {
            System.out.println("Erreur lecture du fichier:" + ex.getMessage());
            ex.printStackTrace();
        }
        return world;
    }

    void saveWorldToXml(World world, String pseudo) throws FileNotFoundException, JAXBException {
        System.out.println("fichier créé");
        OutputStream output = new FileOutputStream(pseudo + "world.xml");
        JAXBContext jaxbContext = JAXBContext.newInstance(World.class);
        Marshaller m = jaxbContext.createMarshaller();
        m.marshal(world, output);
    }

    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public World getWorld(String pseudo) throws JAXBException, FileNotFoundException {
        World w = this.readWorldFromXml(pseudo);
        for (ProductType pt : w.getProducts().getProduct()) {
            if (!pt.isManagerUnlocked()) {
                if (pt.getTimeleft() != 0) {
                    if (pt.getTimeleft() < (System.currentTimeMillis() - w.getLastupdate())) {
                        w.setScore(w.getScore() + pt.getRevenu());
                    } else {
                        pt.setTimeleft(pt.getTimeleft() - (System.currentTimeMillis() - w.getLastupdate()));
                    }
                }
            } else {
                long time = System.currentTimeMillis() - w.getLastupdate();
                long nb_prod = (time / pt.getVitesse());
                long time_left = (time % pt.getVitesse());
                w.setScore(w.getScore() + pt.getRevenu() * nb_prod);
                pt.setTimeleft(time_left);
            }
        }

        w.setLastupdate(System.currentTimeMillis());
        this.saveWorldToXml(w, pseudo);
        return this.readWorldFromXml(pseudo);
    }

    public Boolean updateProduct(String username, ProductType newproduct) throws FileNotFoundException, JAXBException {
        World world = getWorld(username);
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
            double cout = (product.getCout() * (1 - Math.pow(product.getCroissance(), newproduct.getQuantite()))) / (1 - product.getCroissance());
            world.setMoney(world.getMoney() - cout);
            product.setQuantite(product.getQuantite() + newproduct.getQuantite());
        } else {
            product.setTimeleft(product.getVitesse());
            product.setQuantite(newproduct.getQuantite());
        }
        for (PallierType pl : product.getPalliers().getPallier()) {
            if (pl.getSeuil() <= product.getQuantite() && !pl.isUnlocked()) {
                pl.setUnlocked(true);
                if (pl.getTyperatio() == VITESSE) {
                    product.setVitesse((int) (product.getVitesse() * pl.getRatio()));
                } else if (pl.getTyperatio() == GAIN) {
                    product.setRevenu(product.getRevenu() * pl.getRatio());
                }
            }
        }
        // sauvegarder les changements du monde
        this.saveWorldToXml(world, username);
        return true;
    }


    public Boolean updateUpgrade(String username, PallierType upgrade) throws JAXBException, FileNotFoundException {
        World w = getWorld(username);
        PallierType u = findUpgradeByName(w, upgrade.getName());
        ProductType product = findProductById(w, upgrade.getIdcible());
        TyperatioType type = u.getTyperatio();

        //On vérifie que l'upgrade existe. Si elle n'existe pas
        //Il n'y a pas besoin d'effectuer tous les tests suivants.
        if(u == null){ return false; }
        //Cette upgrade ne touche que les anges.
        //Par sécurité, on vérifie bien que le Typeratio est ANGE
        if (upgrade.getRatio() == -1) {
            if (type == ANGE) {
                w.setAngelbonus((int) (w.getAngelbonus() + upgrade.getRatio()));
            }
        //On applique ici l'upgrade à tous les produits du monde.
        } else if (upgrade.getRatio() == 0) {
            for (ProductType prod : w.getProducts().getProduct()) {
                switch (type) {
                    case VITESSE:
                        prod.setVitesse((int) (prod.getVitesse() * upgrade.getRatio()));
                    case GAIN:
                        prod.setRevenu(prod.getRevenu() * upgrade.getRatio());
                }
            }
        } else {
            //On cherche le produit associé à l'upgrade
            for (ProductType p : w.getProducts().getProduct()) {
                if (p.getId() == upgrade.getIdcible()) {
                    product = p;
                }
            }
            if (product == null) { return false; }
            
            //Si le produit existe, on vient lui appliquer les upgrades.
            switch (type) {
                case VITESSE:
                    product.setVitesse((int) (product.getVitesse() * upgrade.getRatio()));
                case GAIN:
                    product.setRevenu(product.getRevenu() * upgrade.getRatio());
                case ANGE:
                    w.setAngelbonus((int) (w.getAngelbonus() + upgrade.getRatio()));
            }
        }


        upgrade.setUnlocked(true);
        this.saveWorldToXml(w, username);
        return true;
    }

    // prend en paramètre le pseudo du joueur et le manager acheté.
// renvoie false si l’action n’a pas pu être traitée
    public Boolean updateManager(String username, PallierType newmanager) throws FileNotFoundException, JAXBException {
        System.out.println(username);
        // aller chercher le monde qui correspond au joueur
        World world = getWorld(username);
        // trouver dans ce monde, le manager équivalent à celui passé
        // en paramètre
        PallierType manager = findManagerByName(world, newmanager.getName());
        if (manager == null) {
            return false;
        }
        ProductType product = findProductById(world, manager.getIdcible());
        if (product == null) {
            return false;
        }
        world.setMoney(world.getMoney() - manager.getSeuil());
        product.setManagerUnlocked(true);
        manager.setUnlocked(true);
        this.saveWorldToXml(world, username);
        return true;
    }

    private ProductType findProductById(World world, int id) {
        ProductType pt = null;
        for (ProductType p : world.getProducts().getProduct()) {
            if (p.getId() == id) {
                pt = p;
            }
        }
        return pt;
    }

    private PallierType findUpgradeByName(World world, String name) {
        PallierType pt = null;
        for (PallierType p : world.getUpgrades().getPallier()) {
            if (p.getName().equals(name)) {
                pt = p;
            }
        }
        for (PallierType p : world.getAllunlocks().getPallier()) {
            if (p.getName().equals(name)) {
                pt = p;
            }
        }
        for (PallierType p : world.getAngelupgrades().getPallier()) {
            if (p.getName().equals(name)) {
                pt = p;
            }
        }
        return pt;
    }

    private PallierType findManagerByName(World world, String name) {
        PallierType pt = null;
        for (PallierType p : world.getManagers().getPallier()) {
            if (p.getName().equals(name)) {
                pt = p;
            }
        }
        return pt;
    }

}
