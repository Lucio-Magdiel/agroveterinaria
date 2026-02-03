import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
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
    Plus,
    Edit2,
    Trash2,
    X,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

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
    description: string | null;
    category: { name: string };
    purchase_price: number;
    sale_price: number;
    price_per_kg: number | null;
    stock: number;
    min_stock: number;
    unit: string;
    kg_per_unit: number | null;
    allow_fractional_sale: boolean;
    expiration_date: string | null;
    image: string | null;
    is_active: boolean;
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        sku: '',
        name: '',
        description: '',
        category_id: category.id.toString(),
        purchase_price: '',
        sale_price: '',
        price_per_kg: '',
        stock: '0',
        min_stock: '0',
        unit: 'unidad',
        kg_per_unit: '',
        allow_fractional_sale: false,
        expiration_date: '',
        is_active: true,
        stay_on_category: true,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Categorías',
            href: '/categories',
        },
        {
            title: category.name,
            href: `/categories/${category.id}`,
        },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const openModal = (product?: Product) => {
        if (product) {
            console.log('Product data:', product); // Debug
            setEditingProduct(product);
            setData({
                sku: product.sku,
                name: product.name,
                description: product.description || '',
                category_id: category.id.toString(),
                purchase_price: product.purchase_price.toString(),
                sale_price: product.sale_price.toString(),
                price_per_kg: product.price_per_kg?.toString() || '',
                stock: product.stock.toString(),
                min_stock: product.min_stock.toString(),
                unit: product.unit,
                kg_per_unit: product.kg_per_unit?.toString() || '',
                allow_fractional_sale: product.allow_fractional_sale,
                expiration_date: product.expiration_date || '',
                is_active: product.is_active,
                stay_on_category: true,
            });
        } else {
            setEditingProduct(null);
            reset();
            setData('category_id', category.id.toString());
            setData('stay_on_category', true);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const onSuccess = () => {
            closeModal();
        };

        if (editingProduct) {
            put(`/products/${editingProduct.id}`, {
                preserveState: true,
                preserveScroll: true,
                onSuccess,
            });
        } else {
            post('/products', {
                preserveState: true,
                preserveScroll: true,
                onSuccess,
            });
        }
    };

    const handleDelete = (productId: number) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            router.delete(`/products/${productId}`, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handlePageChange = (page: number) => {
        router.get(
            `/categories/${category.id}`,
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
                                onPress={() => router.visit('/categories')}
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
                    <Card className="shadow-2xl rounded-3xl border-none bg-gradient-to-br from-blue-500 to-blue-600">
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
                    <Card className="shadow-2xl rounded-3xl border-none bg-gradient-to-br from-green-500 to-green-600">
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
                    <Card className="shadow-2xl rounded-3xl border-none bg-gradient-to-br from-orange-500 to-orange-600">
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
                    <Card className="shadow-2xl rounded-3xl border-none bg-gradient-to-br from-purple-500 to-purple-600">
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
                <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                    <CardHeader className="pb-4 px-6 pt-6">
                        <div className="flex w-full items-center justify-between">
                            <h2 className="text-xl font-bold">
                                Productos de la Categoría
                            </h2>
                            <Button
                                color="primary"
                                startContent={<Plus className="h-5 w-5" />}
                                onPress={() => openModal()}
                                size="lg"
                                className="shadow-lg rounded-2xl font-semibold"
                            >
                                Nuevo Producto
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        <Table 
                            aria-label="Tabla de productos de la categoría"
                            classNames={{
                                wrapper: "rounded-2xl shadow-none",
                                th: "bg-default-100 text-default-700 font-bold",
                                td: "py-4"
                            }}
                        >
                            <TableHeader>
                                <TableColumn>SKU</TableColumn>
                                <TableColumn>PRODUCTO</TableColumn>
                                <TableColumn>PRECIO COMPRA</TableColumn>
                                <TableColumn>PRECIO VENTA</TableColumn>
                                <TableColumn>STOCK</TableColumn>
                                <TableColumn>MARGEN</TableColumn>
                                <TableColumn>ESTADO</TableColumn>
                                <TableColumn>ACCIONES</TableColumn>
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
                                                    className={`rounded-lg ${product.is_active ? 'text-green-600' : 'text-red-600'}`}
                                                    startContent={
                                                        product.is_active ? (
                                                            <CheckCircle className="h-4 w-4" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4" />
                                                        )
                                                    }
                                                >
                                                    {product.is_active
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        onPress={() => openModal(product)}
                                                        className="rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        onPress={() => handleDelete(product.id)}
                                                        className="rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
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

            {/* Modal CRUD Producto */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-[#09090b] rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-divider">
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-divider bg-gradient-to-r from-primary/5 to-secondary/5 sticky top-0 z-10 bg-white dark:bg-[#09090b]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary rounded-xl">
                                        <Package className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                                        </h2>
                                        <p className="text-sm text-default-500 mt-1">
                                            Categoría: {category.name}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    onPress={closeModal}
                                    className="rounded-full"
                                    size="lg"
                                    type="button"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Body */}
                            <div className="p-8 space-y-6 bg-white dark:bg-[#09090b]">
                                {/* Información Básica */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-primary" />
                                        Información Básica
                                    </h3>
                                    
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                                SKU / Código <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: ALI-001"
                                                value={data.sku}
                                                onChange={(e) => setData('sku', e.target.value)}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                            />
                                            {errors.sku && <p className="text-xs text-danger">{errors.sku}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                                Unidad de Medida <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: unidad, kg, litro..."
                                                value={data.unit}
                                                onChange={(e) => setData('unit', e.target.value)}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Nombre del Producto <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Alimento para Ganado 50kg"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                        />
                                        {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
                                    </div>
                                </div>

                                {/* Separador */}
                                <div className="border-t border-divider" />

                                {/* Precios */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-success" />
                                        Precios
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                                Precio de Compra <span className="text-danger">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-default-500">S/</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={data.purchase_price}
                                                    onChange={(e) => setData('purchase_price', e.target.value)}
                                                    required
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                                />
                                            </div>
                                            {errors.purchase_price && <p className="text-xs text-danger">{errors.purchase_price}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                                Precio de Venta <span className="text-danger">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-default-500">S/</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={data.sale_price}
                                                    onChange={(e) => setData('sale_price', e.target.value)}
                                                    required
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                                />
                                            </div>
                                            {errors.sale_price && <p className="text-xs text-danger">{errors.sale_price}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Separador */}
                                <div className="border-t border-divider" />

                                {/* Inventario */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-warning" />
                                        Inventario
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                                Stock Inicial <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={data.stock}
                                                onChange={(e) => setData('stock', e.target.value)}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                                Stock Mínimo <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={data.min_stock}
                                                onChange={(e) => setData('min_stock', e.target.value)}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                                Fecha de Vencimiento
                                            </label>
                                            <input
                                                type="date"
                                                value={data.expiration_date}
                                                onChange={(e) => setData('expiration_date', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Separador */}
                                <div className="border-t border-divider" />

                                {/* Venta Fraccionada */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-secondary" />
                                        Venta Fraccionada
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                                Kilogramos por {data.unit || 'unidad'}
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Ej: 9 para bolsa de 9kg"
                                                value={data.kg_per_unit}
                                                onChange={(e) => setData('kg_per_unit', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                            />
                                            {errors.kg_per_unit && <p className="text-xs text-danger">{errors.kg_per_unit}</p>}
                                            <p className="text-xs text-default-400">Opcional - Para productos que se pueden vender por peso</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                                Precio por kilogramo
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-default-500">S/</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={data.price_per_kg}
                                                    onChange={(e) => setData('price_per_kg', e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                                />
                                            </div>
                                            {errors.price_per_kg && <p className="text-xs text-danger">{errors.price_per_kg}</p>}
                                            <p className="text-xs text-default-400">Precio al vender por kilo</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                                Permitir venta fraccionada
                                            </label>
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-default-100 border-2 border-default-300/40 dark:border-default-600/40">
                                                <input
                                                    type="checkbox"
                                                    checked={data.allow_fractional_sale}
                                                    onChange={(e) => setData('allow_fractional_sale', e.target.checked)}
                                                    className="w-5 h-5 rounded"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-default-700 dark:text-default-300">
                                                        Vender por kilos
                                                    </p>
                                                    <p className="text-xs text-default-500">
                                                        Permite vender cantidades fraccionadas en kilos
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {data.kg_per_unit && data.stock && (
                                        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                                            <p className="text-sm text-secondary-700 dark:text-secondary-300">
                                                <span className="font-semibold">Disponible:</span> {data.stock} {data.unit}s = {(parseFloat(data.stock) * parseFloat(data.kg_per_unit)).toFixed(2)} kg
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Separador */}
                                <div className="border-t border-divider" />

                                {/* Estado */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-success" />
                                        Estado del Producto
                                    </h3>
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-default-100">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="w-5 h-5 rounded"
                                        />
                                        <div className="flex items-center gap-2">
                                            {data.is_active ? (
                                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                            )}
                                            <div>
                                                <p className={`text-sm font-medium ${data.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    Producto {data.is_active ? 'Activo' : 'Inactivo'}
                                                </p>
                                                <p className="text-xs text-default-500">
                                                    {data.is_active 
                                                        ? 'Este producto estará visible y disponible para ventas' 
                                                        : 'Este producto estará oculto y no se podrá vender'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-divider bg-default-50 dark:bg-[#18181b] sticky bottom-0">
                                <Button
                                    variant="flat"
                                    onPress={closeModal}
                                    isDisabled={processing}
                                    size="lg"
                                    type="button"
                                    className="rounded-xl font-medium"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    color="primary"
                                    type="submit"
                                    isLoading={processing}
                                    size="lg"
                                    className="rounded-xl font-semibold px-8"
                                >
                                    {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
