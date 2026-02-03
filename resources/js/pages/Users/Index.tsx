import { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Button,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Chip,
    Select,
    SelectItem,
    Card,
    CardHeader,
    CardBody,
} from '@heroui/react';
import { UserPlus, Pencil, Trash2, Shield, Mail, Calendar, User as UserIcon, X } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
    created_at: string;
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
    };
    roles: Role[];
}

export default function UsersIndex({ users, roles }: Props) {
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Enviando datos:', createForm.data);
        createForm.post('/users', {
            onSuccess: () => {
                console.log('Usuario creado exitosamente');
                onCreateClose();
                createForm.reset();
            },
            onError: (errors) => {
                console.log('Errores de validación:', errors);
            },
        });
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.roles[0]?.name || '',
        });
        onEditOpen();
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUser) {
            editForm.put(`/users/${selectedUser.id}`, {
                onSuccess: () => {
                    onEditClose();
                    editForm.reset();
                    setSelectedUser(null);
                },
            });
        }
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        onDeleteOpen();
    };

    const confirmDelete = () => {
        if (selectedUser) {
            router.delete(`/users/${selectedUser.id}`, {
                onSuccess: () => {
                    onDeleteClose();
                    setSelectedUser(null);
                },
            });
        }
    };

    const getRoleBadgeColor = (roleName: string): "danger" | "primary" | "success" | "default" => {
        switch (roleName) {
            case 'admin':
                return 'danger';
            case 'vendedor':
                return 'primary';
            case 'almacenero':
                return 'success';
            default:
                return 'default';
        }
    };

    // Agrupar usuarios por rol
    const usersByRole = users.data.reduce((acc, user) => {
        const roleName = user.roles[0]?.name || 'sin-rol';
        if (!acc[roleName]) {
            acc[roleName] = [];
        }
        acc[roleName].push(user);
        return acc;
    }, {} as Record<string, User[]>);

    // Función para obtener el nombre en español del rol
    const getRoleDisplayName = (roleName: string) => {
        switch (roleName) {
            case 'admin':
                return 'Administrador';
            case 'vendedor':
                return 'Vendedor';
            case 'almacenero':
                return 'Almacenero';
            default:
                return roleName;
        }
    };

    // Orden de roles para mostrar
    const roleOrder = ['admin', 'vendedor', 'almacenero', 'sin-rol'];
    const sortedRoles = Object.keys(usersByRole).sort((a, b) => {
        return roleOrder.indexOf(a) - roleOrder.indexOf(b);
    });

    // Función para obtener el título y color de la sección
    const getRoleSection = (roleName: string) => {
        switch (roleName) {
            case 'admin':
                return { 
                    title: 'Administradores', 
                    icon: Shield, 
                    color: 'text-red-600', 
                    bg: 'bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950/30 dark:to-red-900/20',
                    borderColor: 'border-red-200 dark:border-red-800/30'
                };
            case 'vendedor':
                return { 
                    title: 'Vendedores', 
                    icon: UserIcon, 
                    color: 'text-blue-600', 
                    bg: 'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950/30 dark:to-blue-900/20',
                    borderColor: 'border-blue-200 dark:border-blue-800/30'
                };
            case 'almacenero':
                return { 
                    title: 'Almaceneros', 
                    icon: UserIcon, 
                    color: 'text-green-600', 
                    bg: 'bg-gradient-to-br from-green-100 to-green-50 dark:from-green-950/30 dark:to-green-900/20',
                    borderColor: 'border-green-200 dark:border-green-800/30'
                };
            default:
                return { 
                    title: 'Sin Rol', 
                    icon: UserIcon, 
                    color: 'text-gray-600', 
                    bg: 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-950/30 dark:to-gray-900/20',
                    borderColor: 'border-gray-200 dark:border-gray-800/30'
                };
        }
    };

    console.log('Users data:', users.data.map(u => ({ name: u.name, roles: u.roles })));

    return (
        <AppLayout>
            <Head title="Gestión de Usuarios" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                        <p className="text-default-500">
                            Administra los usuarios y sus roles del sistema
                        </p>
                    </div>
                    <Button
                        color="primary"
                        startContent={<UserPlus className="h-5 w-5" />}
                        onPress={onCreateOpen}
                        size="lg"
                        className="shadow-lg rounded-2xl font-semibold"
                    >
                        Nuevo Usuario
                    </Button>
                </div>

                {sortedRoles.map((roleName) => {
                    const section = getRoleSection(roleName);
                    const roleUsers = usersByRole[roleName];
                    const SectionIcon = section.icon;

                    return (
                        <div key={roleName} className="space-y-4">
                            {/* Header de Sección */}
                            <div className={`flex items-center gap-3 pb-3 px-4 py-3 rounded-2xl border ${section.bg} ${section.borderColor}`}>
                                <div className={`p-2.5 rounded-xl ${section.bg} border ${section.borderColor}`}>
                                    <SectionIcon className={`h-6 w-6 ${section.color}`} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold">{section.title}</h2>
                                    <p className="text-sm text-default-500">
                                        {roleUsers.length} {roleUsers.length === 1 ? 'usuario' : 'usuarios'}
                                    </p>
                                </div>
                            </div>

                            {/* Grid de usuarios de este rol */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {roleUsers.map((user) => {
                                    const userRoleName = user.roles[0]?.name || 'sin-rol';
                                    const cardColor = getRoleSection(userRoleName);
                                    
                                    return (
                                        <Card
                                            key={user.id}
                                            className={`shadow-2xl rounded-3xl dark:bg-[#18181b] border-2 ${cardColor.borderColor} hover:scale-[1.02] transition-transform`}
                                        >
                                            <CardHeader className="flex justify-between items-start px-6 pt-6 pb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-3 rounded-xl ${cardColor.bg}`}>
                                                        <UserIcon className={`h-6 w-6 ${cardColor.color}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold line-clamp-1">
                                                            {user.name}
                                                        </h3>
                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            color={getRoleBadgeColor(userRoleName)}
                                                            startContent={<Shield className="h-3.5 w-3.5" />}
                                                            className={`mt-1 rounded-lg w-fit font-semibold ${
                                                                userRoleName === 'admin'
                                                                    ? 'text-red-600 bg-red-100 dark:bg-red-950/50'
                                                                    : userRoleName === 'vendedor'
                                                                    ? 'text-blue-600 bg-blue-100 dark:bg-blue-950/50'
                                                                    : userRoleName === 'almacenero'
                                                                    ? 'text-green-600 bg-green-100 dark:bg-green-950/50'
                                                                    : 'text-gray-600 bg-gray-100 dark:bg-gray-950/50'
                                                            }`}
                                                        >
                                                            {userRoleName === 'sin-rol' ? 'Sin rol' : getRoleDisplayName(userRoleName)}
                                                        </Chip>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        onPress={() => handleEdit(user)}
                                                        className="rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        onPress={() => handleDelete(user)}
                                                        className="rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardBody className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-default-500 mb-3">
                                                    <Mail className="h-4 w-4" />
                                                    <span className="line-clamp-1">{user.email}</span>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-xs text-default-400">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>
                                                            {new Date(user.created_at).toLocaleDateString('es-ES', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Crear Usuario */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onCreateClose}
                    />
                    
                    <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-[#09090b] rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-divider">
                        <form onSubmit={handleCreate} className="flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b border-divider bg-gradient-to-r from-primary/10 to-secondary/10 sticky top-0 z-10 bg-white dark:bg-[#09090b]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary rounded-xl">
                                        <UserPlus className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Crear Nuevo Usuario</h2>
                                        <p className="text-sm text-default-500 mt-1">
                                            Completa los datos del nuevo usuario
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    onPress={onCreateClose}
                                    className="rounded-full"
                                    size="lg"
                                    type="button"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <div className="p-8 space-y-6 bg-white dark:bg-[#09090b]">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Nombre <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ingresa el nombre completo"
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData('name', e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                        />
                                        {createForm.errors.name && <p className="text-xs text-danger">{createForm.errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Email <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="correo@ejemplo.com"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                        />
                                        {createForm.errors.email && <p className="text-xs text-danger">{createForm.errors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Contraseña <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Mínimo 8 caracteres"
                                            value={createForm.data.password}
                                            onChange={(e) => createForm.setData('password', e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                        />
                                        {createForm.errors.password && <p className="text-xs text-danger">{createForm.errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Confirmar Contraseña <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Repite la contraseña"
                                            value={createForm.data.password_confirmation}
                                            onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                        Rol <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        value={createForm.data.role}
                                        onChange={(e) => createForm.setData('role', e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-white dark:bg-[#09090b] transition-all duration-200 outline-none text-foreground [&>option]:bg-white [&>option]:dark:bg-[#09090b] [&>option]:text-foreground"
                                    >
                                        <option value="">Selecciona un rol</option>
                                        {roles.map((role) => (
                                            <option key={role.name} value={role.name}>
                                                {getRoleDisplayName(role.name)}
                                            </option>
                                        ))}
                                    </select>
                                    {createForm.errors.role && <p className="text-xs text-danger">{createForm.errors.role}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 p-6 border-t border-divider bg-default-50 dark:bg-[#18181b] sticky bottom-0">
                                <Button
                                    variant="flat"
                                    onPress={onCreateClose}
                                    isDisabled={createForm.processing}
                                    size="lg"
                                    type="button"
                                    className="rounded-xl font-medium"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    color="primary"
                                    type="submit"
                                    isLoading={createForm.processing}
                                    size="lg"
                                    className="rounded-xl font-semibold px-8"
                                >
                                    Crear Usuario
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Usuario */}
            {isEditOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onEditClose}
                    />
                    
                    <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-[#09090b] rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-divider">
                        <form onSubmit={handleUpdate} className="flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b border-divider bg-gradient-to-r from-primary/10 to-secondary/10 sticky top-0 z-10 bg-white dark:bg-[#09090b]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary rounded-xl">
                                        <Pencil className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Editar Usuario</h2>
                                        <p className="text-sm text-default-500 mt-1">
                                            Actualiza los datos del usuario
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    onPress={onEditClose}
                                    className="rounded-full"
                                    size="lg"
                                    type="button"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <div className="p-8 space-y-6 bg-white dark:bg-[#09090b]">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Nombre <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ingresa el nombre completo"
                                            value={editForm.data.name}
                                            onChange={(e) => editForm.setData('name', e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                        />
                                        {editForm.errors.name && <p className="text-xs text-danger">{editForm.errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Email <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="correo@ejemplo.com"
                                            value={editForm.data.email}
                                            onChange={(e) => editForm.setData('email', e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                        />
                                        {editForm.errors.email && <p className="text-xs text-danger">{editForm.errors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Nueva Contraseña (opcional)
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Dejar vacío para no cambiar"
                                            value={editForm.data.password}
                                            onChange={(e) => editForm.setData('password', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                        />
                                        {editForm.errors.password && <p className="text-xs text-danger">{editForm.errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                            Confirmar Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Repite la nueva contraseña"
                                            value={editForm.data.password_confirmation}
                                            onChange={(e) => editForm.setData('password_confirmation', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-default-700 dark:text-default-300 block">
                                        Rol <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        value={editForm.data.role}
                                        onChange={(e) => editForm.setData('role', e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-white dark:bg-[#09090b] transition-all duration-200 outline-none text-foreground [&>option]:bg-white [&>option]:dark:bg-[#09090b] [&>option]:text-foreground"
                                    >
                                        <option value="">Selecciona un rol</option>
                                        {roles.map((role) => (
                                            <option key={role.name} value={role.name}>
                                                {getRoleDisplayName(role.name)}
                                            </option>
                                        ))}
                                    </select>
                                    {editForm.errors.role && <p className="text-xs text-danger">{editForm.errors.role}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 p-6 border-t border-divider bg-default-50 dark:bg-[#18181b] sticky bottom-0">
                                <Button
                                    variant="flat"
                                    onPress={onEditClose}
                                    isDisabled={editForm.processing}
                                    size="lg"
                                    type="button"
                                    className="rounded-xl font-medium"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    color="primary"
                                    type="submit"
                                    isLoading={editForm.processing}
                                    size="lg"
                                    className="rounded-xl font-semibold px-8"
                                >
                                    Actualizar Usuario
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Eliminar Usuario */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-md"
                        onClick={onDeleteClose}
                    />
                    
                    <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#09090b] rounded-3xl shadow-2xl border-2 border-red-200 dark:border-red-900/50 overflow-hidden">
                        {/* Header con gradiente mejorado */}
                        <div className="relative p-6 border-b border-red-200 dark:border-red-900/30 bg-gradient-to-br from-red-50 via-red-100/50 to-orange-50 dark:from-red-950/40 dark:via-red-900/20 dark:to-orange-950/30">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
                                    <div className="relative p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/30">
                                        <Trash2 className="h-7 w-7 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 dark:from-red-400 dark:to-red-500 bg-clip-text text-transparent">
                                        ¿Estás seguro?
                                    </h2>
                                    <p className="text-sm text-red-600/80 dark:text-red-400/70 mt-0.5">
                                        Esta acción es permanente
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Body con card informativo */}
                        <div className="p-6">
                            <div className="bg-gradient-to-br from-red-50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/10 border-2 border-red-200 dark:border-red-900/30 rounded-2xl p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                                            <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-default-700 dark:text-default-300 leading-relaxed">
                                            Esta acción no se puede deshacer. Se eliminará el usuario
                                        </p>
                                        <div className="mt-2 px-3 py-2 bg-white dark:bg-black/30 rounded-lg border border-red-200 dark:border-red-900/40">
                                            <p className="text-base font-bold text-red-700 dark:text-red-300">
                                                {selectedUser?.name}
                                            </p>
                                            <p className="text-xs text-default-500 mt-0.5">
                                                {selectedUser?.email}
                                            </p>
                                        </div>
                                        <p className="text-sm text-default-700 dark:text-default-300 leading-relaxed mt-2">
                                            permanentemente del sistema.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer con botones mejorados */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-divider bg-gradient-to-br from-default-50 to-default-100/50 dark:from-[#18181b] dark:to-[#18181b]">
                            <Button
                                variant="flat"
                                onPress={onDeleteClose}
                                size="lg"
                                className="rounded-xl font-medium hover:bg-default-200 dark:hover:bg-default-100/10 border-2 border-default-300 dark:border-default-700"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onPress={confirmDelete}
                                size="lg"
                                className="rounded-xl font-semibold px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30"
                            >
                                Eliminar Usuario
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
