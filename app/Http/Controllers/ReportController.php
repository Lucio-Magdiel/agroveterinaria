<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\InventoryMovement;
use App\Models\Sale;
use App\Models\SaleDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    public function sales(Request $request)
    {
        $dateFrom = $request->date_from ?? today()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? today()->format('Y-m-d');

        $sales = Sale::whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->where('status', 'completed')
            ->with(['user', 'details.product'])
            ->get();

        $totalRevenue = $sales->sum('total');
        $totalSales = $sales->count();
        $averageTicket = $totalSales > 0 ? $totalRevenue / $totalSales : 0;

        // Ventas por día
        $salesByDay = Sale::whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->where('status', 'completed')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Ventas por método de pago
        $salesByPaymentMethod = Sale::whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->where('status', 'completed')
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as total'))
            ->groupBy('payment_method')
            ->get();

        return Inertia::render('Reports/Sales', [
            'sales' => $sales,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_sales' => $totalSales,
                'average_ticket' => round($averageTicket, 2),
            ],
            'sales_by_day' => $salesByDay,
            'sales_by_payment_method' => $salesByPaymentMethod,
            'filters' => ['date_from' => $dateFrom, 'date_to' => $dateTo],
        ]);
    }

    public function products(Request $request)
    {
        $dateFrom = $request->date_from ?? today()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? today()->format('Y-m-d');

        // Productos más vendidos
        $topProducts = SaleDetail::whereHas('sale', function ($query) use ($dateFrom, $dateTo) {
            $query->whereDate('created_at', '>=', $dateFrom)
                ->whereDate('created_at', '<=', $dateTo)
                ->where('status', 'completed');
        })
            ->select(
                'product_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(subtotal) as total_revenue')
            )
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->with('product.category')
            ->take(20)
            ->get();

        // Productos con bajo stock
        $lowStockProducts = Product::whereRaw('stock <= min_stock')
            ->where('is_active', true)
            ->with('category')
            ->get();

        // Productos próximos a vencer
        $expiringProducts = Product::whereNotNull('expiration_date')
            ->where('expiration_date', '<=', now()->addDays(30))
            ->where('is_active', true)
            ->with('category')
            ->orderBy('expiration_date')
            ->get();

        return Inertia::render('Reports/Products', [
            'top_products' => $topProducts,
            'low_stock_products' => $lowStockProducts,
            'expiring_products' => $expiringProducts,
            'filters' => ['date_from' => $dateFrom, 'date_to' => $dateTo],
        ]);
    }

    public function inventory(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'type', 'product_id', 'search', 'low_stock']);
        $dateFrom = $filters['date_from'] ?? today()->startOfMonth()->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? today()->format('Y-m-d');
        $filters['date_from'] = $dateFrom;
        $filters['date_to'] = $dateTo;
        $filters['low_stock'] = $request->boolean('low_stock');

        $baseQuery = InventoryMovement::query()
            ->when($filters['type'] ?? null, fn($q, $type) => $q->where('type', $type))
            ->when($filters['product_id'] ?? null, fn($q, $productId) => $q->where('product_id', $productId))
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->whereHas('product', function ($productQuery) use ($search) {
                    $productQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($filters['low_stock'] ?? false, function ($q) {
                $q->whereHas('product', function ($productQuery) {
                    $productQuery->whereColumn('stock', '<=', 'min_stock');
                });
            })
            ->whereBetween('created_at', ["{$dateFrom} 00:00:00", "{$dateTo} 23:59:59"]);

        $summary = (clone $baseQuery)
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'entry' THEN quantity ELSE 0 END), 0) as entries")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'exit' THEN quantity ELSE 0 END), 0) as exits")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'adjustment' THEN quantity ELSE 0 END), 0) as adjustments")
            ->first();

        $byProduct = (clone $baseQuery)
            ->select(
                'product_id',
                DB::raw("SUM(CASE WHEN type = 'entry' THEN quantity ELSE 0 END) as entries"),
                DB::raw("SUM(CASE WHEN type = 'exit' THEN quantity ELSE 0 END) as exits"),
                DB::raw("SUM(CASE WHEN type = 'adjustment' THEN quantity ELSE 0 END) as adjustments")
            )
            ->groupBy('product_id')
            ->with(['product:id,name,sku,stock,min_stock'])
            ->orderByDesc(DB::raw('entries - exits + adjustments'))
            ->limit(15)
            ->get();

        $movements = (clone $baseQuery)
            ->with(['product:id,name,sku,stock,min_stock', 'user:id,name'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $products = Product::select('id', 'name', 'sku')->orderBy('name')->get();

        return Inertia::render('Reports/Inventory', [
            'movements' => $movements,
            'products' => $products,
            'summary' => [
                'entries' => (int) ($summary->entries ?? 0),
                'exits' => (int) ($summary->exits ?? 0),
                'adjustments' => (int) ($summary->adjustments ?? 0),
            ],
            'by_product' => $byProduct,
            'filters' => $filters,
        ]);
    }
}
