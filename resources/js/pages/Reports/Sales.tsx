import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Chip,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from '@heroui/react';
import { ArrowLeft, Download, Calendar, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Props {
    sales: any[];
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

    const handleFilter = () => {
        router.get('/reports/sales', { date_from: dateFrom, date_to: dateTo });
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
                            className="mb-2"
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
                <Card>
                    <CardBody>
                        <div className="flex flex-wrap items-end gap-3">
                            <Input
                                type="date"
                                label="Fecha Desde"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full md:w-auto"
                            />
                            <Input
                                type="date"
                                label="Fecha Hasta"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full md:w-auto"
                            />
                            <Button color="primary" onPress={handleFilter}>
                                Aplicar Filtros
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Resumen */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-2 border-primary">
                        <CardBody>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-default-500">
                                        Total Vendido
                                    </p>
                                    <h2 className="text-3xl font-bold text-primary">
                                        {formatCurrency(summary.total_revenue)}
                                    </h2>
                                </div>
                                <TrendingUp className="h-8 w-8 text-primary" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <div>
                                <p className="text-sm text-default-500">
                                    Número de Ventas
                                </p>
                                <h2 className="text-3xl font-bold">
                                    {summary.total_sales}
                                </h2>
                                <p className="mt-1 text-xs text-default-400">
                                    ventas completadas
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <div>
                                <p className="text-sm text-default-500">
                                    Ticket Promedio
                                </p>
                                <h2 className="text-3xl font-bold">
                                    {formatCurrency(summary.average_ticket)}
                                </h2>
                                <p className="mt-1 text-xs text-default-400">
                                    por venta
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Ventas por Método de Pago */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">
                            Ventas por Método de Pago
                        </h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid gap-3 md:grid-cols-2">
                            {sales_by_payment_method.map((payment) => (
                                <div
                                    key={payment.payment_method}
                                    className="flex items-center justify-between rounded-lg bg-default-100 p-4"
                                >
                                    <div>
                                        <p className="text-lg font-semibold capitalize">
                                            {payment.payment_method === 'efectivo'
                                                ? '💵 Efectivo'
                                                : '📱 Yape'}
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
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">
                                Ventas por Día
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <Table aria-label="Ventas por día">
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
                                                <Chip size="sm">
                                                    {day.count} ventas
                                                </Chip>
                                            </TableCell>
                                            <TableCell className="font-semibold text-primary">
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
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">
                            Detalle de Ventas
                        </h3>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Listado de ventas">
                            <TableHeader>
                                <TableColumn>N° VENTA</TableColumn>
                                <TableColumn>FECHA</TableColumn>
                                <TableColumn>CLIENTE</TableColumn>
                                <TableColumn>PAGO</TableColumn>
                                <TableColumn>TOTAL</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {sales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell className="font-mono text-sm">
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
                                        <TableCell className="capitalize">
                                            {sale.payment_method}
                                        </TableCell>
                                        <TableCell className="font-semibold text-primary">
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
