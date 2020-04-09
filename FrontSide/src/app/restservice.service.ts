import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
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
    return this.http.get(this.server + 'adventureisis/api/world')
      .toPromise().catch(this.handleError);
  }

  getServer(): string{
    return this.server;
  }
}
