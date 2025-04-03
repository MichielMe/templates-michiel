import React from "react";

function Card({ data }) {
  if (!data) return null;

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <figure className="px-4 pt-4">
        <img
          src={data.image || "https://picsum.photos/300/200"}
          alt="Item"
          className="rounded-xl object-cover h-48 w-full"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-primary">
          {data.input01 || "Card Title"}
          {data.boolean01 && (
            <div className="badge badge-secondary">Featured</div>
          )}
        </h2>
        <p className="text-base-content">
          {data.input02 || "No description available"}
        </p>
        {data.input03 && (
          <div className="mt-2">
            <div className="text-sm opacity-70">Additional information:</div>
            <p className="italic">{data.input03}</p>
          </div>
        )}
        <div className="divider my-2"></div>
        <div className="card-actions justify-between items-center">
          <div className="badge badge-outline">
            {new Date().toLocaleDateString()}
          </div>
          <div>
            <button className="btn btn-primary btn-sm">View</button>
            <button className="btn btn-ghost btn-sm ml-2">Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
