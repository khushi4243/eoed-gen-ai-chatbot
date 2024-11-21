import { AppConfig } from "../types";
import { Utils } from "../utils";

export class LoadExcelClient {
    private readonly API;
    constructor(protected _appConfig: AppConfig) {
        this.API = _appConfig.httpEndpoint.slice(0, -1);
        console.log('API Endpoint:', this.API + '/get-excel-data');
    }

    async loadExcelData(): Promise<any> {
        const auth = await Utils.authenticate();
        try {
          const response = await fetch(
            this.API + '/get-excel-data',
            {
              method: 'GET',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth,
            },
            }
          );
      
          if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
      
          const data = await response.json();
          console.log('API Response Data:', data);
          return data;
        } catch (error) {
          console.error('Error in loadExcelData:', error.message);
          throw error; // Propagate error to caller
        }
      }
}
