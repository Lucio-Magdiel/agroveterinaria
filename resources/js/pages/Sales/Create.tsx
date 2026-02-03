import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Divider,
    Chip,
    Autocomplete,
    AutocompleteItem,
} from '@heroui/react';
import {
    Plus,
    Trash2,
    ShoppingCart,
    Search,
    User,
    CreditCard,
    CheckCircle,
    AlertTriangle,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    sku: string;
    sale_price: number;
    stock: number;
    unit: string;
    category: {
        name: string;
    };
}

interface CartItem {
    product_id: number;
    name: string;
    quantity: number;
    unit_price: number;
    stock: number;
    unit: string;
}

interface Props {
    products: Product[];
}

export default function SalesCreate({ products }: Props) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        payment_method: 'efectivo',
        payment_reference: '',
        notes: '',
        items: [] as Array<{
            product_id: number;
            quantity: number;
            unit_price: number;
        }>,
    });

    const addToCart = (productId: string) => {
        const product = products.find((p) => p.id.toString() === productId);
        if (!product) return;

        setSearchQuery('');
        setShowDropdown(false);

        const existingItem = cart.find(
            (item) => item.product_id === product.id
        );

        const increment = product.unit === 'kg' || product.unit === 'litro' ? 0.5 : 1;

        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                alert('No hay suficiente stock');
                return;
            }
            setCart(
                cart.map((item) =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + increment }
                        : item
                )
            );
        } else {
            if (product.stock <= 0) {
                alert('Producto sin stock');
                return;
            }
            setCart([
                ...cart,
                {
                    product_id: product.id,
                    name: product.name,
                    quantity: increment,
                    unit_price: product.sale_price,
                    stock: product.stock,
                    unit: product.unit,
                },
            ]);
        }
        setSelectedProduct('');
    };

    const updateQuantity = (productId: number, quantity: number) => {
        const item = cart.find((i) => i.product_id === productId);
        if (!item) return;

        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (quantity > item.stock) {
            alert('No hay suficiente stock');
            return;
        }

        setCart(
            cart.map((item) =>
                item.product_id === productId ? { ...item, quantity } : item
            )
        );
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter((item) => item.product_id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce(
            (sum, item) => sum + item.quantity * item.unit_price,
            0
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            setNotification({ type: 'error', message: 'Debe agregar al menos un producto.' });
            return;
        }

        const items = cart.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
        }));

        let wasSuccess = false;
        let hadError = false;

        router.post('/sales', {
            ...data,
            items,
        } as any, {
            preserveScroll: true,
            onStart: () => {
                setNotification(null);
            },
            onSuccess: () => {
                setCart([]);
                setSelectedProduct('');
                setNotification({ type: 'success', message: 'Venta registrada exitosamente.' });
                wasSuccess = true;
            },
            onError: (errs) => {
                const firstError = Object.values(errs)[0] as string | undefined;
                setNotification({ type: 'error', message: firstError || 'No se pudo procesar la venta.' });
                hadError = true;
            },
            onFinish: () => {
                if (!wasSuccess && !hadError) {
                    setNotification({ type: 'error', message: 'No se pudo procesar la venta. Revisa conexión o intenta de nuevo.' });
                }
            },
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Nueva Venta - POS" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Punto de Venta</h1>
                        <p className="text-default-500">
                            Registra una nueva venta
                        </p>
                    </div>
                </div>

                {notification && (
                    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow ${notification.type === 'success' ? 'bg-success-50 border-success-200 text-success-700' : 'bg-danger-50 border-danger-200 text-danger-700'}`}>
                        {notification.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 mt-0.5" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 mt-0.5" />
                        )}
                        <div className="flex-1 text-sm font-medium">{notification.message}</div>
                        <button
                            type="button"
                            onClick={() => setNotification(null)}
                            className="text-inherit hover:opacity-70"
                            aria-label="Cerrar alerta"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Selección de Productos */}
                        <div className="lg:col-span-2">
                            <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                                <CardHeader className="pb-4 px-6 pt-6">
                                    <h3 className="text-lg font-semibold">
                                        Productos
                                    </h3>
                                </CardHeader>
                                <CardBody>
                                    <div className="mb-4 flex flex-col gap-2 relative">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-200">Buscar producto</label>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-default-400 pointer-events-none z-10" />
                                            <input
                                                type="text"
                                                placeholder="Busca por nombre o SKU"
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setShowDropdown(true);
                                                }}
                                                onFocus={() => setShowDropdown(true)}
                                                className="w-full pl-10 pr-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 placeholder:text-default-400 focus:outline-none focus:border-primary/70 transition-colors"
                                            />
                                        </div>
                                        {showDropdown && searchQuery && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#18181b] border-2 border-default-300/40 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50">
                                                {products
                                                    .filter((product) =>
                                                        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
                                                    )
                                                    .slice(0, 10)
                                                    .map((product) => (
                                                        <button
                                                            key={product.id}
                                                            type="button"
                                                            onClick={() => addToCart(product.id.toString())}
                                                            className="w-full px-4 py-3 hover:bg-default-100 dark:hover:bg-default-50/10 text-left border-b border-default-200 dark:border-default-100 last:border-0 transition-colors"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="font-semibold text-default-700 dark:text-default-200">
                                                                        {product.name}
                                                                    </p>
                                                                    <p className="text-xs text-default-500">
                                                                        SKU: {product.sku} | Stock: {product.stock}
                                                                    </p>
                                                                </div>
                                                                <p className="font-semibold text-primary">
                                                                    {formatCurrency(product.sale_price)}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                {products.filter((product) =>
                                                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
                                                ).length === 0 && (
                                                    <div className="px-4 py-3 text-center text-default-500">
                                                        No se encontraron productos
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {cart.length > 0 ? (
                                        <Table 
                                            aria-label="Carrito de compras"
                                            classNames={{
                                                wrapper: "rounded-2xl shadow-none",
                                                th: "bg-default-100 text-default-700 font-bold",
                                                td: "py-4"
                                            }}
                                        >
                                            <TableHeader>
                                                <TableColumn>PRODUCTO</TableColumn>
                                                <TableColumn>P. UNIT</TableColumn>
                                                <TableColumn>CANT</TableColumn>
                                                <TableColumn>SUBTOTAL</TableColumn>
                                                <TableColumn>ACCIÓN</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {cart.map((item) => (
                                                    <TableRow
                                                        key={item.product_id}
                                                    >
                                                        <TableCell>
                                                            {item.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatCurrency(
                                                                item.unit_price
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    type="number"
                                                                    min="0.01"
                                                                    step={item.unit === 'kg' || item.unit === 'litro' ? '0.5' : '1'}
                                                                    max={item.stock}
                                                                    value={item.quantity.toString()}
                                                                    onChange={(e) =>
                                                                        updateQuantity(
                                                                            item.product_id,
                                                                            parseFloat(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        )
                                                                    }
                                                                    className="w-24"
                                                                    size="sm"
                                                                />
                                                                <span className="text-xs text-default-500 whitespace-nowrap">
                                                                    {item.unit}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-semibold">
                                                            {formatCurrency(
                                                                item.quantity *
                                                                    item.unit_price
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                color="danger"
                                                                variant="flat"
                                                                onPress={() =>
                                                                    removeFromCart(
                                                                        item.product_id
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="py-12 text-center text-default-400">
                                            <ShoppingCart className="mx-auto mb-2 h-12 w-12" />
                                            <p>
                                                No hay productos en el carrito
                                            </p>
                                            <p className="text-sm">
                                                Busca y agrega productos para
                                                comenzar
                                            </p>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>

                        {/* Resumen y Pago */}
                        <div className="space-y-4">
                            {/* Método de Pago */}
                            <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none">
                                <CardHeader className="pb-4 px-6 pt-6">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <CreditCard className="h-5 w-5" />
                                        Pago
                                    </h3>
                                </CardHeader>
                                <CardBody>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-sm font-semibold text-default-700 dark:text-default-200">Método de Pago</span>
                                            <Select
                                                aria-label="Método de Pago"
                                                selectedKeys={[data.payment_method]}
                                                onChange={(e) =>
                                                    setData(
                                                        'payment_method',
                                                        e.target.value
                                                    )
                                                }
                                                isRequired
                                                size="lg"
                                                classNames={{
                                                    trigger: 'min-h-[52px] px-4 bg-white dark:bg-[#18181b] border border-default-200 dark:border-default-100 rounded-2xl',
                                                    listbox: 'bg-white dark:bg-[#09090b]',
                                                }}
                                            >
                                                <SelectItem
                                                    key="efectivo"
                                            >
                                                    💵 Efectivo
                                                </SelectItem>
                                                <SelectItem key="yape">
                                                    📱 Yape
                                                </SelectItem>
                                            </Select>
                                        </div>

                                        {data.payment_method === 'yape' && (
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-default-700 dark:text-default-200">Número de Operación</label>
                                                <input
                                                    type="text"
                                                    placeholder="123456789"
                                                    value={data.payment_reference}
                                                    onChange={(e) => setData('payment_reference', e.target.value)}
                                                    className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 placeholder:text-default-400 focus:outline-none focus:border-primary/70 transition-colors"
                                                />
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-default-700 dark:text-default-200">Notas (Opcional)</label>
                                            <input
                                                type="text"
                                                placeholder="Observaciones"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                className="px-3 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 placeholder:text-default-400 focus:outline-none focus:border-primary/70 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Resumen Total */}
                            <Card className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-2 border-primary">
                                <CardBody>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-default-500">
                                                Items
                                            </span>
                                            <span className="font-semibold">
                                                {cart.reduce(
                                                    (sum, item) =>
                                                        sum + item.quantity,
                                                    0
                                                )}
                                            </span>
                                        </div>
                                        <Divider />
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold">
                                                Total
                                            </span>
                                            <span className="text-2xl font-bold text-primary">
                                                {formatCurrency(calculateTotal())}
                                            </span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Botones de Acción */}
                            <div className="space-y-2">
                                <Button
                                    color="success"
                                    size="lg"
                                    className="w-full rounded-2xl font-semibold shadow-lg bg-green-600 hover:bg-green-700 text-white"
                                    type="submit"
                                    isLoading={processing}
                                    isDisabled={cart.length === 0}
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    Procesar Venta
                                </Button>
                                <Button
                                    variant="flat"
                                    size="lg"
                                    className="w-full rounded-2xl font-medium"
                                    onPress={() => router.get('/sales')}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
