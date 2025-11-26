import { useEffect, useState } from "react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    price: "",
    stock: "",
    image: null,
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [salesReport, setSalesReport] = useState([]);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat produk");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      description: "",
      price: "",
      stock: "",
      image: null,
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] || null });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("user_id", user.id);
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("stock", form.stock);
      if (form.image) fd.append("image", form.image);

      if (form.id) {
        await api.put(`/products/admin/${form.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Produk diperbarui");
      } else {
        await api.post("/products/admin", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Produk ditambahkan");
      }

      resetForm();
      loadProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal menyimpan produk");
    }
  };

  const handleEdit = (p) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || "",
      price: p.price,
      stock: p.stock,
      image: null,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus produk ini?")) return;
    try {
      await api.delete(`/products/admin/${id}`, {
        params: { user_id: user.id },
      });
      loadProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal menghapus produk");
    }
  };

  const handleLoadSales = async () => {
    if (!fromDate || !toDate) {
      alert("Isi tanggal dari dan sampai");
      return;
    }
    try {
      const res = await api.get("/admin/reports/sales", {
        params: {
          user_id: user.id,
          from: fromDate,
          to: toDate,
        },
      });
      setSalesReport(res.data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat laporan");
    }
  };

  return (
    <div className="space-y-8 text-sm">
      <section>
        <h1 className="text-xl font-bold mb-4">Manajemen Produk</h1>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form produk */}
          <form
            onSubmit={handleSubmitProduct}
            className="bg-white p-4 rounded shadow space-y-3"
          >
            <h2 className="font-semibold mb-1">
              {form.id ? "Edit Produk" : "Tambah Produk"}
            </h2>
            <input
              name="name"
              placeholder="Nama kue"
              className="w-full border px-3 py-2 rounded"
              value={form.name}
              onChange={handleChange}
              required
            />
            <textarea
              name="description"
              placeholder="Deskripsi"
              className="w-full border px-3 py-2 rounded"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
            <div className="flex gap-3">
              <input
                name="price"
                type="number"
                min="0"
                placeholder="Harga"
                className="w-1/2 border px-3 py-2 rounded"
                value={form.price}
                onChange={handleChange}
                required
              />
              <input
                name="stock"
                type="number"
                min="0"
                placeholder="Stok"
                className="w-1/2 border px-3 py-2 rounded"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </div>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-xs"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-pink-500 text-white hover:bg-pink-600"
              >
                {form.id ? "Update" : "Simpan"}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded border"
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          {/* Tabel produk */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Daftar Produk</h2>
            {products.length === 0 ? (
              <p className="text-xs text-gray-500">Belum ada produk.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-auto">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 border rounded p-2"
                  >
                    {p.image_url && (
                      <img
                        src={`http://localhost:5000${p.image_url}`}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-xs">{p.name}</p>
                      <p className="text-[11px] text-gray-500">
                        Rp {Number(p.price).toLocaleString("id-ID")} • Stok:{" "}
                        {p.stock}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-xs px-2 py-1 border rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs px-2 py-1 text-red-500"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <h1 className="text-xl font-bold mb-4">Laporan Pendapatan</h1>
        <div className="bg-white p-4 rounded shadow space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs mb-1">Dari tanggal</label>
              <input
                type="date"
                className="border px-3 py-2 rounded text-xs"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Sampai tanggal</label>
              <input
                type="date"
                className="border px-3 py-2 rounded text-xs"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleLoadSales}
              className="px-4 py-2 rounded bg-pink-500 text-white text-xs hover:bg-pink-600"
            >
              Tampilkan
            </button>
          </div>
          <div>
            {salesReport.length === 0 ? (
              <p className="text-xs text-gray-500">
                Belum ada data (atau belum pilih rentang tanggal).
              </p>
            ) : (
              <table className="w-full text-xs border mt-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1 text-left">Tanggal</th>
                    <th className="border px-2 py-1 text-right">
                      Total Penjualan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{row.tanggal}</td>
                      <td className="border px-2 py-1 text-right">
                        Rp {Number(row.total).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
