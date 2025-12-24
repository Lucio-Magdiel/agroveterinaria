import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Textarea,
    Switch,
    Chip,
    Pagination,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
} from '@heroui/react';
import { Plus, Search, Edit2, Trash2, Tag, X, Eye, Check, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    products_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    categories: {
        data: Category[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function CategoriesIndex({ categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        is_active: true,
    });

    const openModal = () => {
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/categories', {
            onSuccess: () => {
                closeModal();
            },
        });
    };

    const startEdit = (category: Category) => {
        setEditingId(category.id);
        setData({
            name: category.name,
            description: category.description || '',
            is_active: category.is_active,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const saveEdit = (id: number) => {
        put(`/categories/${id}`, {
            onSuccess: () => {
                setEditingId(null);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta categoría?')) {
            router.delete(`/categories/${id}`);
        }
    };

    const handleSearch = () => {
        router.get('/categories', { search }, { preserveState: true });
    };

    return (
        <>
            <AppLayout>
                <Head title="Categorías" />

            <div className="flex h-full flex-1 flex-col gap-6 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Categorías
                        </h1>
                        <p className="text-default-500 mt-1">
                            Gestiona las categorías de productos
                        </p>
                    </div>
                    <Button
                        color="primary"
                        startContent={<Plus className="h-5 w-5" />}
                        onPress={() => openModal()}
                        size="lg"
                        className="shadow-lg rounded-2xl font-semibold"
                    >
                        Nueva Categoría
                    </Button>
                </div>

                <Card className="shadow-2xl rounded-3xl">
                    <CardHeader className="pb-4">
                        <div className="flex w-full items-center gap-3">
                            <Input
                                placeholder="Buscar categorías..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && handleSearch()
                                }
                                startContent={<Search className="h-5 w-5" />}
                                className="flex-1"
                                classNames={{
                                    inputWrapper: "rounded-2xl"
                                }}
                                size="lg"
                            />
                            <Button 
                                color="primary" 
                                onPress={handleSearch}
                                size="lg"
                                className="rounded-2xl font-semibold px-8"
                            >
                                Buscar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-2">
                        <Table 
                            aria-label="Tabla de categorías"
                            className="min-w-full"
                            classNames={{
                                wrapper: "rounded-2xl shadow-none",
                                th: "bg-default-100 text-default-700 font-bold",
                                td: "py-4"
                            }}
                        >
                            <TableHeader>
                                <TableColumn>NOMBRE</TableColumn>
                                <TableColumn>DESCRIPCIÓN</TableColumn>
                                <TableColumn>PRODUCTOS</TableColumn>
                                <TableColumn>ESTADO</TableColumn>
                                <TableColumn>ACCIONES</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {categories.data.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            {editingId === category.id ? (
                                                <Input
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    isInvalid={!!errors.name}
                                                    errorMessage={errors.name}
                                                    size="sm"
                                                    classNames={{
                                                        inputWrapper: "rounded-lg"
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-primary/10 rounded-lg">
                                                        <Tag className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="font-semibold">{category.name}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === category.id ? (
                                                <Textarea
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    minRows={1}
                                                    size="sm"
                                                    classNames={{
                                                        inputWrapper: "rounded-lg"
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-sm text-default-600">
                                                    {category.description || '-'}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="flat" color="primary">
                                                {category.products_count}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            {editingId === category.id ? (
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        isSelected={data.is_active}
                                                        onValueChange={(value) => setData('is_active', value)}
                                                        size="sm"
                                                        color="success"
                                                    />
                                                    <span className="text-xs">
                                                        {data.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <Chip
                                                    size="sm"
                                                    color={category.is_active ? 'success' : 'default'}
                                                    variant="flat"
                                                >
                                                    {category.is_active ? 'Activo' : 'Inactivo'}
                                                </Chip>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === category.id ? (
                                                <div className="flex gap-2">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        color="success"
                                                        variant="flat"
                                                        onPress={() => saveEdit(category.id)}
                                                        isLoading={processing}
                                                        className="rounded-lg"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        color="danger"
                                                        variant="flat"
                                                        onPress={cancelEdit}
                                                        isDisabled={processing}
                                                        className="rounded-lg"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        onPress={() => startEdit(category)}
                                                        className="rounded-lg"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        color="danger"
                                                        variant="flat"
                                                        onPress={() => handleDelete(category.id)}
                                                        className="rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {categories.last_page > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    total={categories.last_page}
                                    page={categories.current_page}
                                    onChange={(page) =>
                                        router.get('/categories', { page })
                                    }
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
            </AppLayout>

            {/* Modal solo para crear nuevas categorías */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop con animación */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={closeModal}
                    />
                    
                    {/* Modal Content con animación */}
                    <div className="relative z-10 w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-divider">
                        <form onSubmit={handleCreate} className="flex flex-col">
                            {/* Header Mejorado */}
                            <div className="flex items-start justify-between p-6 sm:p-8 border-b border-divider/50 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent shrink-0">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2.5 bg-primary/10 rounded-xl">
                                            <Tag className="h-6 w-6 text-primary" />
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                            Nueva Categoría
                                        </h2>
                                    </div>
                                    <p className="text-sm sm:text-base text-default-600 ml-[52px]">
                                        Completa la información para crear una nueva categoría
                                    </p>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    onPress={closeModal}
                                    className="rounded-full hover:bg-default-200 transition-colors shrink-0"
                                    size="lg"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Body con scroll */}
                            <div className="overflow-y-auto flex-1">
                                <div className="p-6 sm:p-8 space-y-8">
                                    {/* Campo Nombre */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <label className="text-base font-semibold text-foreground">
                                                Nombre de la Categoría
                                            </label>
                                            <span className="text-danger text-lg">*</span>
                                        </div>
                                        <Input
                                            placeholder="Ej: Alimentos para Animales, Medicamentos, Accesorios..."
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            isInvalid={!!errors.name}
                                            errorMessage={errors.name}
                                            isRequired
                                            autoFocus
                                            size="lg"
                                            variant="bordered"
                                            classNames={{
                                                inputWrapper: "rounded-xl border-2 hover:border-primary/50 focus-within:border-primary group-data-[invalid=true]:border-danger",
                                                input: "text-base"
                                            }}
                                            description="Nombre descriptivo que identifique claramente el tipo de productos"
                                        />
                                    </div>

                                    {/* Separador visual */}
                                    <div className="border-t border-divider/30" />

                                    {/* Campo Descripción */}
                                    <div className="space-y-3">
                                        <label className="text-base font-semibold text-foreground block">
                                            Descripción
                                            <span className="text-sm font-normal text-default-500 ml-2">(Opcional)</span>
                                        </label>
                                        <Textarea
                                            placeholder="Describe el tipo de productos que incluye esta categoría, sus características principales o cualquier información relevante..."
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            isInvalid={!!errors.description}
                                            errorMessage={errors.description}
                                            minRows={4}
                                            maxRows={6}
                                            size="lg"
                                            variant="bordered"
                                            classNames={{
                                                inputWrapper: "rounded-xl border-2 hover:border-primary/50 focus-within:border-primary data-[hover=true]:border-primary/50 shadow-none bg-transparent",
                                                input: "text-base resize-none bg-transparent",
                                                innerWrapper: "bg-transparent"
                                            }}
                                            disableAnimation
                                            description="Ayuda a identificar el tipo de productos que incluye esta categoría"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Mejorado */}
                            <div className="flex items-center justify-end gap-3 p-6 sm:p-8 border-t border-divider/50 bg-default-50/50 shrink-0">
                                <Button
                                    variant="flat"
                                    onPress={closeModal}
                                    isDisabled={processing}
                                    size="lg"
                                    className="rounded-xl font-medium px-6 hover:bg-default-200"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    color="primary"
                                    type="submit"
                                    isLoading={processing}
                                    size="lg"
                                    className="rounded-xl font-semibold px-8 shadow-lg shadow-primary/20"
                                >
                                    Crear Categoría
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
