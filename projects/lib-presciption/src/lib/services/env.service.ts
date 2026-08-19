import { Injectable, Inject } from '@angular/core';
import { ENV_CONFIG } from '../config/config.token';

@Injectable({
  providedIn: 'root'
})
export class EnvConfigService {
  
  private config: any;

  constructor(@Inject(ENV_CONFIG) public envConfig: any) {
    this.config = envConfig;
  }

  getConfig(key: string): any {
    if (this.config?.hasOwnProperty(key)) {
      return this.config[key]; 
    }
    return null;
  }
}
