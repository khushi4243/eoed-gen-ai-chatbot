import React, { useState, useEffect, useContext, useMemo } from 'react';
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
  Spinner,
  Alert,
  Checkbox,
} from '@cloudscape-design/components';
import '../../styles/resources.css';

const ResourcesPage: React.FC = () => {
  const appContext = useContext(AppContext);
  const loadExcelClient = useMemo(() => new LoadExcelClient(appContext), [appContext]);

  const [data, setData] = useState<any[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<{ [key: string]: { label: string; value: string }[] }>({});
  const [dropdowns, setDropdowns] = useState<{ [key: string]: { label: string; value: string } | null }>({});
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [checkboxSelections, setCheckboxSelections] = useState<{ [key: string]: Set<string> }>({});
  const [checkboxOptions, setCheckboxOptions] = useState<{ [key: string]: string[] }>({});

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const jsonData = await loadExcelClient.loadExcelData();

        const validDropdowns = jsonData.dropdowns || {};
        const validRecords = jsonData.records || [];
        const validCheckboxes = jsonData.checkboxes || {};

        console.log('Fetched Checkboxes:', jsonData.checkboxes);

        // Transform dropdown options for Cloudscape Select
        const transformedDropdowns = Object.keys(validDropdowns).reduce((acc, key) => {
          acc[key] = [
            { label: "No selection", value: "" },  // Add empty option
            ...validDropdowns[key].map((option: string) => ({
              label: option.toString(),
              value: option.toString(),
            }))
          ];
          return acc;
        }, {});
        setDropdownOptions(transformedDropdowns);

        // Store the checkbox options
        setCheckboxOptions(validCheckboxes);

        // Initialize checkbox states
        const initialCheckboxSelections = Object.keys(validCheckboxes).reduce((acc, key) => {
          acc[key] = new Set(); // Initialize each group as an empty Set
          return acc;
        }, {});
        setCheckboxSelections(initialCheckboxSelections);

        // Initialize dropdown states
        const initialDropdowns = Object.keys(validDropdowns).reduce((acc, key) => {
          acc[key] = null;
          return acc;
        }, {});
        setDropdowns(initialDropdowns);

        // Set data
        setData(validRecords);
        setFilteredData(validRecords);
      } catch (err) {
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

  // Filter data based on dropdown and checkbox selections
  const filterData = () => {
    let filtered = [...data];
    console.log('Starting filter with records:', filtered.length);

    // Apply dropdown filters (AND logic)
    // Records must match ALL selected dropdown values
    const activeDropdowns = Object.entries(dropdowns).filter(([_, value]) => value !== null);
    if (activeDropdowns.length > 0) {
      filtered = filtered.filter(item => {
        return activeDropdowns.every(([_, value]) => {
          if (!value?.value) return true;
          return item[value.value] === 1;
        });
      });
    }

    // Apply checkbox filters (OR logic across all checkbox categories)
    // Records are included if they match ANY selected checkbox
    const activeCheckboxes = Object.entries(checkboxSelections)
      .filter(([_, selections]) => selections.size > 0)
      .map(([group, selections]) => Array.from(selections))
      .flat();

    if (activeCheckboxes.length > 0) {
      filtered = filtered.filter(item => {
        // Check if the item matches ANY of the selected checkboxes
        return activeCheckboxes.some(selection => item[selection] === 1);
      });
    }

    console.log('Final filtered count:', filtered.length);
    setFilteredData(filtered);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spinner size="large" />
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" header="Error loading data">
        {error}
      </Alert>
    );
  }

  if (!data.length || !Object.keys(dropdownOptions).length) {
    return <p>No data available to display.</p>;
  }

  return (
    <div className="App">
          <Header>
            Filter Grants and Programs
          </Header>

        {/* Dropdown Filters */}
        <Box margin={{ bottom: 'l' }}>
          <ColumnLayout columns={2} borders="vertical">
            {Object.entries(dropdownOptions).map(([key, options]) => (
              <FormField key={key} label={`Filter by ${key}`}>
                <Select
                  selectedOption={dropdowns[key] || { label: "No selection", value: "" }}
                  onChange={({ detail }) => {
                    const selectedOption = detail.selectedOption;
                    if (selectedOption.value === "") {
                      // Handle empty selection
                      handleDropdownChange(key, null);
                    } else if (selectedOption) {
                      handleDropdownChange(key, { label: selectedOption.label, value: selectedOption.value });
                    }
                  }}
                  options={options}
                  placeholder={`Select ${key}`}
                />
              </FormField>
            ))}
          </ColumnLayout>
        </Box>

        {/* Checkbox Filters */}
        <Box margin={{ bottom: 'l' }}>
          {Object.entries(checkboxOptions).map(([group, options]) => (
            <Box key={group} margin={{ bottom: 'm' }}>
              <Header>{`Filter by ${group}`}</Header>
              {options.length > 0 ? (
                options.map((option) => (
                  <Checkbox
                    key={`${group}-${option}`}
                    checked={checkboxSelections[group]?.has(option) || false}
                    onChange={({ detail }) => {
                      setCheckboxSelections((prev) => {
                        const updated = new Set(prev[group]);
                        if (detail.checked) {
                          updated.add(option);
                        } else {
                          updated.delete(option);
                        }
                        return { ...prev, [group]: updated };
                      });
                    }}
                  >
                    {option}
                  </Checkbox>
                ))
              ) : (
                <p>No options available for {group}</p>
              )}
            </Box>
          ))}
        </Box>

        {/* Filter Results Button */}
        <Box textAlign="center" margin={{ bottom: 'l' }}>
          <Button variant="primary" onClick={filterData}>
            Filter Results
          </Button>
        </Box>

        {/* Filtered Data Table */}
        <Box margin={{ top: 'l' }}>
          {filteredData.length > 0 ? (
            <Table
              header={<Header>Filtered Results</Header>}
              columnDefinitions={[
                {
                  id: 'Agency',
                  header: 'Agency',
                  cell: (item) => item['Agency'] || '-',
                },
                {
                  id: 'Resource Name',
                  header: 'Resource Name',
                  cell: (item) => item['Resource Name'] || '-',
                },
              ]}
              items={filteredData}
              wrapLines
              stripedRows
            />
          ) : (
            <p>No matching records found.</p>
          )}
        </Box>
    </div>
  );
};
export default ResourcesPage;
