import { AppConfig } from "../types";
import { Utils } from "../utils";

export class LoadExcelClient {
    private readonly API;
    constructor(protected _appConfig: AppConfig) {
        this.API = _appConfig.httpEndpoint.slice(0,-1);
}

    async loadExcelData(): Promise<any> {
        try {
            const auth = await Utils.authenticate();
            const response = await fetch(this.API + '/get-excel-data', {
                method: 'POST',  // Use 'GET' if your API is set up that way
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch Excel data');
            }

            const data = await response.json();
            return data;  // This should be the preprocessed data from the Lambda function
        } catch (error) {
            console.error('Error fetching Excel data:', error);
            throw error;
        }
    }
}
    // async loadExcel(fileName: string, fileType : string): Promise<string> {    
    //     if (!fileType) {
    //         alert('Must have valid file type!');
    //         return;
    //     }

    //     try {
    //         const auth = await Utils.authenticate();
    //         const response = await fetch(this.API + '/signed-url', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization' : auth
    //             },
    //             body: JSON.stringify({ fileName, fileType })
    //         });

    //         if (!response.ok) {
    //             throw new Error('Failed to get upload URL');
    //         }

    //         const data = await response.json();
    //         return data.signedUrl;
    //     } catch (error) {
    //         console.error('Error:', error);
    //         throw error;
    //     }
    // }
