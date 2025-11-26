import { Link } from "react-router-dom";

export default function ProductCard({ product, onAddToCart }) {
  const outOfStock = product.stock <= 0;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col">
      {product.image_url && (
        <img
          src={`http://localhost:5000${product.image_url}`}
          alt={product.name}
          className="h-40 w-full object-cover"
        />
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-pink-600">
              Rp {Number(product.price).toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-gray-500">
              Stok:{" "}
              <span className={outOfStock ? "text-red-500 font-semibold" : ""}>
                {outOfStock ? "Stok Habis" : product.stock}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 text-xs px-2 py-1 border rounded hover:bg-gray-50 text-center"
          >
            Detail
          </Link>
          <button
            onClick={() => onAddToCart(product)}
            disabled={outOfStock}
            className={`flex-1 text-xs px-2 py-1 rounded text-white text-center ${
              outOfStock
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-pink-500 hover:bg-pink-600"
            }`}
          >
            {outOfStock ? "Stok Habis" : "Tambah"}
          </button>
        </div>
      </div>
    </div>
  );
}
