import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardBody, CardHeader, Button } from '@heroui/react';
import {
    TrendingUp,
    Package,
    FileText,
    BarChart3,
    Calendar,
} from 'lucide-react';

export default function ReportsIndex() {
    return (
        <AppLayout>
            <Head title="Reportes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Reportes</h1>
                    <p className="text-default-500">
                        Consulta reportes y estadísticas del negocio
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Reporte de Ventas */}
                    <Card
                        isPressable
                        onPress={() => router.get('/reports/sales')}
                        className="border-2 hover:border-primary"
                    >
                        <CardHeader>
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                                        <TrendingUp className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Ventas
                                        </h3>
                                        <p className="text-sm text-default-500">
                                            Análisis de ventas
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <p className="text-sm text-default-600">
                                Ver ventas por período, métodos de pago,
                                tendencias y comparativas.
                            </p>
                            <div className="mt-4 flex gap-2">
                                <Button size="sm" color="primary">
                                    Ver Reporte
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Reporte de Productos */}
                    <Card
                        isPressable
                        onPress={() => router.get('/reports/products')}
                        className="border-2 hover:border-primary"
                    >
                        <CardHeader>
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                                        <Package className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Productos
                                        </h3>
                                        <p className="text-sm text-default-500">
                                            Análisis de inventario
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <p className="text-sm text-default-600">
                                Productos más vendidos, stock bajo, productos
                                próximos a vencer.
                            </p>
                            <div className="mt-4 flex gap-2">
                                <Button size="sm" color="primary">
                                    Ver Reporte
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Reporte de Inventario */}
                    <Card className="border-2 opacity-60">
                        <CardHeader>
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                                        <BarChart3 className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Inventario
                                        </h3>
                                        <p className="text-sm text-default-500">
                                            Movimientos de stock
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <p className="text-sm text-default-600">
                                Historial de entradas, salidas y ajustes de
                                inventario.
                            </p>
                            <div className="mt-4">
                                <p className="text-xs text-warning">
                                    Próximamente
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Accesos Rápidos */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">
                            Accesos Rápidos
                        </h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <Button
                                variant="flat"
                                className="justify-start"
                                startContent={<Calendar className="h-4 w-4" />}
                                onPress={() =>
                                    router.get('/reports/sales', {
                                        date_from: new Date().toISOString().split('T')[0],
                                        date_to: new Date().toISOString().split('T')[0],
                                    })
                                }
                            >
                                Ventas de Hoy
                            </Button>
                            <Button
                                variant="flat"
                                className="justify-start"
                                startContent={<Package className="h-4 w-4" />}
                                onPress={() =>
                                    router.get('/reports/products')
                                }
                            >
                                Stock Bajo
                            </Button>
                            <Button
                                variant="flat"
                                className="justify-start"
                                startContent={<TrendingUp className="h-4 w-4" />}
                                onPress={() =>
                                    router.get('/reports/sales', {
                                        date_from: new Date(
                                            new Date().getFullYear(),
                                            new Date().getMonth(),
                                            1
                                        )
                                            .toISOString()
                                            .split('T')[0],
                                        date_to: new Date().toISOString().split('T')[0],
                                    })
                                }
                            >
                                Ventas del Mes
                            </Button>
                            <Button
                                variant="flat"
                                className="justify-start"
                                startContent={<FileText className="h-4 w-4" />}
                                onPress={() =>
                                    router.get('/reports/products')
                                }
                            >
                                Más Vendidos
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
}
