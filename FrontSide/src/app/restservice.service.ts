import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { World, Pallier, Product} from './world';

@Injectable({
  providedIn: 'root'
})
export class RestserviceService {
  constructor(private http: HttpClient) {}
  server = 'http://localhost:8080/';
  private _user = '';
  

  public getUser() {
    return this._user;
  }
  public setUser(value) {
    this._user = value;
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
  
  getWorld(): Promise<World> {
    return this.http.get(this.server + 'adventureisis/api/world',{headers:this.setHeaders(this._user)})
      .toPromise().catch(this.handleError);
  }
  /*getWorld(): Promise<World> {
    return this.http.get(this.server + "adventureisis/api/world", { headers:this.setHeaders(this._user)}).toPromise().catch(this.handleError);};*/

    // getWorld(): Promise<World> {
    //   console.log("username:"+this.getUser())
    //   let headers = this.setHeaders(this.getUser())
    //   return this.http.get(this.server + "api/world", {
    //     headers: headers
    //   })
    //     .toPromise().then(response => response)
    //     .catch(this.handleError);
    // };

  getServer(): string{
    return this.server;
  }

  private setHeaders(user: string): HttpHeaders {
    var headers = new HttpHeaders({ 'X-User': user});
    return headers;
  };

  putProduit(product: Product): Promise<Response> {
    return this.http.put(this.server + "adventureisis/api/product", product, {
      headers: this.setHeaders(this.getUser())
    })
      .toPromise().then(response => response).catch(this.handleError);
  };

  public putManager(manager: Pallier): Promise<Response> {
    // console.log(upgrade);
     return this.http
       .put(this.server + "adventureisis/api/manager", manager, {
         headers: { "X-user": this.getUser() }
       })
       .toPromise()
       .then(response => response)
       .catch(this.handleError);
   }

   public saveWorld(world: World): Promise<Response> {
    console.log(this.getUser());
    return this.http
      .put(this.server + "adventureisis/generic/world", world, {
        headers: { "X-user": this.getUser() }
      })
      .toPromise().then(response => response).catch(this.handleError);
      
  };

  public deleteWorld(): Promise<Response> {
    
    return this.http.delete(this.server + "adventureisis/generic/world", {
        headers: this.setHeaders(this.getUser())
      })
      .toPromise().then(response => response)
      .catch(this.handleError);
  }
}
