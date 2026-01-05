import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Chip,
    Pagination,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Select,
    SelectItem,
} from '@heroui/react';
import { Plus, Search, Eye, Ban } from 'lucide-react';
import { useState } from 'react';

interface Sale {
    id: number;
    sale_number: string;
    user: { name: string };
    total: number;
    payment_method: string;
    status: string;
    created_at: string;
}

interface Props {
    sales: {
        data: Sale[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        payment_method?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function SalesIndex({ sales, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [paymentMethod, setPaymentMethod] = useState(
        filters.payment_method || ''
    );

    const handleSearch = () => {
        router.get(
            '/sales',
            { search, status, payment_method: paymentMethod },
            { preserveState: true }
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        return status === 'completed' ? 'success' : 'danger';
    };

    const getPaymentMethodLabel = (method: string) => {
        return method === 'efectivo' ? 'Efectivo' : 'Yape';
    };

    return (
        <AppLayout>
            <Head title="Ventas" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Ventas</h1>
                        <p className="text-default-500">
                            Historial de ventas realizadas
                        </p>
                    </div>
                    <Button
                        color="success"
                        size="lg"
                        startContent={<Plus className="h-5 w-5" />}
                        onPress={() => router.get('/sales/create')}
                        className="shadow-lg rounded-2xl font-semibold bg-green-600 hover:bg-green-700 text-white"
                    >
                        Nueva Venta
                    </Button>
                </div>

                <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                    <CardHeader className="pb-4 px-6 pt-6">
                        <div className="grid w-full gap-4 md:grid-cols-4">
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Buscar por número</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-default-400" />
                                    <input
                                        type="text"
                                        placeholder="Ej: VTA-0001"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full px-10 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 placeholder:text-default-400 focus:outline-none focus:border-primary/70 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Estado</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 focus:outline-none focus:border-primary/70 transition-colors [&>option]:dark:bg-[#18181b] [&>option]:dark:text-default-200"
                                >
                                    <option value="">Todos</option>
                                    <option value="completed">Completada</option>
                                    <option value="cancelled">Cancelada</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Método de Pago</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 focus:outline-none focus:border-primary/70 transition-colors [&>option]:dark:bg-[#18181b] [&>option]:dark:text-default-200"
                                >
                                    <option value="">Todos</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="yape">Yape</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <Button 
                                    color="primary" 
                                    onPress={handleSearch}
                                    size="lg"
                                    className="w-full rounded-2xl font-semibold"
                                >
                                    Buscar
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-2">
                        <Table 
                            aria-label="Tabla de ventas"
                            classNames={{
                                wrapper: "rounded-2xl shadow-none",
                                th: "bg-default-100 text-default-700 font-bold",
                                td: "py-4"
                            }}
                        >
                            <TableHeader>
                                <TableColumn>N° VENTA</TableColumn>
                                <TableColumn>VENDEDOR</TableColumn>
                                <TableColumn>TOTAL</TableColumn>
                                <TableColumn>PAGO</TableColumn>
                                <TableColumn>FECHA</TableColumn>
                                <TableColumn>ESTADO</TableColumn>
                                <TableColumn>ACCIONES</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {sales.data.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>
                                            <span className="font-mono text-sm font-semibold">
                                                {sale.sale_number}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {sale.user.name}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-primary">
                                                {formatCurrency(sale.total)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {getPaymentMethodLabel(
                                                    sale.payment_method
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p>
                                                    {new Date(
                                                        sale.created_at
                                                    ).toLocaleDateString(
                                                        'es-PE'
                                                    )}
                                                </p>
                                                <p className="text-xs text-default-500">
                                                    {new Date(
                                                        sale.created_at
                                                    ).toLocaleTimeString(
                                                        'es-PE',
                                                        {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                color={getStatusColor(
                                                    sale.status
                                                )}
                                            >
                                                {sale.status === 'completed'
                                                    ? 'Completada'
                                                    : 'Cancelada'}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="flat"
                                                    onPress={() =>
                                                        router.get(
                                                            `/sales/${sale.id}`
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {sale.status === 'completed' && (
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        color="danger"
                                                        variant="flat"
                                                        onPress={() => {
                                                            if (
                                                                confirm(
                                                                    '¿Cancelar esta venta? Se restaurará el stock.'
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    `/sales/${sale.id}`
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {sales.last_page > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    total={sales.last_page}
                                    page={sales.current_page}
                                    onChange={(page) =>
                                        router.get('/sales', { page })
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
