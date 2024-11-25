import { AppConfig } from "../types";
import { Utils } from "../utils";

export class LoadExcelClient {
    private readonly API;

    constructor(protected _appConfig: AppConfig) {
        this.API = _appConfig.httpEndpoint.slice(0, -1);
    }

    async loadExcelData() {
        const auth = await Utils.authenticate();
        let validData = false;
        let output;
        let runs = 0;
        let limit = 3;
        let errorMessage = "Could not load excel data";

        while (!validData && runs < limit) {
            runs += 1;
            try {
                const response = await fetch(this.API + '/get-excel-data', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + auth,
                    }
                });

                if (response.status !== 200) {
                    validData = false;
                    errorMessage = await response.json();
                    break;
                }

                const data = await response.json();
                
                // Parse the response body if it's a string
                output = typeof data.body === 'string' ? JSON.parse(data.body) : data;
                validData = true;

            } catch (error) {
                console.error('Attempt', runs, 'failed:', error);
            }
        }

        if (!validData) {
            throw new Error(errorMessage);
        }

        return {
            dropdowns: output?.dropdowns || {},
            records: output?.records || [],
            checkboxes: output?.checkboxes || {}
        };
    }
}
