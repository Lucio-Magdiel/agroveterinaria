<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleDetail;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getTodayMetrics()
    {
        $today = today();
        
        // Ventas de hoy
        $todaySalesQuery = Sale::whereDate('created_at', $today);

        $todayRevenue = $todaySalesQuery->sum('total');
        $todaySalesCount = $todaySalesQuery->count();

        return [
            'revenue' => $todayRevenue,
            'count' => $todaySalesCount,
            'revenue_change' => $this->calculateRevenueChange($todayRevenue),
            'top_product' => $this->getTopProductToday($today),
            'sales_by_payment' => $this->getSalesByPaymentMethod($today),
        ];
    }

    public function getRecentSales()
    {
        return Sale::with(['user', 'details.product'])
            ->whereDate('created_at', today())
            ->latest()
            ->take(5)
            ->get();
    }

    public function getInventoryAlerts()
    {
        return [
            'low_stock' => Product::whereColumn('stock', '<=', 'min_stock')
                ->where('is_active', true)
                ->with('category')
                ->take(5)
                ->get(),
            'expiring' => collect([]), // Temporalmente vacío hasta agregar campo expiration_date
    }

    protected function calculateRevenueChange($todayRevenue)
    {
        $yesterday = today()->subDay();
        $yesterdayRevenue = Sale::whereDate('created_at', $yesterday)
            ->where('status', 'completed')
            ->sum('total');

        return $yesterdayRevenue > 0
            ? round((($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 2)
            : 0;
    }
function getTopProductToday($date)
    {
        $topProduct = SaleDetail::whereHas('sale', function ($query) use ($date) {
                $query->whereDate('created_at', $date)
                    ->where('status', 'completed');
            ->select('product_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(subtotal) as total_sales'))
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->with('product')
            ->first();

        return $topProduct ? [
            'name' => $topProduct->product->name,
            'quantity' => $topProduct->total_quantity,
            'sales' => $topProduct->total_sales,
        ] : null;
    }

    protected function getSalesByPaymentMethod($date)
    {
        return Sale::whereDate('created_at', $date)
            ->where('status', 'completed')
            ->groupBy('payment_method')
            ->get();
    }
}
