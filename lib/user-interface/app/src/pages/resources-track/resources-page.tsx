import React, { useState } from 'react';
import AWS from 'aws-sdk';


function FilterComponent() {
  // Define headings with column indexes as per your Excel structure
  const headings = {
    Category: { start: 4, end: 12 },
    LifeCycle: { start: 12, end: 16 },
    Size: { start: 16, end: 23 },
    GrowOperations: { start: 25, end: 32 },
    ConstructNew: { start: 34, end: 37 },
    ConstructExisting: { start: 38, end: 41 },
  };

  const [dropdowns, setDropdowns] = useState({ LifeCycle: '', Size: '' });
  const [checkboxes, setCheckboxes] = useState({
    Category: new Array(8).fill(false),
    GrowOperations: new Array(7).fill(false),
    ConstructNew: new Array(3).fill(false),
    ConstructExisting: new Array(3).fill(false),
  });
  const [filteredData, setFilteredData] = useState([]);

  const handleDropdownChange = (event, heading) => {
    setDropdowns({ ...dropdowns, [heading]: event.target.value });
  };

  const handleCheckboxChange = (index, heading) => {
    const updatedCheckboxes = { ...checkboxes };
    updatedCheckboxes[heading][index] = !updatedCheckboxes[heading][index];
    setCheckboxes(updatedCheckboxes);
  };

  const filterData = () => {
    let filtered = data;

    // Filter for dropdown selections (LifeCycle and Size)
    Object.entries(dropdowns).forEach(([heading, value]) => {
      if (value) {
        const colIndex = headings[heading].start + dropdowns[heading];
        filtered = filtered.filter(row => row[colIndex] === 1);
      }
    });

    // OR logic for checkbox selections
    const orConditions = [];
    Object.entries(checkboxes).forEach(([heading, values]) => {
      const selectedColumns = values.map((isSelected, idx) => 
        isSelected ? headings[heading].start + idx : -1
      ).filter(idx => idx !== -1);

      if (selectedColumns.length) {
        const condition = row => selectedColumns.some(colIndex => row[colIndex] === 1);
        orConditions.push(filtered.filter(condition));
      }
    });

    // Apply OR conditions
    const combinedFiltered = orConditions.length
      ? filtered.filter(row => orConditions.some(condition => condition(row)))
      : filtered;

    setFilteredData(combinedFiltered.slice(0, 3)); // Display only the first three columns
  };

  return (
    <div className="filter-container">
      <h2>Business Category (Select Multiple):</h2>
      <div className="checkbox-section">
        {checkboxes.Category.map((isChecked, index) => (
          <label key={index}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleCheckboxChange(index, "Category")}
            />
            {`Category ${index + 1}`}
          </label>
        ))}
      </div>

      <h2>Life Cycle (Select One):</h2>
      <select value={dropdowns.LifeCycle} onChange={(e) => handleDropdownChange(e, "LifeCycle")}>
        <option value="">Select...</option>
        {/* Replace these options with your real data */}
        <option value="0">Startup</option>
        <option value="1">Growth</option>
      </select>

      <h2>Size (Select One):</h2>
      <select value={dropdowns.Size} onChange={(e) => handleDropdownChange(e, "Size")}>
        <option value="">Select...</option>
        {/* Replace these options with your real data */}
        <option value="0">Small</option>
        <option value="1">Large</option>
      </select>

      <h2>Grow Operations (Select Multiple):</h2>
      <div className="checkbox-section">
        {checkboxes.GrowOperations.map((isChecked, index) => (
          <label key={index}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleCheckboxChange(index, "GrowOperations")}
            />
            {`Grow Operation ${index + 1}`}
          </label>
        ))}
      </div>

      {/* Add additional checkbox sections for ConstructNew and ConstructExisting */}

      <div className="button-section">
        <button onClick={filterData} style={{ padding: '10px 20px', fontWeight: 'bold', backgroundColor: '#4CAF50', color: 'white' }}>
          🔍 Filter Results
        </button>
      </div>

      <div className="output-section">
        {filteredData.length ? (
          <table>
            <thead>
              <tr>
                {/* Display only the first three columns for filtered data */}
                <th>Column 1</th>
                <th>Column 2</th>
                <th>Column 3</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index}>
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
}

export default FilterComponent;
