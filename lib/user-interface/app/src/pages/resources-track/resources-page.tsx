import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../common/app-context';
import { LoadExcelClient } from '../../common/api-client/load-excel';
import {
  Box,
  Button,
  ColumnLayout,
  FormField,
  Header,
  Select,
  Table,
} from '@cloudscape-design/components';
import '../../styles/resources.css';


const ResourcesPage: React.FC = () => {
  // Access AppContext and create an instance of LoadExcelClient
  const appContext = useContext(AppContext);
  const loadExcelClient = new LoadExcelClient(appContext);

  // State Management
  const [data, setData] = useState<any[]>([]); // Raw data records
  const [dropdownOptions, setDropdownOptions] = useState<{ [key: string]: { label: string; value: string }[] }>({});
  const [dropdowns, setDropdowns] = useState<{ [key: string]: { label: string; value: string } | null }>({});
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const jsonData = await loadExcelClient.loadExcelData();

        console.log('Fetched data:', jsonData);

        // Extract dropdown options
        const validDropdowns = jsonData.dropdowns || {};
        const validRecords = jsonData.records || [];

        setData(validRecords);

        // Transform dropdown options for Cloudscape Select
        const transformedDropdowns = Object.keys(validDropdowns).reduce((acc, key) => {
          acc[key] = validDropdowns[key].map((option: string) => ({
            label: option,
            value: option,
          }));
          return acc;
        }, {} as { [key: string]: { label: string; value: string }[] });

        setDropdownOptions(transformedDropdowns);

        // Initialize dropdown states
        const initialDropdowns = Object.keys(validDropdowns).reduce((acc, key) => {
          acc[key] = null; // Set default value to null
          return acc;
        }, {} as { [key: string]: { label: string; value: string } | null });

        setDropdowns(initialDropdowns);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loadExcelClient]);

  // Handle dropdown changes
  const handleDropdownChange = (key: string, selectedOption: { label: string; value: string }) => {
    setDropdowns((prev) => ({
      ...prev,
      [key]: selectedOption,
    }));
  };

  // Filter data based on dropdown selections
  const filterData = () => {
    let filtered = [...data];

    // Apply dropdown filters
    for (const [key, value] of Object.entries(dropdowns)) {
      if (value && value.value) {
        filtered = filtered.filter((item) => item[key] === value.value);
      }
    }

    setFilteredData(filtered);
  };

  // Display loading or error states
  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="App">
      <Header>Filter Grants and Programs</Header>

      <Box margin={{ bottom: 'l' }}>
        <ColumnLayout columns={2} borders="vertical">
          {/* Render Dropdowns */}
          {Object.entries(dropdownOptions).map(([key, options]) => (
            <FormField key={key} label={`Filter by ${key}`}>
              <Select
                selectedOption={dropdowns[key]}
                onChange={({ detail }) => {
                  const selectedOption = detail.selectedOption;
                  if (selectedOption && selectedOption.label && selectedOption.value) {
                    handleDropdownChange(key, { label: selectedOption.label, value: selectedOption.value });
                  }
                }}
                options={options}
                placeholder="Select an option"
              />
            </FormField>
          ))}
        </ColumnLayout>
      </Box>

      <Button variant="primary" onClick={filterData}>
        Filter Results
      </Button>

      <Box margin={{ top: 'l' }}>
        {filteredData.length > 0 ? (
          <Table
            header={<Header>Filtered Results</Header>}
            columnDefinitions={Object.keys(data[0]).map((key) => ({
              header: key,
              cell: (item: any) => item[key],
            }))}
            items={filteredData}
          />
        ) : (
          <p>No matching records found.</p>
        )}
      </Box>
    </div>
  );
};

export default ResourcesPage;
