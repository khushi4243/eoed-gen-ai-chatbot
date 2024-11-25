import { AppConfig } from "../types";
import { Utils } from "../utils";

export class LoadExcelClient {
    private readonly appContext: AppContext;

    constructor(appContext: AppContext) {
        this.appContext = appContext;
    }

    async loadExcelData() {
        try {
            const response = await fetch('https://g16qwekzne.execute-api.us-east-1.amazonaws.com/get-excel-data', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Parse the response body if it's a string
            const parsedData = typeof data.body === 'string' ? JSON.parse(data.body) : data;
            
            return {
                dropdowns: parsedData.dropdowns || {},
                records: parsedData.records || [],
                checkboxes: parsedData.checkboxes || {}
            };
        } catch (error) {
            console.error('Error in loadExcelData:', error);
            throw error;
        }
    }
}
