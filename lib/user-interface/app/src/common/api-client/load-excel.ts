import { AppConfig } from "../types";
import { Utils } from "../utils";

export class LoadExcelClient {
    private readonly API;
    constructor(protected _appConfig: AppConfig) {
        this.API = _appConfig.httpEndpoint.slice(0, -1);
        console.log('API Endpoint:', this.API + '/get-excel-data');
    }

    async loadExcelData(): Promise<any> {
        try {
            const auth = await Utils.authenticate();
            const response = await fetch(this.API + '/get-excel-data', {
                method: 'POST',  // Change to 'GET' if your API expects GET
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth
                }
            });

            console.log('Response Status:', response.status);
            console.log('Response Headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response Error Body:', errorText);
                throw new Error(`Failed to fetch Excel data: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching Excel data:', error);
            throw error;
        }
    }
}
