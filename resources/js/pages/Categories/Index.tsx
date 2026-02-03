import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
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
import { Plus, Search, Edit2, Trash2, Tag, X, Eye, Check, XCircle, CheckCircle } from 'lucide-react';
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
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        is_active: true,
    });

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setData({
                name: category.name,
                description: category.description || '',
                is_active: category.is_active,
            });
        } else {
            setEditingCategory(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(`/categories/${editingCategory.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/categories', {
                onSuccess: () => closeModal(),
            });
        }
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

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Categorías
                        </h1>
                        <p className="text-default-500">
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

                <div className="flex w-full items-center gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-default-400" />
                        <input
                            type="text"
                            placeholder="Buscar categorías..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full px-12 py-3 border-2 border-default-300/40 rounded-xl bg-white dark:bg-[#18181b] text-default-700 dark:text-default-200 placeholder:text-default-400 focus:outline-none focus:border-primary/70 transition-colors"
                        />
                    </div>
                    <Button 
                        color="primary" 
                        onPress={handleSearch}
                        size="lg"
                        className="rounded-2xl font-semibold px-8"
                    >
                        Buscar
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categories.data.map((category) => (
                        <Link
                            key={category.id}
                            href={`/categories/${category.id}`}
                            as="div"
                            className="block"
                        >
                        <Card 
                            className="shadow-2xl rounded-3xl dark:bg-[#18181b] border-none hover:scale-[1.02] transition-transform cursor-pointer"
                        >
                            <CardHeader className="flex justify-between items-start px-6 pt-6 pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 rounded-xl">
                                        <Tag className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold line-clamp-1">{category.name}</h3>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color={category.is_active ? 'success' : 'danger'}
                                            startContent={category.is_active ? (
                                                <CheckCircle className="h-3.5 w-3.5" />
                                            ) : (
                                                <XCircle className="h-3.5 w-3.5" />
                                            )}
                                            className={`mt-1 rounded-lg w-fit ${category.is_active ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {category.is_active ? 'Activo' : 'Inactivo'}
                                        </Chip>
                                    </div>
                                </div>
                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        onPress={() => openModal(category)}
                                        className="rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        onPress={() => handleDelete(category.id)}
                                        className="rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardBody className="px-6 py-4">
                                <p className="text-sm text-default-500 line-clamp-2 min-h-[2.5rem]">
                                    {category.description || 'Sin descripción disponible.'}
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                    <Chip size="sm" variant="flat" color="primary" className="rounded-lg">
                                        {category.products_count} Productos
                                    </Chip>
                                    <span className="text-xs text-default-400">
                                        {new Date(category.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardBody>
                        </Card>
                        </Link>
                    ))}
                </div>

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
            </div>
            </AppLayout>

            {/* Modal para crear/editar categorías */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop con animación */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={closeModal}
                    />
                    
                    {/* Modal Content con animación */}
                    <div className="relative z-10 w-full max-w-3xl bg-white dark:bg-[#09090b] rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-divider">
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            {/* Header Mejorado */}
                            <div className="flex items-start justify-between p-6 sm:p-8 border-b border-divider/50 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent shrink-0">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2.5 bg-primary/10 rounded-xl">
                                            <Tag className="h-6 w-6 text-primary" />
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                                        </h2>
                                    </div>
                                    <p className="text-sm sm:text-base text-default-600 ml-[52px]">
                                        {editingCategory ? 'Modifica la información de la categoría' : 'Completa la información para crear una nueva categoría'}
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
                                <div className="p-8 space-y-6">
                                    {/* Campo Nombre */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Nombre de la Categoría <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Alimentos para Animales, Medicamentos, Accesorios..."
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            autoFocus
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                        />
                                        {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
                                        <p className="text-xs text-default-500">Nombre descriptivo que identifique claramente el tipo de productos</p>
                                    </div>

                                    {/* Separador visual */}
                                    <div className="border-t border-divider/30" />

                                    {/* Campo Descripción */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Descripción <span className="text-sm font-normal text-default-500">(Opcional)</span>
                                        </label>
                                        <textarea
                                            placeholder="Describe el tipo de productos que incluye esta categoría, sus características principales o cualquier información relevante..."
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400 resize-none"
                                        />
                                        {errors.description && <p className="text-xs text-danger">{errors.description}</p>}
                                        <p className="text-xs text-default-500">Ayuda a identificar el tipo de productos que incluye esta categoría</p>
                                    </div>

                                    {/* Estado (Solo en edición) */}
                                    {editingCategory && (
                                        <>
                                            <div className="border-t border-divider/30" />
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                                    Estado
                                                </label>
                                                <div className="flex items-center gap-3 p-4 rounded-xl bg-default-100 dark:bg-default-50/10">
                                                    <HeadlessSwitch
                                                        checked={data.is_active}
                                                        onChange={(value) => setData('is_active', value)}
                                                        className={`${
                                                            data.is_active ? 'bg-green-500' : 'bg-default-200'
                                                        } relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                                                    >
                                                        <span
                                                            className={`${
                                                                data.is_active ? 'translate-x-6' : 'translate-x-1'
                                                            } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                                                        />
                                                    </HeadlessSwitch>
                                                    <div>
                                                        <p className={`text-sm font-medium ${data.is_active ? 'text-green-600' : 'text-default-500'}`}>
                                                            Categoría {data.is_active ? 'Activa' : 'Inactiva'}
                                                        </p>
                                                        <p className="text-xs text-default-500">
                                                            {data.is_active 
                                                                ? 'Visible en el sistema' 
                                                                : 'Oculta en el sistema'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Footer Mejorado */}
                            <div className="flex items-center justify-end gap-3 p-6 sm:p-8 border-t border-divider/50 bg-default-50/50 dark:bg-[#18181b] shrink-0">
                                <Button
                                    variant="flat"
                                    onPress={closeModal}
                                    isDisabled={processing}
                                    size="lg"
                                    type="button"
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
                                    {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
