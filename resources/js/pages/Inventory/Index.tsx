import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Input,
    Switch,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Pagination,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@heroui/react';
import { useMemo, useState } from 'react';
import { Plus, Filter, Package2, ArrowDown, ArrowUp, AlertTriangle, X, Search } from 'lucide-react';

interface ProductOption {
    id: number;
    name: string;
    sku: string;
    stock: number;
    min_stock: number;
}

interface Movement {
    id: number;
    product_id: number;
    type: 'entry' | 'exit' | 'adjustment';
    quantity: number;
    previous_stock: number;
    new_stock: number;
    reason: string | null;
    created_at: string;
    product: {
        name: string;
        sku: string;
        stock: number;
        min_stock: number;
    };
    user: {
        name: string;
    } | null;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    movements: Paginated<Movement>;
    products: ProductOption[];
    filters: {
        type?: string;
        product_id?: string;
        from?: string;
        to?: string;
        search?: string;
        low_stock?: boolean | string | number;
    };
    summary: {
        entries: number;
        exits: number;
        adjustments: number;
    };
}

const typeLabels: Record<string, string> = {
    entry: 'Entrada',
    exit: 'Salida',
    adjustment: 'Ajuste',
};

const typeColors: Record<string, 'success' | 'danger' | 'warning'> = {
    entry: 'success',
    exit: 'danger',
    adjustment: 'warning',
};

