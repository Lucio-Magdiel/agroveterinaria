<?php

namespace App\Http\Controllers;

use App\Models\Product;
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

        $sales = Sale::whereBetween('created_at', [$dateFrom, $dateTo])
            ->where('status', 'completed')
            ->with(['user'])
            ->get();

        $totalRevenue = $sales->sum('total');
        $totalSales = $sales->count();
        $averageTicket = $totalSales > 0 ? $totalRevenue / $totalSales : 0;

        // Ventas por día
        $salesByDay = Sale::whereBetween('created_at', [$dateFrom, $dateTo])
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
        $salesByPaymentMethod = Sale::whereBetween('created_at', [$dateFrom, $dateTo])
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
            $query->whereBetween('created_at', [$dateFrom, $dateTo])
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
}
