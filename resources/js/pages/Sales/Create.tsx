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
}

interface Props {
    products: Product[];
}

export default function SalesCreate({ products }: Props) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');

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

        const existingItem = cart.find(
            (item) => item.product_id === product.id
        );

        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                alert('No hay suficiente stock');
                return;
            }
            setCart(
                cart.map((item) =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
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
                    quantity: 1,
                    unit_price: product.sale_price,
                    stock: product.stock,
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
            alert('Debe agregar al menos un producto');
            return;
        }

        const items = cart.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
        }));

        post('/sales', {
            ...data,
            items,
        } as any);
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

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Selección de Productos */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">
                                        Productos
                                    </h3>
                                </CardHeader>
                                <CardBody>
                                    <div className="mb-4">
                                        <Autocomplete
                                            label="Buscar producto"
                                            placeholder="Busca por nombre o SKU"
                                            selectedKey={selectedProduct}
                                            onSelectionChange={(key) => {
                                                if (key) {
                                                    addToCart(key.toString());
                                                }
                                            }}
                                            startContent={
                                                <Search className="h-4 w-4" />
                                            }
                                        >
                                            {products.map((product) => (
                                                <AutocompleteItem
                                                    key={product.id}
                                                    textValue={product.name}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-xs text-default-500">
                                                                SKU: {product.sku}{' '}
                                                                | Stock:{' '}
                                                                {product.stock}
                                                            </p>
                                                        </div>
                                                        <p className="font-semibold text-primary">
                                                            {formatCurrency(
                                                                product.sale_price
                                                            )}
                                                        </p>
                                                    </div>
                                                </AutocompleteItem>
                                            ))}
                                        </Autocomplete>
                                    </div>

                                    {cart.length > 0 ? (
                                        <Table aria-label="Carrito de compras">
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
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                max={item.stock}
                                                                value={item.quantity.toString()}
                                                                onChange={(e) =>
                                                                    updateQuantity(
                                                                        item.product_id,
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    )
                                                                }
                                                                className="w-20"
                                                                size="sm"
                                                            />
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
                                                                <Trash2 className="h-4 w-4" />
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
                            <Card>
                                <CardHeader>
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <CreditCard className="h-5 w-5" />
                                        Pago
                                    </h3>
                                </CardHeader>
                                <CardBody>
                                    <div className="space-y-4">
                                        <Select
                                            label="Método de Pago"
                                            selectedKeys={[data.payment_method]}
                                            onChange={(e) =>
                                                setData(
                                                    'payment_method',
                                                    e.target.value
                                                )
                                            }
                                            isRequired
                                        >
                                            <SelectItem
                                                key="efectivo"
                                                value="efectivo"
                                            >
                                                💵 Efectivo
                                            </SelectItem>
                                            <SelectItem key="yape" value="yape">
                                                📱 Yape
                                            </SelectItem>
                                        </Select>

                                        {data.payment_method === 'yape' && (
                                            <Input
                                                label="Número de Operación"
                                                placeholder="123456789"
                                                value={data.payment_reference}
                                                onChange={(e) =>
                                                    setData(
                                                        'payment_reference',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        )}

                                        <Input
                                            label="Notas (Opcional)"
                                            placeholder="Observaciones"
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData('notes', e.target.value)
                                            }
                                        />
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Resumen Total */}
                            <Card className="border-2 border-primary">
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
                                    color="primary"
                                    size="lg"
                                    className="w-full"
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
                                    className="w-full"
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
