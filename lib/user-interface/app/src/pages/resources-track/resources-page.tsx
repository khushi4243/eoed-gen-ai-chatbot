import React, { useState, useEffect, useContext } from 'react';
import { ApiClient } from '../../common/api-client/api-client'; // Import the ApiClient
import { AppContext } from "../../common/app-context";
import '../../styles/resources.css';

interface Dropdowns {
  [key: string]: string;
}

interface Checkboxes {
  [key: string]: boolean[];
}

interface DataRow {
  // Define the structure of DataRow based on your data
  id: number;
  name: string;
  value: string;
  // Add other fields as necessary
}

const ResourcesPage: React.FC = () => {
  // Access the AppContext and create an instance of the ApiClient  
  const appContext = useContext(AppContext)
  const apiClient = new ApiClient(appContext);

  // States for dropdowns, checkboxes, raw data, and filtered data
  const [data, setData] = useState<DataRow[]>([]); // Raw data from backend
  const [dropdowns, setDropdowns] = useState<Dropdowns>({ "Life Cycle": '', Size: '' });
  const [checkboxes, setCheckboxes] = useState<Checkboxes>({
    Category: new Array(9).fill(false),
    "Grow Operations": new Array(7).fill(false),
    "Construct-New (Land)": new Array(3).fill(false),
    "Construct-Existing (Land)": new Array(3).fill(false),
  });
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the Excel data from the S3 bucket via the ApiClient on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Access the KnowledgeManagementClient via ApiClient
        const knowledgeManagementClient = apiClient.knowledgeManagement;

        // Use the getDocuments() method to fetch data
        const response = await knowledgeManagementClient.getDocuments();
        const excelData: DataRow[] = response.data; // Ensure response.data contains the Excel rows
        console.log("Fetched data:", excelData);

        setData(excelData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiClient]);

  // Handle dropdown changes
  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>, key: string) => {
    setDropdowns(prev => ({ ...prev, [key]: event.target.value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (index: number, key: string) => {
    setCheckboxes(prev => {
      const updated = [...prev[key]];
      updated[index] = !updated[index];
      return { ...prev, [key]: updated };
    });
  };

  // Filter data based on user inputs
  const filterData = () => {
    let filtered = [...data];

    // Apply dropdown filtering
    Object.entries(dropdowns).forEach(([key, value]) => {
      if (value) {
        // Adjust logic based on your data structure
        const colIndex = parseInt(value, 10); // Replace with correct logic
        filtered = filtered.filter(row => row[colIndex] === 1);
      }
    });

    // Apply checkbox OR logic
    Object.entries(checkboxes).forEach(([key, values]) => {
      const selectedColumns = values
        .map((checked, idx) => (checked ? idx : -1)) // Replace with correct index logic
        .filter(idx => idx !== -1);

      if (selectedColumns.length) {
        filtered = filtered.filter(row =>
          selectedColumns.some(colIndex => row[colIndex] === 1)
        );
      }
    });

    setFilteredData(filtered);
  };

  // Display loading and error states
  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="App">
      <h1>Filter Grants and Programs</h1>

      <div className="filter-section">
        <h2>Business Category</h2>
        <div className="checkbox-group">
          {checkboxes.Category.map((checked, idx) => (
            <label key={idx}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleCheckboxChange(idx, "Category")}
              />
              {`Category ${idx + 1}`}
            </label>
          ))}
        </div>

        <h2>Life Cycle</h2>
        <select
          value={dropdowns["Life Cycle"]}
          onChange={(e) => handleDropdownChange(e, "Life Cycle")}
        >
          <option value="">Select...</option>
          <option value="0">Startup</option>
          <option value="1">Growth</option>
        </select>

        <h2>Size</h2>
        <select
          value={dropdowns.Size}
          onChange={(e) => handleDropdownChange(e, "Size")}
        >
          <option value="">Select...</option>
          <option value="0">Small</option>
          <option value="1">Large</option>
        </select>

        <h2>Grow Operations</h2>
        <div className="checkbox-group">
          {checkboxes["Grow Operations"].map((checked, idx) => (
            <label key={idx}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleCheckboxChange(idx, "Grow Operations")}
              />
              {`Grow Operation ${idx + 1}`}
            </label>
          ))}
        </div>
        {/* Add sections for other categories as needed */}
      </div>

      <button onClick={filterData}>Filter Results</button>

      <div className="output-section">
        {filteredData.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Column 1</th>
                <th>Column 2</th>
                <th>Column 3</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
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
