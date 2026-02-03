<?php

namespace App\Http\Controllers;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $sales = Sale::query()
            ->with(['user', 'details.product'])
            ->when($request->search, function ($query, $search) {
                $query->where('sale_number', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->payment_method, function ($query, $method) {
                $query->where('payment_method', $method);
            })
            ->when($request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'filters' => $request->only(['search', 'status', 'payment_method', 'date_from', 'date_to']),
        ]);
    }

    public function create()
    {
        $products = Product::where('is_active', true)
            ->where('stock', '>', 0)
            ->with('category')
            ->get();

        return Inertia::render('Sales/Create', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:efectivo,yape',
            'payment_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            // Verificar stock disponible
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                if ($product->stock < $item['quantity']) {
                    return back()->with('error', "Stock insuficiente para el producto: {$product->name}");
                }
            }

            // Calcular totales
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            // Crear venta
            $sale = Sale::create([
                'sale_number' => Sale::generateSaleNumber(),
                'user_id' => auth()->id(),
                'subtotal' => $subtotal,
                'tax' => 0,
                'total' => $subtotal,
                'payment_method' => $validated['payment_method'],
                'payment_reference' => $validated['payment_reference'] ?? null,
                'status' => 'completed',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Crear detalles y actualizar inventario
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $itemSubtotal = $item['quantity'] * $item['unit_price'];

                // Crear detalle de venta
                SaleDetail::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $itemSubtotal,
                ]);

                // Registrar movimiento de inventario
                $previousStock = $product->stock;
                $newStock = $previousStock - $item['quantity'];

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'type' => 'exit',
                    'quantity' => $item['quantity'],
                    'previous_stock' => $previousStock,
                    'new_stock' => $newStock,
                    'reason' => 'Venta #' . $sale->sale_number,
                    'user_id' => auth()->id(),
                    'sale_id' => $sale->id,
                ]);

                // Actualizar stock del producto
                $product->update(['stock' => $newStock]);
            }

            DB::commit();

            return redirect()->route('sales.show', $sale)
                ->with('success', 'Venta registrada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al procesar la venta: ' . $e->getMessage());
        }
    }

    public function show(Sale $sale)
    {
        $sale->load(['user', 'details.product.category']);

        return Inertia::render('Sales/Show', [
            'sale' => $sale,
        ]);
    }

    public function destroy(Sale $sale)
    {
        if ($sale->status === 'cancelled') {
            return back()->with('error', 'La venta ya está cancelada.');
        }

        DB::beginTransaction();

        try {
            // Restaurar stock
            foreach ($sale->details as $detail) {
                $product = $detail->product;
                $product->increment('stock', $detail->quantity);

                // Registrar movimiento de inventario
                InventoryMovement::create([
                    'product_id' => $product->id,
                    'type' => 'entry',
                    'quantity' => $detail->quantity,
                    'previous_stock' => $product->stock - $detail->quantity,
                    'new_stock' => $product->stock,
                    'reason' => 'Cancelación de venta #' . $sale->sale_number,
                    'user_id' => auth()->id(),
                    'sale_id' => $sale->id,
                ]);
            }

            // Marcar venta como cancelada
            $sale->update(['status' => 'cancelled']);

            DB::commit();

            return redirect()->route('sales.index')
                ->with('success', 'Venta cancelada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al cancelar la venta: ' . $e->getMessage());
        }
    }
}
