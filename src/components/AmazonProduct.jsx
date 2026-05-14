"use client";

export default function AmazonProduct({ title, url, image, price }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="amazon-card"
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div className="amazon-card-image">
        <img src={image || 'https://via.placeholder.com/200x200?text=Producte'} alt={title} />
      </div>
      <div className="amazon-card-content">
        <h3>{title}</h3>
        {price && <p className="amazon-card-price">{price}</p>}
        <div className="amazon-card-button">
          Veure a Amazon
        </div>
      </div>
    </a>
  );
}
