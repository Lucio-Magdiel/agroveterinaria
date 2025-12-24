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
        return method === 'efectivo' ? '💵 Efectivo' : '📱 Yape';
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
                        color="primary"
                        size="lg"
                        startContent={<Plus className="h-5 w-5" />}
                        onPress={() => router.get('/sales/create')}
                    >
                        Nueva Venta
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="grid w-full gap-2 md:grid-cols-4">
                            <Input
                                placeholder="Buscar por número..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && handleSearch()
                                }
                                startContent={<Search className="h-4 w-4" />}
                            />

                            <Select
                                placeholder="Estado"
                                selectedKeys={status ? [status] : []}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <SelectItem key="completed" value="completed">
                                    Completada
                                </SelectItem>
                                <SelectItem key="cancelled" value="cancelled">
                                    Cancelada
                                </SelectItem>
                            </Select>

                            <Select
                                placeholder="Método de Pago"
                                selectedKeys={
                                    paymentMethod ? [paymentMethod] : []
                                }
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                            >
                                <SelectItem key="efectivo" value="efectivo">
                                    Efectivo
                                </SelectItem>
                                <SelectItem key="yape" value="yape">
                                    Yape
                                </SelectItem>
                            </Select>

                            <Button color="primary" onPress={handleSearch}>
                                Buscar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Tabla de ventas">
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