export default function InventoryIndex({ movements, products, filters, summary }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterState, setFilterState] = useState({
        type: filters.type || '',
        product_id: filters.product_id || '',
        from: filters.from || '',
        to: filters.to || '',
        search: filters.search || '',
        low_stock: Boolean(filters.low_stock),
    });
    const { data, setData, post, processing, reset, errors } = useForm({
        product_id: filters.product_id || '',
        type: 'entry',
        quantity: 1,
        reason: '',
    });

    const selectedProduct = useMemo(
        () => products.find((p) => p.id === Number(data.product_id)),
        [products, data.product_id]
    );

    const handleFilter = () => {
        router.get('/inventory', filterState, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetFilters = () => {
        setFilterState({ type: '', product_id: '', from: '', to: '', search: '', low_stock: false });
        router.get('/inventory', {}, { preserveState: true, preserveScroll: true });
    };

    const submitMovement = () => {
        post('/inventory/movements', {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            },
        });
    };

    const lowStock = selectedProduct ? selectedProduct.stock <= selectedProduct.min_stock : false;
    const netMovement = summary.entries - summary.exits + summary.adjustments;
    const netColorClass = netMovement > 0 ? 'text-success' : netMovement < 0 ? 'text-danger' : 'text-default-700';

    return (
        <AppLayout>
            <Head title="Inventario" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Inventario</h1>
                        <p className="text-default-500">Movimientos de stock y ajustes</p>
                    </div>
                    <Button
                        color="primary"
                        startContent={<Plus className="h-5 w-5" />}
                        className="rounded-2xl font-semibold"
                        size="lg"
                        onPress={() => setIsModalOpen(true)}
                    >
                        Nuevo movimiento
                    </Button>
                </div>

                {/* Filtros */}
                <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                    <CardHeader className="flex items-center justify-between px-6 pt-6 pb-2">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-default-500" />
                            <h3 className="text-lg font-semibold">Filtros</h3>
                        </div>
                        <Button variant="light" onPress={handleResetFilters} size="sm" className="rounded-xl">
                            Limpiar
                        </Button>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="flex flex-col gap-2 md:col-span-3">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Buscar</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-default-400" />
                                    <input
                                        type="text"
                                        placeholder="Nombre o SKU"
                                        value={filterState.search}
                                        onChange={(e) => setFilterState((prev) => ({ ...prev, search: e.target.value }))}
                                        className="w-full px-10 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 placeholder:text-default-400 focus:outline-none focus:border-primary/70 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 md:col-span-1">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Stock</label>
                                <label className="flex items-center gap-3 px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 cursor-pointer hover:border-primary/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={filterState.low_stock}
                                        onChange={(e) => setFilterState((prev) => ({ ...prev, low_stock: e.target.checked }))}
                                        className="w-4 h-4 rounded border-2 border-default-300 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    />
                                    <span className="text-sm">Solo bajo stock</span>
                                </label>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Tipo</label>
                                <select
                                    value={filterState.type}
                                    onChange={(e) => setFilterState((prev) => ({ ...prev, type: e.target.value }))}
                                    className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 focus:outline-none focus:border-primary/70 transition-colors [&>option]:dark:bg-[#18181b] [&>option]:dark:text-default-200"
                                >
                                    <option value="">Todos</option>
                                    <option value="entry">Entrada</option>
                                    <option value="exit">Salida</option>
                                    <option value="adjustment">Ajuste</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Producto</label>
                                <select
                                    value={filterState.product_id}
                                    onChange={(e) => setFilterState((prev) => ({ ...prev, product_id: e.target.value }))}
                                    className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 focus:outline-none focus:border-primary/70 transition-colors [&>option]:dark:bg-[#18181b] [&>option]:dark:text-default-200"
                                >
                                    <option value="">Todos</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id.toString()}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Desde</label>
                                <input
                                    type="date"
                                    value={filterState.from}
                                    onChange={(e) => setFilterState((prev) => ({ ...prev, from: e.target.value }))}
                                    className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 focus:outline-none focus:border-primary/70 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Hasta</label>
                                <input
                                    type="date"
                                    value={filterState.to}
                                    onChange={(e) => setFilterState((prev) => ({ ...prev, to: e.target.value }))}
                                    className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 focus:outline-none focus:border-primary/70 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button color="primary" className="rounded-2xl" onPress={handleFilter}>
                                Aplicar filtros
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Resumen */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none overflow-visible">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-default-500 mb-2">Entradas</p>
                                    <h2 className="text-4xl font-bold text-success">{summary.entries}</h2>
                                    <p className="mt-2 text-xs text-default-400">Unidades ingresadas</p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
                                    <ArrowDown className="h-7 w-7 text-green-500" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none overflow-visible">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-default-500 mb-2">Salidas</p>
                                    <h2 className="text-4xl font-bold text-danger">{summary.exits}</h2>
                                    <p className="mt-2 text-xs text-default-400">Unidades retiradas</p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                                    <ArrowUp className="h-7 w-7 text-red-500" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none overflow-visible">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-default-500 mb-2">Ajustes</p>
                                    <h2 className="text-4xl font-bold text-warning">{summary.adjustments}</h2>
                                    <p className="mt-2 text-xs text-default-400">Unidades ajustadas</p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10">
                                    <AlertTriangle className="h-7 w-7 text-yellow-500" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none overflow-visible">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-default-500 mb-2">Movimiento neto</p>
                                    <h2 className={`text-4xl font-bold ${netColorClass}`}>
                                        {netMovement > 0 ? `+${netMovement}` : netMovement}
                                    </h2>
                                    <p className="mt-2 text-xs text-default-400">Entradas - salidas + ajustes</p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                                    <Package2 className="h-7 w-7 text-blue-500" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Tabla de movimientos */}
                <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                    <CardHeader className="px-6 pt-6 pb-2">
                        <h3 className="text-lg font-semibold">Movimientos recientes</h3>
                    </CardHeader>
                    <CardBody className="px-2 pb-4">
                        <Table
                            removeWrapper
                            aria-label="Tabla de movimientos de inventario"
                            classNames={{
                                th: 'bg-default-100 text-default-700 font-semibold uppercase text-xs',
                                td: 'py-3',
                            }}
                        >
                            <TableHeader>
                                <TableColumn>Fecha</TableColumn>
                                <TableColumn>Producto</TableColumn>
                                <TableColumn>Tipo</TableColumn>
                                <TableColumn>Cantidad</TableColumn>
                                <TableColumn>Stock previo</TableColumn>
                                <TableColumn>Stock nuevo</TableColumn>
                                <TableColumn>Motivo</TableColumn>
                                <TableColumn>Usuario</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="Sin movimientos">
                                {movements.data.map((movement) => {
                                    const isLow = movement.new_stock <= movement.product.min_stock;
                                    const isEntry = movement.type === 'entry';
                                    const isExit = movement.type === 'exit';

                                    return (
                                        <TableRow key={movement.id}>
                                            <TableCell>
                                                {new Date(movement.created_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{movement.product.name}</span>
                                                    <span className="text-xs text-default-500">SKU: {movement.product.sku}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={typeColors[movement.type]}
                                                    variant="flat"
                                                    className="capitalize"
                                                    startContent={isEntry ? <ArrowDown className="h-4 w-4 text-green-600" /> : isExit ? <ArrowUp className="h-4 w-4 text-red-600" /> : <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                                                >
                                                    {typeLabels[movement.type]}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <span className={isEntry ? 'text-success font-semibold' : isExit ? 'text-danger font-semibold' : 'font-semibold'}>
                                                    {movement.quantity}
                                                </span>
                                            </TableCell>
                                            <TableCell>{movement.previous_stock}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={isLow ? 'text-danger font-semibold' : 'font-semibold'}>
                                                        {movement.new_stock}
                                                    </span>
                                                    {isLow && (
                                                        <Chip size="sm" color="danger" variant="flat" className="rounded-xl">
                                                            Bajo stock
                                                        </Chip>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-default-500 text-sm">
                                                    {movement.reason || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{movement.user?.name || '—'}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {movements.last_page > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    total={movements.last_page}
                                    page={movements.current_page}
                                    onChange={(page) =>
                                        router.get('/inventory', { ...filterState, page }, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        })
                                    }
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Modal nuevo movimiento */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-[#09090b] rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-divider">
                        <form onSubmit={(e) => { e.preventDefault(); submitMovement(); }} className="flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-divider bg-gradient-to-r from-primary/10 to-secondary/10 sticky top-0 z-10 bg-white dark:bg-[#09090b]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary rounded-xl">
                                        <Package2 className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Nuevo movimiento</h2>
                                        <p className="text-sm text-default-500 mt-1">
                                            Registra entradas, salidas o ajustes de inventario
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    onPress={() => setIsModalOpen(false)}
                                    className="rounded-full"
                                    size="lg"
                                    type="button"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Body */}
                            <div className="p-8 space-y-6 bg-white dark:bg-[#09090b]">
                                {selectedProduct && (
                                    <div className="p-4 rounded-xl bg-default-100 dark:bg-default-50/5 border border-default-200/50 dark:border-default-100/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-default-500 font-medium uppercase tracking-wider">Stock actual</span>
                                                <span className="text-3xl font-bold mt-1">{selectedProduct.stock}</span>
                                            </div>
                                            {lowStock && (
                                                <Chip 
                                                    size="sm" 
                                                    color="danger" 
                                                    variant="flat"
                                                    startContent={<AlertTriangle className="h-3 w-3" />}
                                                    className="font-semibold"
                                                >
                                                    Bajo stock
                                                </Chip>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Producto <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            value={data.product_id}
                                            onChange={(e) => setData('product_id', e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-white dark:bg-[#09090b] transition-all duration-200 outline-none text-foreground [&>option]:bg-white [&>option]:dark:bg-[#09090b] [&>option]:text-foreground"
                                        >
                                            <option value="">Selecciona un producto</option>
                                            {products.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} - SKU: {product.sku}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.product_id && <p className="text-xs text-danger">{errors.product_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Tipo de movimiento <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value as 'entry' | 'exit' | 'adjustment')}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-white dark:bg-[#09090b] transition-all duration-200 outline-none text-foreground [&>option]:bg-white [&>option]:dark:bg-[#09090b] [&>option]:text-foreground"
                                        >
                                            <option value="entry">Entrada</option>
                                            <option value="exit">Salida</option>
                                            <option value="adjustment">Ajuste (delta)</option>
                                        </select>
                                        {errors.type && <p className="text-xs text-danger">{errors.type}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                        Cantidad <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Ingresa la cantidad"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', Number(e.target.value))}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                    />
                                    {errors.quantity && <p className="text-xs text-danger">{errors.quantity}</p>}
                                    <p className="text-xs text-default-400">
                                        {data.type === 'entry' && 'Unidades que se agregarán al stock'}
                                        {data.type === 'exit' && 'Unidades que se restarán del stock'}
                                        {data.type === 'adjustment' && 'Valor positivo o negativo para ajustar el stock'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                        Motivo (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Compra a proveedor, venta, corrección de inventario..."
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                    />
                                    {errors.reason && <p className="text-xs text-danger">{errors.reason}</p>}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-divider bg-default-50 dark:bg-[#18181b] sticky bottom-0">
                                <Button
                                    variant="flat"
                                    onPress={() => setIsModalOpen(false)}
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
                                    Guardar movimiento
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
