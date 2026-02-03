<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->withCount('products')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only('search'),
        ]);
    }

    public function show(Category $category)
    {
        $category->loadCount('products');
        
        $products = $category->products()
            ->with('category')
            ->latest()
            ->paginate(15)
            ->through(fn ($product) => [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'description' => $product->description,
                'category' => $product->category,
                'purchase_price' => $product->purchase_price,
                'sale_price' => $product->sale_price,
                'price_per_kg' => $product->price_per_kg,
                'stock' => $product->stock,
                'min_stock' => $product->min_stock,
                'unit' => $product->unit,
                'kg_per_unit' => $product->kg_per_unit,
                'allow_fractional_sale' => $product->allow_fractional_sale,
                'expiration_date' => $product->expiration_date?->format('Y-m-d'),
                'image' => $product->image,
                'is_active' => $product->is_active,
            ]);

        return Inertia::render('Categories/Show', [
            'category' => $category,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Category::create($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Categoría creada exitosamente.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Categoría actualizada exitosamente.');
    }

    public function destroy(Category $category)
    {
        if ($category->products()->count() > 0) {
            return back()->with('error', 'No se puede eliminar la categoría porque tiene productos asociados.');
        }

        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'Categoría eliminada exitosamente.');
    }
}
