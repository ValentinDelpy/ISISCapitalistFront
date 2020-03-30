import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { World, Product, Pallier } from './world';


@Injectable({
  providedIn: 'root'
})
export class RestserviceService {

  server = 'http://localhost:8080/';
  user = '';

  constructor(private http: HttpClient) { }

  public getUser(): string {
    return this.user;
  }
  public setUser(user: string) {
    this.user = user;
  }

  public getServer(): string {
    return this.server;
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  getWorld(): Promise<World> {

    const headers = this.setHeaders(this.getUser());
    return this.http.get(this.server + 'adventureisis/api/world', {
      headers
    })
      .toPromise().then(response => response)
      .catch(this.handleError);
  }

  private setHeaders(user: string): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.append('X-User', user);
    return headers;
  }

  putManager(manager: Pallier): Promise<Response> {
    return this.http.put(this.server + 'adventureisis/api/world', manager, {
      headers: this.setHeaders(this.user)
    })
      .toPromise().then(response => response)
      .catch(this.handleError);
  }

  putProduit(product: Product): Promise<Response> {
    return this.http.put(this.server + 'adventureisis/api/world', product, {
      headers: this.setHeaders(this.user)
    })
      .toPromise().then(response => response).catch(this.handleError);
  }

  public saveWorld(world: World): Promise<Response> {
    console.log(this.getUser());
    return this.http
      .put(this.server + 'adventureisis/api/world', world, {
        headers: { 'X-user': this.getUser() }
      })
      .toPromise().then(response => response).catch(this.handleError);

  }

  public deleteWorld(): Promise<Response> {

    return this.http.delete(this.server + 'adventureisis/api/world', {
      headers: this.setHeaders(this.getUser())
    })
      .toPromise().then(response => response)
      .catch(this.handleError);
  }
}
