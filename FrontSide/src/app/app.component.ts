import { Component } from '@angular/core';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ISISCapitalist';
  world: World = new World();
  server: Promise<World>;
  constructor(private service: RestserviceService) {
    this.server = service.getWorld();
    service.getWorld().then(

    world => {
      this.world = world;
    });
  }

}

