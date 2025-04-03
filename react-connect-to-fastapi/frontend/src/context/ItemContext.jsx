import { createContext, useContext, useState, useCallback } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";

// Create context
const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const { isAuthenticated } = useAuth();

  // Fetch items with pagination
  const fetchItems = useCallback(
    async (page = 1, limit = 10, ownerId = null) => {
      setLoading(true);
      setError(null);
      try {
        let url = `/items?page=${page}&limit=${limit}`;
        if (ownerId) url += `&owner_id=${ownerId}`;

        const response = await api.get(url);
        setItems(response.data.items);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          pages: response.data.pages,
        });
        return response.data;
      } catch (err) {
        setError(err.response?.data?.detail || "Error fetching items");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get a single item by ID
  const getItem = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/items/${id}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Error fetching item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new item
  const createItem = async (itemData) => {
    setLoading(true);
    setError(null);
    try {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to create an item");
      }

      const response = await api.post("/items", itemData);

      // Update the items list with the new item
      setItems((prevItems) => [response.data, ...prevItems]);

      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Error creating item"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing item
  const updateItem = async (id, itemData) => {
    setLoading(true);
    setError(null);
    try {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to update an item");
      }

      const response = await api.put(`/items/${id}`, itemData);

      // Update the items list with the updated item
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? response.data : item))
      );

      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Error updating item"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an item
  const deleteItem = async (id) => {
    setLoading(true);
    setError(null);
    try {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to delete an item");
      }

      await api.delete(`/items/${id}`);

      // Remove the deleted item from the list
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));

      return true;
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Error deleting item"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete multiple items
  const deleteMultipleItems = async (ids) => {
    setLoading(true);
    setError(null);

    if (!isAuthenticated) {
      setError("You must be logged in to delete items");
      setLoading(false);
      throw new Error("You must be logged in to delete items");
    }

    if (!ids || ids.length === 0) {
      setLoading(false);
      return { deletedIds: [], failedIds: [] }; // Nothing to delete
    }

    try {
      // Send a POST request to the bulk-delete endpoint
      const response = await api.post("/items/bulk-delete", { ids });

      // Get the results from the response
      const deletedIds = response.data.deleted_ids || [];
      const failedIds = response.data.failed_ids || [];

      // Update the items list, removing all successfully deleted items
      if (deletedIds.length > 0) {
        setItems((prevItems) =>
          prevItems.filter((item) => !deletedIds.includes(item.id))
        );
      }

      // Set an error if the backend reported failures
      if (failedIds.length > 0) {
        setError(
          `Failed to delete ${failedIds.length} items. ${deletedIds.length} items were deleted successfully.`
        );
      }

      return { deletedIds, failedIds };
    } catch (err) {
      // Handle API call errors (e.g., 422, 500)
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Error processing bulk item deletions";
      setError(errorMessage);
      console.error("Bulk delete failed:", err.response || err);

      // Return all IDs as failed in case of a total API failure
      return { deletedIds: [], failedIds: ids };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ItemContext.Provider
      value={{
        items,
        loading,
        error,
        pagination,
        fetchItems,
        getItem,
        createItem,
        updateItem,
        deleteItem,
        deleteMultipleItems,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
};

export const useItems = () => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error("useItems must be used within an ItemProvider");
  }
  return context;
};

export default ItemContext;
