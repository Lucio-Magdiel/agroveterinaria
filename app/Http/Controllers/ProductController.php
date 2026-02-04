<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->with('category')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->low_stock, function ($query) {
                $query->whereRaw('stock <= min_stock');
            })
            ->latest()
            ->paginate(15)
            ->withQueryString()
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

        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'low_stock']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'purchase_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'price_per_kg' => 'nullable|numeric|min:0',
            'stock' => 'required|numeric|min:0',
            'min_stock' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'kg_per_unit' => 'nullable|numeric|min:0',
            'allow_fractional_sale' => 'boolean',
            'expiration_date' => 'nullable|date',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        // Verificar si el SKU ya existe
        if (Product::where('sku', $validated['sku'])->exists()) {
            return back()->withErrors([
                'sku' => 'El SKU ya existe. Por favor, usa un código diferente.'
            ])->withInput();
        }

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($validated);

        // Registrar movimiento de inventario si hay stock inicial
        if ($product->stock > 0) {
            \App\Models\InventoryMovement::create([
                'product_id' => $product->id,
                'type' => 'entry',
                'quantity' => $product->stock,
                'reason' => 'Stock inicial al crear producto',
                'previous_stock' => 0,
                'new_stock' => $product->stock,
                'user_id' => auth()->id(),
            ]);
        }

        if ($request->boolean('stay_on_category') && $request->filled('category_id')) {
            return redirect()->route('categories.show', $request->input('category_id'))
                ->with('success', 'Producto creado exitosamente.');
        }

        return redirect()->route('products.index')
            ->with('success', 'Producto creado exitosamente.');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'sku' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'purchase_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'price_per_kg' => 'nullable|numeric|min:0',
            'stock' => 'required|numeric|min:0',
            'min_stock' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'kg_per_unit' => 'nullable|numeric|min:0',
            'allow_fractional_sale' => 'boolean',
            'expiration_date' => 'nullable|date',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        // Verificar si el SKU ya existe en otro producto
        if (Product::where('sku', $validated['sku'])->where('id', '!=', $product->id)->exists()) {
            return back()->withErrors([
                'sku' => 'El SKU ya existe. Por favor, usa un código diferente.'
            ])->withInput();
        }

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);
        if ($request->boolean('stay_on_category') && $request->filled('category_id')) {
            return redirect()->route('categories.show', $request->input('category_id'))
                ->with('success', 'Producto actualizado exitosamente.');
        }

        return redirect()->route('products.index')
            ->with('success', 'Producto actualizado exitosamente.');
    }

    public function destroy(Product $product)
    {
        if ($product->saleDetails()->count() > 0) {
            return back()->with('error', 'No se puede eliminar el producto porque tiene ventas asociadas.');
        }

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Producto eliminado exitosamente.');
    }

    public function toggleStatus(Product $product)
    {
        $product->update([
            'is_active' => !$product->is_active
        ]);

        return back()->with('success', 'Estado del producto actualizado.');
    }
}
