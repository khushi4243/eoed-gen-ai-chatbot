import React, { useState, useEffect, useContext } from 'react';
import { LoadExcelClient } from '../../common/api-client/load-excel'; 
import { AppContext } from "../../common/app-context";
import '../../styles/resources.css';

const ResourcesPage: React.FC = () => {
  // Access the AppContext and create an instance of the LoadExcelClient
  const appContext = useContext(AppContext);
  const loadExcelClient = new LoadExcelClient(appContext);

  // States for dropdowns, checkboxes, raw data, and filtered data
  const [data, setData] = useState<any[]>([]); // Raw data records
  const [dropdownOptions, setDropdownOptions] = useState<{ [key: string]: string[] }>({});
  const [checkboxOptions, setCheckboxOptions] = useState<{ [key: string]: string[] }>({});
  const [dropdowns, setDropdowns] = useState<{ [key: string]: string }>({});
  const [checkboxes, setCheckboxes] = useState<{ [key: string]: { [option: string]: boolean } }>({});
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use the loadExcelData method from LoadExcelClient
        const jsonData = await loadExcelClient.loadExcelData();

        console.log("Fetched data:", jsonData);

        // Update state with fetched data
        const validDropdowns = jsonData.dropdowns || {};
        const validCheckboxes = jsonData.checkboxes || {};
        const validRecords = jsonData.records || [];

        setData(validRecords);
        setDropdownOptions(validDropdowns);
        setCheckboxOptions(validCheckboxes);

        // Initialize dropdowns and checkboxes state
        const initialDropdowns: { [key: string]: string } = {};
        Object.keys(jsonData.dropdowns).forEach((key) => {
          initialDropdowns[key] = ''; // Set initial value to empty string
        });
        setDropdowns(initialDropdowns);

        const initialCheckboxes: any = {};
        for (const [key, options] of Object.entries(jsonData.checkboxes)) {
          initialCheckboxes[key] = {};
          (options as string[]).forEach((option: string) => {
            initialCheckboxes[key][option] = false;
          });
        }
        setCheckboxes(initialCheckboxes);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loadExcelClient]);

  // Handle dropdown changes
  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>, key: string) => {
    setDropdowns(prev => ({ ...prev, [key]: event.target.value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, key: string, option: string) => {
    setCheckboxes(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [option]: event.target.checked,
      },
    }));
  };

  // Filter data based on user inputs
  const filterData = () => {
    let filtered = [...data];

    // Apply dropdown filters
    for (const [key, value] of Object.entries(dropdowns)) {
      if (value) {
        filtered = filtered.filter(item => item[key] === value);
      }
    }

    // Apply checkbox filters
    for (const [key, options] of Object.entries(checkboxes)) {
      const selectedOptions = Object.entries(options)
        .filter(([_, checked]) => checked)
        .map(([option, _]) => option);

      if (selectedOptions.length > 0) {
        filtered = filtered.filter(item => selectedOptions.includes(item[key]));
      }
    }

    setFilteredData(filtered);
  };

  // Display loading and error states
  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="App">
      <h1>Filter Grants and Programs</h1>

      <div className="filter-section">
        {/* Render Dropdowns */}
        {Object.entries(dropdownOptions).map(([key, options]) => (
          <div key={key}>
            <h2>{key}</h2>
            <select value={dropdowns[key] || ''} onChange={(e) => handleDropdownChange(e, key)}>
              <option value="">Select...</option>
              {options.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Render Checkboxes */}
        {Object.entries(checkboxOptions).map(([key, options]) => (
          <div key={key}>
            <h2>{key}</h2>
            <div className="checkbox-group">
              {options.map((option, idx) => (
                <label key={idx}>
                  <input
                    type="checkbox"
                    checked={checkboxes[key][option] || false}
                    onChange={(e) => handleCheckboxChange(e, key, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={filterData}>Filter Results</button>

      <div className="output-section">
        {filteredData.length > 0 ? (
          <table>
            <thead>
              <tr>
                {/* Adjust columns as necessary */}
                {Object.keys(data[0]).map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((value, idx2) => (
                    <td key={idx2}>{value as React.ReactNode}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No matching records found.</p>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
