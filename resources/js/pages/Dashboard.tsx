import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import {
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    DollarSign,
    Users,
    Package,
    AlertTriangle,
    Calendar,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    metrics: {
        today_revenue: number;
        today_sales_count: number;
        revenue_change: number;
        top_product_today: {
            name: string;
            quantity: number;
            sales: number;
        } | null;
        sales_by_payment: Array<{
            payment_method: string;
            count: number;
            total: number;
        }>;
    };
    today_sales: any[];
    low_stock_products: any[];
    expiring_products: any[];
}

export default function Dashboard({
    metrics,
    today_sales,
    low_stock_products,
    expiring_products,
}: DashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Agroveterinaria Los Andes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Métricas del Día */}
                <div>
                    <h1 className="mb-2 text-2xl font-bold">
                        Dashboard - Métricas del Día
                    </h1>
                    <p className="text-default-500">
                        {new Date().toLocaleDateString('es-PE', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>

                {/* Cards de Métricas */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Ventas del Día */}
                    <Card className="border-none bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl rounded-3xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="text-white">
                                    <p className="mb-2 text-sm font-medium opacity-90">
                                        Ventas del Día
                                    </p>
                                    <h2 className="text-4xl font-bold">
                                        {formatCurrency(metrics.today_revenue)}
                                    </h2>
                                    <div className="mt-3 flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 w-fit">
                                        {metrics.revenue_change >= 0 ? (
                                            <TrendingUp className="h-4 w-4" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4" />
                                        )}
                                        <span className="text-sm font-semibold">
                                            {Math.abs(metrics.revenue_change)}%
                                            vs ayer
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-white/20 p-4">
                                    <DollarSign className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Número de Ventas */}
                    <Card className="border-none bg-gradient-to-br from-green-500 to-green-600 shadow-xl rounded-3xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="text-white">
                                    <p className="mb-2 text-sm font-medium opacity-90">
                                        Total Ventas
                                    </p>
                                    <h2 className="text-4xl font-bold">
                                        {metrics.today_sales_count}
                                    </h2>
                                    <p className="mt-3 text-sm font-medium">
                                        ventas completadas
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/20 p-4">
                                    <ShoppingCart className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Producto Más Vendido */}
                    <Card className="border-none bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl rounded-3xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="text-white">
                                    <p className="mb-2 text-sm font-medium opacity-90">
                                        Producto Top
                                    </p>
                                    {metrics.top_product_today ? (
                                        <>
                                            <h2 className="mb-2 text-xl font-bold line-clamp-2">
                                                {
                                                    metrics.top_product_today
                                                        .name
                                                }
                                            </h2>
                                            <p className="text-sm font-medium">
                                                {
                                                    metrics.top_product_today
                                                        .quantity
                                                }{' '}
                                                unidades vendidas
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm">
                                            Sin ventas hoy
                                        </p>
                                    )}
                                </div>
                                <div className="rounded-2xl bg-white/20 p-4">
                                    <Package className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Grid de Información */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Métodos de Pago */}
                    <Card className="shadow-xl rounded-3xl">
                        <CardHeader className="pb-3">
                            <h3 className="text-xl font-bold">
                                Ventas por Método de Pago
                            </h3>
                        </CardHeader>
                        <CardBody className="pt-2">
                            {metrics.sales_by_payment.length > 0 ? (
                                <div className="space-y-4">
                                    {metrics.sales_by_payment.map(
                                        (payment) => (
                                            <div
                                                key={payment.payment_method}
                                                className="flex items-center justify-between rounded-2xl bg-content2 p-4 hover:shadow-md transition-shadow border border-divider"
                                            >
                                                <div>
                                                    <p className="font-semibold capitalize">
                                                        {payment.payment_method}
                                                    </p>
                                                    <p className="text-sm text-default-500">
                                                        {payment.count} ventas
                                                    </p>
                                                </div>
                                                <p className="text-lg font-bold text-primary">
                                                    {formatCurrency(
                                                        payment.total
                                                    )}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-default-400">
                                    No hay ventas hoy
                                </p>
                            )}
                        </CardBody>
                    </Card>

                    {/* Productos con Stock Bajo */}
                    <Card className="shadow-xl rounded-3xl bg-danger-50/50 dark:bg-danger-50/10">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-danger rounded-2xl">
                                    <AlertTriangle className="h-6 w-6 text-danger-foreground" />
                                </div>
                                <h3 className="text-xl font-bold">
                                    Productos con Stock Bajo
                                </h3>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-2">
                            {low_stock_products.length > 0 ? (
                                <div className="space-y-3">
                                    {low_stock_products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between rounded-2xl border border-danger-200 dark:border-danger-400/30 bg-content1 p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {product.name}
                                                </p>
                                                <p className="text-sm text-default-500">
                                                    {product.category.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-warning">
                                                    Stock: {product.stock}
                                                </p>
                                                <p className="text-xs text-default-400">
                                                    Mín: {product.min_stock}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-default-400">
                                    Todos los productos tienen stock adecuado
                                </p>
                            )}
                        </CardBody>
                    </Card>
                </div>

                {/* Ventas Recientes */}
                <Card className="shadow-xl rounded-3xl">
                    <CardHeader className="pb-3">
                        <h3 className="text-xl font-bold">
                            Últimas Ventas del Día
                        </h3>
                    </CardHeader>
                    <CardBody className="pt-2">
                        {today_sales.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-left">
                                                N° Venta
                                            </th>
                                            <th className="p-2 text-left">
                                                Usuario
                                            </th>
                                            <th className="p-2 text-left">
                                                Método Pago
                                            </th>
                                            <th className="p-2 text-right">
                                                Total
                                            </th>
                                            <th className="p-2 text-left">
                                                Hora
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {today_sales.map((sale) => (
                                            <tr
                                                key={sale.id}
                                                className="border-b last:border-b-0"
                                            >
                                                <td className="p-2 font-mono text-sm">
                                                    {sale.sale_number}
                                                </td>
                                                <td className="p-2">
                                                    {sale.user?.name || 'Sin usuario'}
                                                </td>
                                                <td className="p-2 capitalize">
                                                    {sale.payment_method}
                                                </td>
                                                <td className="p-2 text-right font-semibold">
                                                    {formatCurrency(
                                                        sale.total
                                                    )}
                                                </td>
                                                <td className="p-2 text-sm text-default-500">
                                                    {new Date(
                                                        sale.created_at
                                                    ).toLocaleTimeString(
                                                        'es-PE',
                                                        {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        }
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-default-400">
                                No hay ventas registradas hoy
                            </p>
                        )}
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
}
