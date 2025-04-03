import React, { useState, useEffect, useRef } from "react";

/**
 * DataTable Component
 *
 * A comprehensive and customizable data table with features including:
 * - Column sorting
 * - Pagination
 * - Row selection
 * - Responsive design
 *
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Array of column definitions
 * @param {boolean} props.selectable - Whether rows are selectable
 * @param {Function} props.onRowClick - Function to call when a row is clicked
 * @param {number} props.pageSize - Number of rows per page
 * @param {boolean} props.loading - Whether the table is in loading state
 * @param {Function} props.onSelectionChange - Function to call when selection changes
 * @returns {React.ReactElement} DataTable component
 */
function DataTable({
  data = [],
  columns = [],
  selectable = false,
  onRowClick,
  pageSize = 10,
  loading = false,
  onSelectionChange,
}) {
  // State for current page
  const [currentPage, setCurrentPage] = useState(1);

  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // State for selected rows
  const [selectedRows, setSelectedRows] = useState([]);

  // State for all rows selected
  const [allSelected, setAllSelected] = useState(false);

  // Store previous selected rows to avoid unnecessary callbacks
  const prevSelectedRowsRef = useRef(selectedRows);

  // Reset selections when data changes
  useEffect(() => {
    setSelectedRows([]);
    setAllSelected(false);
  }, [data]);

  // Notify parent component when selection changes
  // Only do this when the selection actually changes
  useEffect(() => {
    // Compare current and previous selections to avoid unnecessary callbacks
    if (
      onSelectionChange &&
      JSON.stringify(selectedRows) !==
        JSON.stringify(prevSelectedRowsRef.current)
    ) {
      onSelectionChange(selectedRows);
      prevSelectedRowsRef.current = selectedRows;
    }
  }, [selectedRows, onSelectionChange]);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / pageSize);

  // Get current page data
  const getCurrentPageData = () => {
    // Apply sorting if sortConfig.key is not null
    let sortedData = [...data];
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle row selection
  const handleRowSelect = (id) => {
    let newSelectedRows;
    if (selectedRows.includes(id)) {
      newSelectedRows = selectedRows.filter((rowId) => rowId !== id);
    } else {
      newSelectedRows = [...selectedRows, id];
    }
    setSelectedRows(newSelectedRows);
    setAllSelected(newSelectedRows.length === getCurrentPageData().length);
  };

  // Handle select all rows
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRows([]);
    } else {
      const allIds = getCurrentPageData().map((row) => row.id);
      setSelectedRows(allIds);
    }
    setAllSelected(!allSelected);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];

    // Always show first page
    pages.push(1);

    // Current page neighborhood
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    // Always show last page if there's more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    // Add ellipsis indicators
    const result = [];
    let prev = 0;

    for (const page of pages) {
      if (page - prev > 1) {
        result.push("...");
      }
      result.push(page);
      prev = page;
    }

    return result;
  };

  // Render table skeleton (loading state)
  const renderSkeleton = () => {
    return Array(pageSize)
      .fill(0)
      .map((_, index) => (
        <tr key={`skeleton-${index}`} className="animate-pulse">
          {selectable && (
            <td>
              <div className="h-4 w-4 bg-base-300 rounded"></div>
            </td>
          )}
          {columns.map((column, colIndex) => (
            <td key={`skeleton-col-${colIndex}`}>
              <div className="h-4 bg-base-300 rounded w-3/4"></div>
            </td>
          ))}
        </tr>
      ));
  };

  return (
    <div className="overflow-x-auto">
      {/* Table */}
      <table className="table table-zebra">
        {/* Table Header */}
        <thead>
          <tr>
            {/* Checkbox column if selectable */}
            {selectable && (
              <th className="w-12">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  disabled={loading}
                />
              </th>
            )}

            {/* Column headers */}
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() =>
                  column.sortable !== false && handleSort(column.key)
                }
                className={column.sortable !== false ? "cursor-pointer" : ""}
              >
                <div className="flex items-center gap-1">
                  {column.label || column.key}
                  {column.sortable !== false &&
                    sortConfig.key === column.key && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {loading ? (
            renderSkeleton()
          ) : getCurrentPageData().length > 0 ? (
            getCurrentPageData().map((row) => (
              <tr
                key={row.id}
                className={`${
                  onRowClick ? "hover:bg-base-200 cursor-pointer" : ""
                } 
                            ${
                              selectedRows.includes(row.id) ? "bg-base-200" : ""
                            }`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {/* Checkbox for selection */}
                {selectable && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleRowSelect(row.id)}
                    />
                  </td>
                )}

                {/* Data cells */}
                {columns.map((column) => (
                  <td key={`${row.id}-${column.key}`}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={selectable ? columns.length + 1 : columns.length}
                className="text-center py-4"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="join">
            {/* Previous page button */}
            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              «
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <button
                  key={`ellipsis-${index}`}
                  className="join-item btn btn-disabled"
                >
                  ...
                </button>
              ) : (
                <button
                  key={`page-${page}`}
                  className={`join-item btn ${
                    currentPage === page ? "btn-active" : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                >
                  {page}
                </button>
              )
            )}

            {/* Next page button */}
            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Table info */}
      <div className="text-sm text-base-content/70 mt-2 text-center">
        Showing {Math.min((currentPage - 1) * pageSize + 1, data.length)} to{" "}
        {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
      </div>
    </div>
  );
}

export default DataTable;
