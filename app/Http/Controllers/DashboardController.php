<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleDetail;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = today();

        // Métricas del día
        $todaySales = Sale::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->get();

        $todayRevenue = $todaySales->sum('total');
        $todaySalesCount = $todaySales->count();

        // Producto más vendido del día
        $topProductToday = SaleDetail::whereHas('sale', function ($query) use ($today) {
            $query->whereDate('created_at', $today)
                ->where('status', 'completed');
        })
            ->select('product_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(subtotal) as total_sales'))
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->with('product')
            ->first();

        // Ventas recientes del día
        $todaySalesDetails = Sale::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->with(['details.product', 'user'])
            ->latest()
            ->take(10)
            ->get();

        // Productos con stock bajo
        $lowStockProducts = Product::whereRaw('stock <= min_stock')
            ->where('is_active', true)
            ->with('category')
            ->take(5)
            ->get();

        // Productos próximos a vencer (30 días)
        $expiringProducts = Product::whereNotNull('expiration_date')
            ->where('expiration_date', '<=', now()->addDays(30))
            ->where('is_active', true)
            ->with('category')
            ->orderBy('expiration_date')
            ->take(5)
            ->get();

        // Ventas por método de pago del día
        $salesByPaymentMethod = Sale::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as total'))
            ->groupBy('payment_method')
            ->get();

        // Comparación con ayer
        $yesterday = today()->subDay();
        $yesterdayRevenue = Sale::whereDate('created_at', $yesterday)
            ->where('status', 'completed')
            ->sum('total');

        $revenueChange = $yesterdayRevenue > 0
            ? (($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100
            : 0;

        return Inertia::render('Dashboard', [
            'metrics' => [
                'today_revenue' => $todayRevenue,
                'today_sales_count' => $todaySalesCount,
                'revenue_change' => round($revenueChange, 2),
                'top_product_today' => $topProductToday ? [
                    'name' => $topProductToday->product->name,
                    'quantity' => $topProductToday->total_quantity,
                    'sales' => $topProductToday->total_sales,
                ] : null,
                'sales_by_payment' => $salesByPaymentMethod,
            ],
            'today_sales' => $todaySalesDetails,
            'low_stock_products' => $lowStockProducts,
            'expiring_products' => $expiringProducts,
        ]);
    }
}
