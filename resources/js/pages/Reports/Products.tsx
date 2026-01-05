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
import {
    ArrowLeft,
    Package,
    AlertTriangle,
    Calendar,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    top_products: any[];
    low_stock_products: any[];
    expiring_products: any[];
    filters: {
        date_from: string;
        date_to: string;
    };
}

export default function ReportsProducts({
    top_products,
    low_stock_products,
    expiring_products,
    filters,
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    const handleFilter = () => {
        router.get('/reports/products', { date_from: dateFrom, date_to: dateTo });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const getDaysUntilExpiration = (expirationDate: string) => {
        const today = new Date();
        const expiration = new Date(expirationDate);
        const diffTime = expiration.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <AppLayout>
            <Head title="Reporte de Productos" />

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
                            Reporte de Productos
                        </h1>
                        <p className="text-default-500">
                            Análisis de inventario y ventas
                        </p>
                    </div>
                </div>

                {/* Filtros */}
                <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                    <CardBody className="px-6 py-6">
                        <div className="grid gap-4 md:grid-cols-3">
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
                                <Button color="primary" onPress={handleFilter} size="lg" className="w-full rounded-2xl font-semibold">
                                    Aplicar Filtros
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Productos más Vendidos */}
                <Card className="border-2 border-success">
                    <CardHeader className="flex items-center gap-2 bg-gradient-to-br from-success-50 to-success-100">
                        <TrendingUp className="h-5 w-5 text-success" />
                        <h3 className="text-lg font-semibold">
                            Productos Más Vendidos
                        </h3>
                    </CardHeader>
                    <CardBody>
                        {top_products.length > 0 ? (
                            <Table aria-label="Productos más vendidos">
                                <TableHeader>
                                    <TableColumn>PRODUCTO</TableColumn>
                                    <TableColumn>CATEGORÍA</TableColumn>
                                    <TableColumn>CANTIDAD VENDIDA</TableColumn>
                                    <TableColumn>INGRESOS</TableColumn>
                                    <TableColumn>STOCK ACTUAL</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {top_products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-success" />
                                                    <span className="font-medium">
                                                        {product.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                >
                                                    {product.category?.name}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color="success"
                                                    size="sm"
                                                >
                                                    {product.total_sold} unidades
                                                </Chip>
                                            </TableCell>
                                            <TableCell className="font-semibold text-success">
                                                {formatCurrency(
                                                    product.total_revenue
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={
                                                        product.stock <
                                                        product.min_stock
                                                            ? 'danger'
                                                            : 'default'
                                                    }
                                                    size="sm"
                                                >
                                                    {product.stock}
                                                </Chip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center text-default-400">
                                No hay datos de ventas en el período seleccionado
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Productos con Stock Bajo */}
                <Card className="border-2 border-warning">
                    <CardHeader className="flex items-center gap-2 bg-gradient-to-br from-warning-50 to-warning-100">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        <h3 className="text-lg font-semibold">
                            Productos con Stock Bajo
                        </h3>
                    </CardHeader>
                    <CardBody>
                        {low_stock_products.length > 0 ? (
                            <Table aria-label="Productos con stock bajo">
                                <TableHeader>
                                    <TableColumn>PRODUCTO</TableColumn>
                                    <TableColumn>CATEGORÍA</TableColumn>
                                    <TableColumn>STOCK ACTUAL</TableColumn>
                                    <TableColumn>STOCK MÍNIMO</TableColumn>
                                    <TableColumn>ESTADO</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {low_stock_products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                                {product.name}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                >
                                                    {product.category?.name}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={
                                                        product.stock === 0
                                                            ? 'danger'
                                                            : 'warning'
                                                    }
                                                    size="sm"
                                                >
                                                    {product.stock}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                {product.min_stock}
                                            </TableCell>
                                            <TableCell>
                                                {product.stock === 0 ? (
                                                    <Chip
                                                        color="danger"
                                                        size="sm"
                                                    >
                                                        Sin Stock
                                                    </Chip>
                                                ) : (
                                                    <Chip
                                                        color="warning"
                                                        size="sm"
                                                    >
                                                        Stock Bajo
                                                    </Chip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center text-success">
                                ✓ Todos los productos tienen stock suficiente
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Productos Próximos a Vencer */}
                <Card className="border-2 border-danger">
                    <CardHeader className="flex items-center gap-2 bg-gradient-to-br from-danger-50 to-danger-100">
                        <Calendar className="h-5 w-5 text-danger" />
                        <h3 className="text-lg font-semibold">
                            Productos Próximos a Vencer
                        </h3>
                    </CardHeader>
                    <CardBody>
                        {expiring_products.length > 0 ? (
                            <Table aria-label="Productos próximos a vencer">
                                <TableHeader>
                                    <TableColumn>PRODUCTO</TableColumn>
                                    <TableColumn>CATEGORÍA</TableColumn>
                                    <TableColumn>FECHA DE VENCIMIENTO</TableColumn>
                                    <TableColumn>DÍAS RESTANTES</TableColumn>
                                    <TableColumn>STOCK</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {expiring_products.map((product) => {
                                        const daysLeft = getDaysUntilExpiration(
                                            product.expiration_date
                                        );
                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">
                                                    {product.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {product.category?.name}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        product.expiration_date
                                                    ).toLocaleDateString(
                                                        'es-PE'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={
                                                            daysLeft <= 7
                                                                ? 'danger'
                                                                : daysLeft <= 30
                                                                ? 'warning'
                                                                : 'default'
                                                        }
                                                        size="sm"
                                                    >
                                                        {daysLeft > 0
                                                            ? `${daysLeft} días`
                                                            : 'Vencido'}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    {product.stock} unidades
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center text-success">
                                ✓ No hay productos próximos a vencer
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
}
