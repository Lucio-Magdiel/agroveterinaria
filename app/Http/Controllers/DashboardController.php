<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(DashboardService $dashboardService)
    {
        $metrics = $dashboardService->getTodayMetrics();
        $recentSales = $dashboardService->getRecentSales();
        $inventoryAlerts = $dashboardService->getInventoryAlerts();

        return Inertia::render('Dashboard', [
            'metrics' => [
                'today_revenue' => $metrics['revenue'],
                'today_sales_count' => $metrics['count'],
                'revenue_change' => $metrics['revenue_change'],
                'top_product_today' => $metrics['top_product'],
                'sales_by_payment' => $metrics['sales_by_payment'],
            ],
            'today_sales' => $recentSales,
            'low_stock_products' => $inventoryAlerts['low_stock'],
            'expiring_products' => $inventoryAlerts['expiring'],
        ]);
    }
}
