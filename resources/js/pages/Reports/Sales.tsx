import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Chip,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from '@heroui/react';
import { ArrowLeft, TrendingUp, ShoppingCart, Receipt } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
    sales: Array<{
        id: number;
        sale_number: string;
        created_at: string;
        customer?: { name: string };
        payment_method: string;
        total: number;
        details: Array<{
            id: number;
            product: {
                name: string;
                sku: string;
            };
            quantity: number;
            unit_price: number;
            subtotal: number;
        }>;
    }>;
    summary: {
        total_revenue: number;
        total_sales: number;
        average_ticket: number;
    };
    sales_by_day: any[];
    sales_by_payment_method: any[];
    filters: {
        date_from: string;
        date_to: string;
    };
}

export default function ReportsSales({
    sales,
    summary,
    sales_by_day,
    sales_by_payment_method,
    filters,
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    useEffect(() => {
        setDateFrom(filters.date_from);
        setDateTo(filters.date_to);
    }, [filters]);

    const handleFilter = () => {
        router.get('/reports/sales', { date_from: dateFrom, date_to: dateTo }, { preserveState: true });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Reporte de Ventas" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            variant="flat"
                            startContent={<ArrowLeft className="h-4 w-4" />}
                            onPress={() => router.get('/reports')}
                            className="mb-2 rounded-xl"
                        >
                            Volver
                        </Button>
                        <h1 className="text-2xl font-bold">
                            Reporte de Ventas
                        </h1>
                        <p className="text-default-500">
                            Análisis detallado de ventas
                        </p>
                    </div>
                </div>

                {/* Filtros */}
                <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                    <CardHeader className="pb-4 px-6 pt-6">
                        <div className="grid w-full gap-4 md:grid-cols-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Fecha Desde</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 focus:outline-none focus:border-primary/70 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Fecha Hasta</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 focus:outline-none focus:border-primary/70 transition-colors"
                                />
                            </div>

                            <div className="flex items-end">
                                <Button 
                                    color="primary" 
                                    onPress={handleFilter}
                                    size="lg"
                                    className="w-full rounded-2xl font-semibold"
                                >
                                    Aplicar Filtros
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Resumen */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none overflow-visible">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-default-500 mb-2">
                                        Total Vendido
                                    </p>
                                    <h2 className="text-4xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                                        {formatCurrency(summary.total_revenue)}
                                    </h2>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                                    <TrendingUp className="h-7 w-7 text-primary" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none overflow-visible">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-default-500 mb-2">
                                        Número de Ventas
                                    </p>
                                    <h2 className="text-4xl font-bold">
                                        {summary.total_sales}
                                    </h2>
                                    <p className="mt-2 text-xs text-default-400">
                                        ventas completadas
                                    </p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/20">
                                    <ShoppingCart className="h-7 w-7 text-success" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none overflow-visible">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-default-500 mb-2">
                                        Ticket Promedio
                                    </p>
                                    <h2 className="text-4xl font-bold">
                                        {formatCurrency(summary.average_ticket)}
                                    </h2>
                                    <p className="mt-2 text-xs text-default-400">
                                        por venta
                                    </p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/20">
                                    <Receipt className="h-7 w-7 text-warning" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Ventas por Método de Pago */}
                <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                    <CardHeader className="px-6 pt-6 pb-4">
                        <h3 className="text-lg font-semibold">
                            Ventas por Método de Pago
                        </h3>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            {sales_by_payment_method.map((payment) => (
                                <div
                                    key={payment.payment_method}
                                    className="flex items-center justify-between rounded-2xl bg-default-100 dark:bg-default-50/5 p-5 border border-default-200/50 dark:border-default-100/10"
                                >
                                    <div>
                                        <p className="text-base font-semibold capitalize mb-1">
                                            {payment.payment_method === 'efectivo'
                                                ? 'Efectivo'
                                                : 'Yape'}
                                        </p>
                                        <p className="text-sm text-default-500">
                                            {payment.count} ventas
                                        </p>
                                    </div>
                                    <p className="text-2xl font-bold text-primary">
                                        {formatCurrency(payment.total)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Ventas por Día */}
                {sales_by_day.length > 0 && (
                    <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                        <CardHeader className="px-6 pt-6 pb-4">
                            <h3 className="text-lg font-semibold">
                                Ventas por Día
                            </h3>
                        </CardHeader>
                        <CardBody className="px-6 pb-6">
                            <Table 
                                aria-label="Ventas por día"
                                classNames={{
                                    wrapper: "rounded-2xl shadow-none border border-default-200/50 dark:border-default-100/10",
                                    th: "bg-default-100 dark:bg-default-50/5 text-default-700 dark:text-default-200 font-bold",
                                    td: "py-4"
                                }}
                            >
                                <TableHeader>
                                    <TableColumn>FECHA</TableColumn>
                                    <TableColumn>VENTAS</TableColumn>
                                    <TableColumn>TOTAL</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {sales_by_day.map((day, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {new Date(
                                                    day.date
                                                ).toLocaleDateString('es-PE', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="sm" className="font-semibold">
                                                    {day.count} ventas
                                                </Chip>
                                            </TableCell>
                                            <TableCell className="font-bold text-primary text-lg">
                                                {formatCurrency(day.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                )}

                {/* Listado de Ventas */}
                <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                    <CardHeader className="px-6 pt-6 pb-4">
                        <h3 className="text-lg font-semibold">
                            Detalle de Ventas
                        </h3>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        <Table 
                            aria-label="Listado de ventas"
                            classNames={{
                                wrapper: "rounded-2xl shadow-none border border-default-200/50 dark:border-default-100/10",
                                th: "bg-default-100 dark:bg-default-50/5 text-default-700 dark:text-default-200 font-bold",
                                td: "py-4"
                            }}
                        >
                            <TableHeader>
                                <TableColumn>N° VENTA</TableColumn>
                                <TableColumn>FECHA</TableColumn>
                                <TableColumn>CLIENTE</TableColumn>
                                <TableColumn>PRODUCTOS</TableColumn>
                                <TableColumn>PAGO</TableColumn>
                                <TableColumn>TOTAL</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="No hay ventas en este periodo">
                                {sales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell className="font-mono text-sm font-semibold">
                                            {sale.sale_number}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                sale.created_at
                                            ).toLocaleDateString('es-PE')}
                                        </TableCell>
                                        <TableCell>
                                            {sale.customer?.name ||
                                                'Cliente General'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {sale.details?.slice(0, 2).map((detail) => (
                                                    <div key={detail.id} className="flex items-center gap-2 text-xs">
                                                        <Chip size="sm" variant="flat" className="rounded-lg">
                                                            {detail.quantity}x
                                                        </Chip>
                                                        <span className="text-default-600 line-clamp-1">
                                                            {detail.product.name}
                                                        </span>
                                                    </div>
                                                ))}
                                                {sale.details && sale.details.length > 2 && (
                                                    <span className="text-xs text-default-400 italic">
                                                        +{sale.details.length - 2} más
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {sale.payment_method}
                                        </TableCell>
                                        <TableCell className="font-bold text-primary text-lg">
                                            {formatCurrency(sale.total)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
}
