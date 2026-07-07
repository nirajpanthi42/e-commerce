"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../context/AuthContext";

import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product";

export default function Dashboard() {
  const router = useRouter();

  const { isAuthenticated, isAdmin, logout, loading } = useAuth();

  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isAdmin) {
      router.push("/");
      return;
    }

    fetchProducts();
  }, [loading, isAuthenticated, isAdmin]);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Handle all input fields including image
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setForm((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      category: "",
      stock: "",
      description: "",
      image: null,
    });

    setEditing(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("stock", form.stock);
      formData.append("description", form.description);

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editing) {
        await updateProduct(editId, formData);
      } else {
        await createProduct(formData);
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (product) => {
    setEditing(true);
    setEditId(product._id);

    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description,
      image: product.image,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar onLogout={logout} />

      <div className="max-w-7xl mx-auto p-8">
        <ProductForm
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          editing={editing}
        />

        <ProductTable
          products={products}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>
    </main>
  );
}