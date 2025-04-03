import React from "react";
import { useItems } from "../context/ItemContext";
import { useAuth } from "../context/AuthContext";

/**
 * Item Card Component
 *
 * Displays an individual item as a card
 *
 * @param {Object} props - Component props
 * @param {Object} props.item - The item data to display
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 */
function ItemCard({ item, onEdit }) {
  const { deleteItem, loading } = useItems();
  const { user } = useAuth();

  // Format date for better display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if current user is the owner of this item
  const isOwner = user && item.owner_id === user.id;

  // Handle delete button click
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem(item.id);
      } catch (err) {
        console.error("Error deleting item:", err);
      }
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{item.title}</h2>

        {item.description && (
          <p className="text-base-content/80">{item.description}</p>
        )}

        <div className="flex items-center text-sm text-base-content/60 mt-2">
          <span>Created: {formatDate(item.created_at)}</span>
          {item.updated_at && item.updated_at !== item.created_at && (
            <span className="ml-4">Updated: {formatDate(item.updated_at)}</span>
          )}
        </div>

        {/* Actions */}
        {isOwner && (
          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => onEdit(item)}
              disabled={loading}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-error"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemCard;
