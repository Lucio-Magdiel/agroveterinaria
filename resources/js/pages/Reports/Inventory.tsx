import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Input,
    Pagination,
    Select,
    SelectItem,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react';
import { useMemo, useState } from 'react';
import { BarChart3, Filter, ArrowDown, ArrowUp, AlertTriangle, Lock } from 'lucide-react';

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

interface ByProductRow {
    product_id: number;
    entries: number;
    exits: number;
    adjustments: number;
    product: {
        name: string;
        sku: string;
        stock: number;
        min_stock: number;
    };
}

interface Props {
    movements: Paginated<Movement>;
    products: ProductOption[];
    summary: {
        entries: number;
        exits: number;
        adjustments: number;
    };
    by_product: ByProductRow[];
    filters: {
        date_from?: string;
        date_to?: string;
        type?: string;
        product_id?: string;
        search?: string;
        low_stock?: boolean | string | number;
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

export default function InventoryReport({ movements, products, summary, by_product, filters }: Props) {
    const [filterState, setFilterState] = useState({
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        type: filters.type || '',
        product_id: filters.product_id || '',
        search: filters.search || '',
        low_stock: Boolean(filters.low_stock),
    });

    const netMovement = summary.entries - summary.exits + summary.adjustments;
    const netColorClass = netMovement > 0 ? 'text-success' : netMovement < 0 ? 'text-danger' : 'text-default-700';

    const handleFilter = () => {
        router.get('/reports/inventory', filterState, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        const defaults = { date_from: '', date_to: '', type: '', product_id: '', search: '', low_stock: false };
        setFilterState(defaults);
        router.get('/reports/inventory', {}, { preserveState: true, preserveScroll: true });
    };

    const dateRangeLabel = useMemo(() => {
        if (!filterState.date_from && !filterState.date_to) return 'Todo el período';
        return `${filterState.date_from || 'inicio'} → ${filterState.date_to || 'hoy'}`;
    }, [filterState.date_from, filterState.date_to]);

    return (
        <AppLayout>
            <Head title="Reporte de Inventario" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Reporte de Inventario</h1>
                        <p className="text-default-500">Movimientos y variaciones de stock</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="flat"
                            className="rounded-2xl"
                            onPress={() => router.get('/inventory', filterState)}
                        >
                            Ir a inventario
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                    <CardHeader className="flex items-center justify-between px-6 pt-6 pb-2">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-default-500" />
                            <h3 className="text-lg font-semibold">Filtros</h3>
                        </div>
                        <Button variant="light" size="sm" className="rounded-xl" onPress={handleReset}>
                            Limpiar
                        </Button>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Desde</label>
                                <input
                                    type="date"
                                    value={filterState.date_from}
                                    onChange={(e) => setFilterState((p) => ({ ...p, date_from: e.target.value }))}
                                    className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 focus:outline-none focus:border-primary/70 transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Hasta</label>
                                <input
                                    type="date"
                                    value={filterState.date_to}
                                    onChange={(e) => setFilterState((p) => ({ ...p, date_to: e.target.value }))}
                                    className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 focus:outline-none focus:border-primary/70 transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Tipo</label>
                                <select
                                    value={filterState.type}
                                    onChange={(e) => setFilterState((p) => ({ ...p, type: e.target.value }))}
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
                                    onChange={(e) => setFilterState((p) => ({ ...p, product_id: e.target.value }))}
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
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Buscar</label>
                                <input
                                    type="text"
                                    placeholder="Nombre o SKU"
                                    value={filterState.search}
                                    onChange={(e) => setFilterState((p) => ({ ...p, search: e.target.value }))}
                                    className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 placeholder:text-default-400 focus:outline-none focus:border-primary/70 transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Stock</label>
                                <label className="flex items-center gap-3 px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 cursor-pointer hover:border-primary/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={filterState.low_stock}
                                        onChange={(e) => setFilterState((p) => ({ ...p, low_stock: e.target.checked }))}
                                        className="w-4 h-4 rounded border-2 border-default-300 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    />
                                    <span className="text-sm">Solo bajo stock</span>
                                </label>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between flex-wrap gap-2">
                            <span className="text-sm text-default-500">Período: {dateRangeLabel}</span>
                            <Button color="primary" className="rounded-2xl" onPress={handleFilter}>
                                Aplicar filtros
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Resumen */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="rounded-3xl shadow-2xl dark:bg-[#18181b] border-none">
                        <CardBody className="flex flex-row items-center justify-between gap-3">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm text-default-500">Entradas</span>
                                <span className="text-2xl font-bold text-success">{summary.entries}</span>
                                <span className="text-xs text-default-500">Unidades ingresadas</span>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10">
                                <ArrowDown className="h-6 w-6 text-green-500" />
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="rounded-3xl shadow-2xl dark:bg-[#18181b] border-none">
                        <CardBody className="flex flex-row items-center justify-between gap-3">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm text-default-500">Salidas</span>
                                <span className="text-2xl font-bold text-danger">{summary.exits}</span>
                                <span className="text-xs text-default-500">Unidades retiradas</span>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                                <ArrowUp className="h-6 w-6 text-red-500" />
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="rounded-3xl shadow-2xl dark:bg-[#18181b] border-none">
                        <CardBody className="flex flex-row items-center justify-between gap-3">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm text-default-500">Ajustes</span>
                                <span className="text-2xl font-bold text-warning">{summary.adjustments}</span>
                                <span className="text-xs text-default-500">Unidades ajustadas</span>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10">
                                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="rounded-3xl shadow-2xl dark:bg-[#18181b] border-none">
                        <CardBody className="flex flex-row items-center justify-between gap-3">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm text-default-500">Movimiento neto</span>
                                <span className={`text-2xl font-bold ${netColorClass}`}>
                                    {netMovement > 0 ? `+${netMovement}` : netMovement}
                                </span>
                                <span className="text-xs text-default-500">Entradas - salidas + ajustes</span>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
                                <Lock className="h-6 w-6 text-blue-500" />
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Top por producto */}
                <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                    <CardHeader className="px-6 pt-6 pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-default-500" />
                            <h3 className="text-lg font-semibold">Variación por producto</h3>
                        </div>
                        <span className="text-sm text-default-500">Top 15 por variación neta</span>
                    </CardHeader>
                    <CardBody className="px-2 pb-6">
                        <Table removeWrapper aria-label="Variación por producto" classNames={{ th: 'bg-default-100 text-default-700 text-xs uppercase' }}>
                            <TableHeader>
                                <TableColumn>Producto</TableColumn>
                                <TableColumn>Entradas</TableColumn>
                                <TableColumn>Salidas</TableColumn>
                                <TableColumn>Ajustes</TableColumn>
                                <TableColumn>Variación neta</TableColumn>
                                <TableColumn>Stock</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="Sin datos">
                                {by_product.map((row) => {
                                    const net = row.entries - row.exits + row.adjustments;
                                    const isLow = row.product.stock <= row.product.min_stock;
                                    return (
                                        <TableRow key={row.product_id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{row.product.name}</span>
                                                    <span className="text-xs text-default-500">SKU: {row.product.sku}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-success">+{row.entries}</TableCell>
                                            <TableCell className="font-semibold text-danger">-{row.exits}</TableCell>
                                            <TableCell className="font-semibold text-warning">{row.adjustments}</TableCell>
                                            <TableCell className={net > 0 ? 'text-success font-bold' : net < 0 ? 'text-danger font-bold' : 'font-bold'}>
                                                {net > 0 ? `+${net}` : net}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={isLow ? 'text-danger font-semibold' : 'font-semibold'}>{row.product.stock}</span>
                                                    {isLow && <Chip size="sm" color="danger" variant="flat">Bajo</Chip>}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                {/* Movimientos */}
                <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                    <CardHeader className="px-6 pt-6 pb-2">
                        <h3 className="text-lg font-semibold">Movimientos</h3>
                    </CardHeader>
                    <CardBody className="px-2 pb-4">
                        <Table
                            removeWrapper
                            aria-label="Movimientos de inventario"
                            classNames={{ th: 'bg-default-100 text-default-700 text-xs uppercase', td: 'py-3' }}
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
                                            <TableCell>{new Date(movement.created_at).toLocaleString()}</TableCell>
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
                                                    <span className={isLow ? 'text-danger font-semibold' : 'font-semibold'}>{movement.new_stock}</span>
                                                    {isLow && <Chip size="sm" color="danger" variant="flat">Bajo stock</Chip>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-default-500 text-sm">{movement.reason || '—'}</span>
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
                                        router.get('/reports/inventory', { ...filterState, page }, { preserveState: true, preserveScroll: true })
                                    }
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
}
