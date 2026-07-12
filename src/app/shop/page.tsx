"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Wheat, MapPin, Star } from "lucide-react";
import Image from "next/image";

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
}

interface ProductType {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: {
    name: string;
    slug: string;
  };
  district: string;
  ratings: {
    average: number;
    count: number;
  };
}

function ShopContent() {
  const searchParams = useSearchParams();

  // Filters State
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Data State
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const districts = ["Rajshahi", "Sundarbans", "Jessore", "Khulna", "Mymensingh", "Kushtia", "Dhaka"];

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Categories load failed:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (selectedCategory) query.set("category", selectedCategory);
    if (minPrice) query.set("minPrice", minPrice);
    if (maxPrice) query.set("maxPrice", maxPrice);
    if (selectedDistrict) query.set("district", selectedDistrict);
    if (sort) query.set("sort", sort);
    query.set("page", page.toString());
    query.set("limit", "9");

    fetch(`/api/products?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Products load failed:", err);
        setLoading(false);
      });
  }, [search, selectedCategory, minPrice, maxPrice, selectedDistrict, sort, page]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(selectedCategory === slug ? "" : slug);
    setPage(1);
  };

  return (
    <div className="container py-8 sm:py-12">
      <div className="mb-8">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-2">Village Marketplace</h2>
        <p className="text-text-muted text-sm md:text-base">Direct harvests and crafts from rural communities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        {/* Sidebar Filters */}
        <aside className="bg-white border border-border-light rounded-2xl p-6 h-fit sticky top-24 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-primary mb-5 border-b border-border-light pb-2">
            Filters
          </h3>

          {/* Categories */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-text-earth mb-3 uppercase tracking-wider">Categories</h4>
            <div className="flex flex-col gap-2.5">
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-2.5 text-sm text-text-muted cursor-pointer hover:text-primary transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat.slug}
                    onChange={() => handleCategorySelect(cat.slug)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Districts */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-text-earth mb-3 uppercase tracking-wider">Regions (Districts)</h4>
            <div className="flex flex-col gap-2.5">
              {districts.map((dist) => (
                <label key={dist} className="flex items-center gap-2.5 text-sm text-text-muted cursor-pointer hover:text-primary transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedDistrict === dist}
                    onChange={() => {
                      setSelectedDistrict(selectedDistrict === dist ? "" : dist);
                      setPage(1);
                    }}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span>{dist}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-text-earth mb-3 uppercase tracking-wider">Price (BDT)</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full px-3 py-1.5 text-xs rounded border border-border-light outline-none focus:border-primary"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
              />
              <span className="text-text-muted text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                className="w-full px-3 py-1.5 text-xs rounded border border-border-light outline-none focus:border-primary"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <button
            className="w-full py-2 bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
            onClick={() => {
              setSearch("");
              setSelectedCategory("");
              setMinPrice("");
              setMaxPrice("");
              setSelectedDistrict("");
              setSort("newest");
              setPage(1);
            }}
          >
            Reset Filters
          </button>
        </aside>

        {/* Main Catalog */}
        <section className="flex flex-col gap-6">
          {/* Search/Sort Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-border-light rounded-xl p-4 gap-4 shadow-sm">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 text-sm rounded-lg border border-border-light outline-none focus:border-primary"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Sort:
              </label>
              <select
                className="px-3 py-2 border border-border-light rounded-lg outline-none bg-white text-xs font-semibold text-text-earth focus:border-primary"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">Newest Harvest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popularity">Popularity/Ratings</option>
              </select>
            </div>
          </div>

          {/* Grid display */}
          {loading ? (
            <div className="text-center py-20 bg-white border border-border-light rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-primary animate-pulse">Gathering village products...</h3>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white border border-border-light rounded-2xl shadow-sm text-text-muted">
              <h3 className="text-lg font-bold mb-1">No products found.</h3>
              <p className="text-sm">Try relaxing your search terms or region filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div key={product._id} className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-sm flex flex-col h-full hover-card-premium cursor-pointer">
                    <div className="relative w-full h-[200px] bg-bg-sand overflow-hidden">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 bg-accent text-text-earth text-xs font-extrabold px-2.5 py-1 rounded flex items-center gap-1">
                        <Wheat className="w-3.5 h-3.5" /> Harvested
                      </span>
                      <span className="absolute top-3 right-3 bg-black/75 text-white text-[10px] px-2 py-1 rounded font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-accent" /> {product.district}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <span className="text-[10px] font-bold tracking-wider text-secondary uppercase mb-1">
                        {product.category?.name || "Uncategorized"}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-text-earth mb-2 line-clamp-2 hover:text-primary transition-colors">
                        <Link href={`/products/${product._id}`}>{product.name}</Link>
                      </h3>
                      <div className="text-xs text-accent-hover mb-4 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-accent stroke-accent" /> {product.ratings.average || "New"} ({product.ratings.count || 0} reviews)
                      </div>

                      <div className="flex items-center justify-between border-t border-border-light pt-4 mt-auto">
                        <div className="font-sans text-lg font-extrabold text-primary">
                          BDT {product.price}
                        </div>
                        <Link
                          href={`/products/${product._id}`}
                          className="inline-flex items-center justify-center px-4 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-md text-xs font-bold transition"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-10">
                  <button
                    className="px-4 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-text-earth">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="px-4 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="text-center py-20"><h3>Loading Shop...</h3></div>}>
      <ShopContent />
    </Suspense>
  );
}
