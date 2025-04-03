import "./App.css";
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ThemeSwitcher from "./components/ThemeSwitcher";
import DataTable from "./components/DataTable";
import ItemCard from "./components/ItemCard";
import ItemForm from "./components/ItemForm";
import AuthButtons from "./components/AuthButtons";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ItemProvider, useItems } from "./context/ItemContext";

/**
 * Main App Component
 *
 * This component serves as the main application container,
 * integrating the Navbar, authentication, and item management.
 */
function AppContent() {
  const [activeTab, setActiveTab] = useState("items");
  const [viewMode, setViewMode] = useState("card"); // "card" or "table"
  const [selectedRows, setSelectedRows] = useState([]);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { items, loading, error, pagination, fetchItems, deleteMultipleItems } =
    useItems();

  // Fetch items when the component mounts or user changes
  useEffect(() => {
    fetchItems(1, 10);
  }, [fetchItems, user]);

  // Table columns definition for items
  const tableColumns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <div className="max-w-md truncate">
          {row.description || "No description"}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      render: (row) => <div>{new Date(row.created_at).toLocaleString()}</div>,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex gap-2">
          <button
            className="btn btn-xs btn-primary"
            onClick={() => handleEditClick(row)}
            disabled={!isAuthenticated || (user && user.id !== row.owner_id)}
          >
            Edit
          </button>
          <button
            className="btn btn-xs btn-error"
            onClick={() => handleDeleteClick(row.id)}
            disabled={!isAuthenticated || (user && user.id !== row.owner_id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Handle edit button click
  const handleEditClick = (item) => {
    setItemToEdit(item);
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const result = await deleteMultipleItems([id]);

        if (result.failedIds.length > 0) {
          console.warn(`Failed to delete item ${id}`);
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    if (
      confirm(`Are you sure you want to delete ${selectedRows.length} items?`)
    ) {
      try {
        // Make sure we're passing the correct format that the API expects
        const itemIds = selectedRows.map((row) =>
          typeof row === "object" ? row.id : row
        );
        const result = await deleteMultipleItems(itemIds);

        // Clear selected rows even if some deletions failed
        setSelectedRows([]);

        // Show a user-friendly message about partial success/failure
        if (result.failedIds.length > 0) {
          console.warn(
            `Failed to delete some items: ${result.failedIds.join(", ")}`
          );
        } else {
          // All deletions succeeded
          console.log(`Successfully deleted ${result.deletedIds.length} items`);
        }
      } catch (error) {
        console.error("Error during bulk delete operation:", error);
      }
    }
  };

  // Close the edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setItemToEdit(null);
  };

  // Handle edit form submission
  const handleEditSuccess = () => {
    closeEditModal();
    fetchItems(pagination.page, pagination.limit);
  };

  // Navigation links for the Navbar
  const navLinks = [
    {
      text: "Home",
      href: "#",
      active: activeTab === "items",
      onClick: () => setActiveTab("items"),
    },
    {
      text: "Create",
      href: "#",
      active: activeTab === "create",
      onClick: () => setActiveTab("create"),
    },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar Component with ThemeSwitcher and AuthButtons */}
      <Navbar
        title="React FastAPI App"
        links={navLinks}
        endContent={
          <div className="flex gap-2">
            <AuthButtons />
            <ThemeSwitcher />
          </div>
        }
      />

      <div className="container mx-auto py-8 px-4">
        {/* Error message */}
        {error && (
          <div className="alert alert-error mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Create Item View */}
        {activeTab === "create" && (
          <div className="max-w-xl mx-auto mb-8">
            {isAuthenticated ? (
              <ItemForm
                onSuccess={() => {
                  fetchItems(1, 10);
                  setActiveTab("items");
                }}
              />
            ) : (
              <div className="alert">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-info shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>Please log in to create new items.</span>
              </div>
            )}
          </div>
        )}

        {/* Items View */}
        {activeTab === "items" && (
          <>
            {/* Tabs for switching between views */}
            <div className="tabs tabs-boxed mb-8 flex justify-center">
              <a
                className={`tab ${viewMode === "card" ? "tab-active" : ""}`}
                onClick={() => setViewMode("card")}
              >
                Card View
              </a>
              <a
                className={`tab ${viewMode === "table" ? "tab-active" : ""}`}
                onClick={() => setViewMode("table")}
              >
                Table View
              </a>
            </div>

            {/* Table View */}
            {viewMode === "table" && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Items Table</h2>

                  {/* Selected rows actions */}
                  {selectedRows.length > 0 && (
                    <div className="alert mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-info shrink-0 w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>{selectedRows.length} items selected</span>
                      <div>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={handleBulkDelete}
                          disabled={loading}
                        >
                          Delete Selected
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Data Table Component */}
                  <DataTable
                    data={items}
                    columns={tableColumns}
                    selectable={true}
                    pageSize={pagination.limit}
                    loading={loading}
                    onSelectionChange={setSelectedRows}
                  />

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex justify-center mt-4">
                      <div className="join">
                        {Array.from(
                          { length: pagination.pages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            className={`join-item btn ${
                              pagination.page === page ? "btn-active" : ""
                            }`}
                            onClick={() => fetchItems(page, pagination.limit)}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Card View */}
            {viewMode === "card" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Items</h2>

                  {isAuthenticated && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setActiveTab("create")}
                    >
                      Create New Item
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="flex justify-center my-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="alert">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-info shrink-0 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>
                      No items available. Create new items to see them here.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onEdit={handleEditClick}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                      <div className="flex justify-center mt-8">
                        <div className="join">
                          {Array.from(
                            { length: pagination.pages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <button
                              key={page}
                              className={`join-item btn ${
                                pagination.page === page ? "btn-active" : ""
                              }`}
                              onClick={() => fetchItems(page, pagination.limit)}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Floating action button for creating items (visible only when authenticated and on items view) */}
      {isAuthenticated && activeTab === "items" && (
        <div className="fixed right-8 bottom-8">
          <button
            className="btn btn-circle btn-primary btn-lg shadow-lg"
            onClick={() => setActiveTab("create")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={closeEditModal}
            >
              ✕
            </button>
            <ItemForm
              initialData={itemToEdit}
              onSuccess={handleEditSuccess}
              mode="edit"
            />
          </div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        <div>
          <p>© 2023 - React FastAPI App</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Wraps the app content with necessary context providers
 */
function App() {
  return (
    <AuthProvider>
      <ItemProvider>
        <AppContent />
      </ItemProvider>
    </AuthProvider>
  );
}

export default App;
