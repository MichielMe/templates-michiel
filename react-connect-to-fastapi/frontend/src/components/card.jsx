function Card() {
  return (
    <div className="card card-compact w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Card title!</h2>
        <p>Card description</p>
        <div className="card-actions justify-end">
          <button className="btn btn-secondary">Button</button>
          <button className="btn btn-accent">Button</button>
        </div>
      </div>
    </div>
  );
}

export default Card;
