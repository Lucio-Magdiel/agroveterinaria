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
    Pagination,
} from '@heroui/react';
import {
    ArrowLeft,
    Package,
    DollarSign,
    ShoppingCart,
    AlertTriangle,
    Calendar,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { categories } from '@/routes';

interface Category {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    products_count: number;
    created_at: string;
}

interface Product {
    id: number;
    sku: string;
    name: string;
    category: { name: string };
    purchase_price: number;
    sale_price: number;
    stock: number;
    min_stock: number;
    unit: string;
    is_active: boolean;
    expiration_date: string | null;
}

interface Props {
    category: Category;
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function CategoryShow({ category, products }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Categorías',
            href: categories().url,
        },
        {
            title: category.name,
            href: categories(category.id).url,
        },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const handlePageChange = (page: number) => {
        router.get(
            categories(category.id).url,
            { page },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Calcular estadísticas
    const totalProducts = products.total;
    const activeProducts = products.data.filter((p) => p.is_active).length;
    const lowStockProducts = products.data.filter(
        (p) => p.stock <= p.min_stock
    ).length;
    const totalInventoryValue = products.data.reduce(
        (sum, p) => sum + p.stock * p.purchase_price,
        0
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${category.name} - Categorías`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-3">
                            <Button
                                isIconOnly
                                variant="flat"
                                onPress={() => router.visit(categories().url)}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-2xl font-bold">
                                {category.name}
                            </h1>
                            <Chip
                                color={category.is_active ? 'success' : 'danger'}
                                variant="flat"
                            >
                                {category.is_active ? 'Activa' : 'Inactiva'}
                            </Chip>
                        </div>
                        {category.description && (
                            <p className="text-default-500 ml-14">
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Productos */}
                    <Card className="border-none bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl rounded-3xl">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="text-white">
                                    <p className="mb-2 text-sm font-medium opacity-90">
                                        Total Productos
                                    </p>
                                    <h2 className="text-4xl font-bold">
                                        {totalProducts}
                                    </h2>
                                    <p className="mt-3 text-sm font-medium">
                                        productos registrados
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/20 p-4">
                                    <Package className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Productos Activos */}
                    <Card className="border-none bg-gradient-to-br from-green-500 to-green-600 shadow-xl rounded-3xl">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="text-white">
                                    <p className="mb-2 text-sm font-medium opacity-90">
                                        Productos Activos
                                    </p>
                                    <h2 className="text-4xl font-bold">
                                        {activeProducts}
                                    </h2>
                                    <p className="mt-3 text-sm font-medium">
                                        disponibles para venta
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/20 p-4">
                                    <ShoppingCart className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Stock Bajo */}
                    <Card className="border-none bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl rounded-3xl">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="text-white">
                                    <p className="mb-2 text-sm font-medium opacity-90">
                                        Stock Bajo
                                    </p>
                                    <h2 className="text-4xl font-bold">
                                        {lowStockProducts}
                                    </h2>
                                    <p className="mt-3 text-sm font-medium">
                                        productos con alerta
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/20 p-4">
                                    <AlertTriangle className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Valor del Inventario */}
                    <Card className="border-none bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl rounded-3xl">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="text-white">
                                    <p className="mb-2 text-sm font-medium opacity-90">
                                        Valor Inventario
                                    </p>
                                    <h2 className="text-2xl font-bold">
                                        {formatCurrency(totalInventoryValue)}
                                    </h2>
                                    <p className="mt-3 text-sm font-medium">
                                        inversión total
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/20 p-4">
                                    <DollarSign className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Tabla de Productos */}
                <Card>
                    <CardHeader className="flex flex-col gap-3">
                        <div className="flex w-full items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                Productos de la Categoría
                            </h2>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Tabla de productos de la categoría">
                            <TableHeader>
                                <TableColumn>SKU</TableColumn>
                                <TableColumn>PRODUCTO</TableColumn>
                                <TableColumn>PRECIO COMPRA</TableColumn>
                                <TableColumn>PRECIO VENTA</TableColumn>
                                <TableColumn>STOCK</TableColumn>
                                <TableColumn>MARGEN</TableColumn>
                                <TableColumn>ESTADO</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {products.data.map((product) => {
                                    const margin =
                                        ((product.sale_price -
                                            product.purchase_price) /
                                            product.purchase_price) *
                                        100;
                                    const isLowStock =
                                        product.stock <= product.min_stock;

                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <span className="font-mono text-sm">
                                                    {product.sku}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-semibold">
                                                        {product.name}
                                                    </p>
                                                    {product.expiration_date && (
                                                        <p className="flex items-center gap-1 text-xs text-default-500">
                                                            <Calendar className="h-3 w-3" />
                                                            Vence:{' '}
                                                            {new Date(
                                                                product.expiration_date
                                                            ).toLocaleDateString(
                                                                'es-PE'
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(
                                                    product.purchase_price
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-primary">
                                                    {formatCurrency(
                                                        product.sale_price
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p
                                                        className={
                                                            isLowStock
                                                                ? 'font-bold text-danger'
                                                                : ''
                                                        }
                                                    >
                                                        {product.stock}{' '}
                                                        {product.unit}
                                                    </p>
                                                    {isLowStock && (
                                                        <p className="text-xs text-danger">
                                                            ⚠️ Stock mínimo:{' '}
                                                            {product.min_stock}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={
                                                        margin >= 30
                                                            ? 'success'
                                                            : margin >= 15
                                                            ? 'warning'
                                                            : 'danger'
                                                    }
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {margin.toFixed(1)}%
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={
                                                        product.is_active
                                                            ? 'success'
                                                            : 'danger'
                                                    }
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {product.is_active
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </Chip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {products.last_page > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    total={products.last_page}
                                    page={products.current_page}
                                    onChange={handlePageChange}
                                    showControls
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
}
