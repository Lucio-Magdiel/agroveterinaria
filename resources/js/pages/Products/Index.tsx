import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Switch,
    Chip,
    Pagination,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from '@heroui/react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Package,
    AlertCircle,
    Calendar,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    category: Category;
    purchase_price: number;
    sale_price: number;
    stock: number;
    min_stock: number;
    unit: string;
    expiration_date: string | null;
    image: string | null;
    is_active: boolean;
}

interface Props {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    filters: {
        search?: string;
        category_id?: number;
        low_stock?: boolean;
    };
}

export default function ProductsIndex({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(
        filters.category_id?.toString() || ''
    );
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        sku: '',
        name: '',
        description: '',
        category_id: '',
        purchase_price: '',
        sale_price: '',
        stock: '0',
        min_stock: '0',
        unit: 'unidad',
        expiration_date: '',
        is_active: true,
    });

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setData({
                sku: product.sku,
                name: product.name,
                description: product.description || '',
                category_id: product.category.id.toString(),
                purchase_price: product.purchase_price.toString(),
                sale_price: product.sale_price.toString(),
                stock: product.stock.toString(),
                min_stock: product.min_stock.toString(),
                unit: product.unit,
                expiration_date: product.expiration_date || '',
                is_active: product.is_active,
            });
        } else {
            setEditingProduct(null);
            reset();
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

        const url = editingProduct
            ? `/products/${editingProduct.id}`
            : '/products';

        const method = editingProduct ? 'put' : 'post';

        router[method](url, data as any, {
            onSuccess: () => {
                closeModal();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            router.delete(`/products/${id}`);
        }
    };

    const handleSearch = () => {
        router.get(
            '/products',
            { search, category_id: categoryFilter },
            { preserveState: true }
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    return (
        <>
            <AppLayout>
                <Head title="Productos" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Productos</h1>
                        <p className="text-default-500">
                            Gestiona el inventario de productos
                        </p>
                    </div>
                    <Button
                        color="primary"
                        startContent={<Plus className="h-4 w-4" />}
                        onPress={() => openModal()}
                    >
                        Nuevo Producto
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex w-full flex-col gap-2 md:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-default-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o SKU..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    className="w-full rounded-xl border-2 border-default-300/40 bg-transparent py-2 pl-10 pr-4 text-foreground outline-none transition-all duration-200 placeholder:text-default-400 hover:border-default-400/60 focus:border-primary/70 dark:border-default-600/40 dark:hover:border-default-500/60 dark:focus:border-primary/70"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full rounded-xl border-2 border-default-300/40 bg-white px-4 py-2 text-foreground outline-none transition-all duration-200 hover:border-default-400/60 focus:border-primary/70 dark:border-default-600/40 dark:bg-gray-900 dark:hover:border-default-500/60 dark:focus:border-primary/70 md:w-64 [&>option]:rounded-lg [&>option]:bg-white [&>option]:text-foreground [&>option]:dark:bg-gray-900"
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <Button color="primary" onPress={handleSearch}>
                                Buscar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Tabla de productos">
                            <TableHeader>
                                <TableColumn>PRODUCTO</TableColumn>
                                <TableColumn>CATEGORÍA</TableColumn>
                                <TableColumn>STOCK</TableColumn>
                                <TableColumn>PRECIO</TableColumn>
                                <TableColumn>ESTADO</TableColumn>
                                <TableColumn>ACCIONES</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {products.data.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-default-500">
                                                    SKU: {product.sku}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {product.category.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {product.stock <=
                                                product.min_stock ? (
                                                    <AlertCircle className="h-4 w-4 text-warning" />
                                                ) : null}
                                                <span
                                                    className={
                                                        product.stock <=
                                                        product.min_stock
                                                            ? 'font-semibold text-warning'
                                                            : ''
                                                    }
                                                >
                                                    {product.stock}{' '}
                                                    {product.unit}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                product.sale_price
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                color={
                                                    product.is_active
                                                        ? 'success'
                                                        : 'default'
                                                }
                                            >
                                                {product.is_active
                                                    ? 'Activo'
                                                    : 'Inactivo'}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="flat"
                                                    onPress={() =>
                                                        openModal(product)
                                                    }
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    color="danger"
                                                    variant="flat"
                                                    onPress={() =>
                                                        handleDelete(product.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {products.last_page > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    total={products.last_page}
                                    page={products.current_page}
                                    onChange={(page) =>
                                        router.get('/products', { page })
                                    }
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            </AppLayout>

            {/* Modal Overlay Personalizado */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative z-10 w-full max-w-5xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-divider">
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-divider bg-gradient-to-r from-primary/10 to-secondary/10 sticky top-0 z-10 bg-white dark:bg-gray-900">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary rounded-xl">
                                        <Package className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                                        </h2>
                                        <p className="text-sm text-default-500 mt-1">
                                            {editingProduct ? 'Modifica la información del producto' : 'Completa los datos del nuevo producto'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    onPress={closeModal}
                                    className="rounded-full"
                                    size="lg"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Body */}
                            <div className="p-8 space-y-8 bg-white dark:bg-gray-900">
                                {/* Información Básica */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-primary" />
                                        Información Básica
                                    </h3>
                                    
                                    <div className="grid gap-6 md:grid-cols-2">
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
                                                autoFocus
                                                className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                            />
                                            {errors.sku && <p className="text-xs text-danger">{errors.sku}</p>}
                                            <p className="text-xs text-default-400">Código único del producto</p>
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
                                            <p className="text-xs text-default-400">Cómo se mide este producto</p>
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Descripción
                                        </label>
                                        <textarea
                                            placeholder="Describe el producto..."
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400 resize-none"
                                        />
                                        <p className="text-xs text-default-400">Opcional - Información adicional</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Categoría <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-white dark:bg-gray-900 transition-all duration-200 outline-none text-foreground [&>option]:bg-white [&>option]:dark:bg-gray-900 [&>option]:text-foreground [&>option]:rounded-lg [&>option]:my-1 [&>option]:px-2"
                                        >
                                            <option value="">Selecciona una categoría</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && <p className="text-xs text-danger">{errors.category_id}</p>}
                                    </div>
                                </div>

                                {/* Separador */}
                                <div className="border-t border-divider" />

                                {/* Precios */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-success" />
                                        Precios
                                    </h3>
                                    <div className="grid gap-6 md:grid-cols-2">
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
                                            <p className="text-xs text-default-400">Precio al que compras</p>
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
                                            <p className="text-xs text-default-400">Precio al que vendes</p>
                                        </div>
                                    </div>
                                    {data.purchase_price && data.sale_price && parseFloat(data.sale_price) > parseFloat(data.purchase_price) && (
                                        <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                                            <p className="text-sm text-success-700 dark:text-success-300">
                                                <span className="font-semibold">Margen:</span> S/ {(parseFloat(data.sale_price) - parseFloat(data.purchase_price)).toFixed(2)} ({(((parseFloat(data.sale_price) - parseFloat(data.purchase_price)) / parseFloat(data.purchase_price)) * 100).toFixed(1)}%)
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Separador */}
                                <div className="border-t border-divider" />

                                {/* Inventario */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-warning" />
                                        Control de Inventario
                                    </h3>
                                    <div className="grid gap-6 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                                Stock Actual <span className="text-danger">*</span>
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
                                            <p className="text-xs text-default-400">Alerta de bajo stock</p>
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
                                            <p className="text-xs text-default-400">Opcional</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Separador */}
                                <div className="border-t border-divider" />

                                {/* Estado */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-secondary" />
                                        Estado del Producto
                                    </h3>
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-default-100">
                                        <Switch
                                            isSelected={data.is_active}
                                            onValueChange={(value) => setData('is_active', value)}
                                            size="lg"
                                            color="success"
                                        />
                                        <div>
                                            <p className="text-sm font-medium">
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

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-divider bg-default-50 dark:bg-gray-800 sticky bottom-0">
                                <Button
                                    variant="flat"
                                    onPress={closeModal}
                                    isDisabled={processing}
                                    size="lg"
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
        </>
    );
}





