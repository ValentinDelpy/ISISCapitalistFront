package com.example.demo;

import generated.World;
import java.io.FileNotFoundException;
import javax.xml.bind.JAXBException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) throws JAXBException, FileNotFoundException {
		SpringApplication.run(DemoApplication.class, args);
	}

}
