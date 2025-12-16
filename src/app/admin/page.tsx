'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Car,
  Clipboard,
  Key,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Shield,
  Trash2,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { listUsers } from '@/ai/flows/admin/list-users';
import { listDrivers } from '@/ai/flows/admin/list-drivers';
import { generateDriverCode } from '@/ai/flows/admin/generate-driver-code';
import { deleteUser } from '@/ai/flows/admin/delete-user';
import { deleteDriver } from '@/ai/flows/admin/delete-driver';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Schemas
const createDriverSchema = z.object({
  fullName: z.string().min(3, 'Full name is required.'),
  email: z.string().email('A valid email is required.'),
  licenseNumber: z.string().min(1, 'License number is required.'),
  ghanaCardNumber: z.string().min(1, 'Ghana card number is required.'),
  busPlateNumber: z.string().min(1, 'Bus plate number is required.'),
});

type CreateDriverFormValues = z.infer<typeof createDriverSchema>;

type User = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  walletBalance?: number;
};

type Driver = {
  id: string;
  fullName?: string;
  email?: string;
  busPlateNumber?: string;
  registrationCode?: string;
};

export default function AdminPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  // State Management
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);
  const [newDriverCode, setNewDriverCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDriverFormValues>({
    resolver: zodResolver(createDriverSchema),
  });

  // Data Fetching
  const fetchUsersAndDrivers = async () => {
    setIsLoadingUsers(true);
    setIsLoadingDrivers(true);
    try {
      const [usersResponse, driversResponse] = await Promise.all([
        listUsers(),
        listDrivers(),
      ]);
      setUsers(usersResponse.users);
      setDrivers(driversResponse.drivers);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch data',
        description: error.message,
      });
    } finally {
      setIsLoadingUsers(false);
      setIsLoadingDrivers(false);
    }
  };

  useEffect(() => {
    fetchUsersAndDrivers();
  }, []);

  // Handlers
  const handleLogout = () => {
    auth.signOut().then(() => router.push('/'));
  };

  const handleCreateDriver: SubmitHandler<CreateDriverFormValues> = async (
    data
  ) => {
    setIsSubmittingDriver(true);
    setNewDriverCode(null);
    try {
      const result = await generateDriverCode(data);
      toast({
        title: 'Driver Created Successfully!',
        description: `Registration code for ${data.fullName} is ready.`,
      });
      setNewDriverCode(result.registrationCode);
      reset();
      fetchUsersAndDrivers(); // Refresh driver list
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create driver',
        description: error.message,
      });
    } finally {
      setIsSubmittingDriver(false);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    try {
        await deleteUser({ userId });
        toast({
            title: "User Deleted",
            description: "The user has been successfully deleted.",
        });
        fetchUsersAndDrivers(); // Refresh user list
    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Failed to delete user',
            description: error.message,
        });
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
     try {
        await deleteDriver({ driverId });
        toast({
            title: "Driver Deleted",
            description: "The driver has been successfully deleted.",
        });
        fetchUsersAndDrivers(); // Refresh driver list
    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Failed to delete driver',
            description: error.message,
        });
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Code copied to clipboard!" });
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href="/admin/make-admin">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Make Admin
                </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Driver */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Create New Driver</CardTitle>
                <CardDescription>
                    Fill out the form to create a new driver account. A registration
                    code will be generated automatically.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <form
                    onSubmit={handleSubmit(handleCreateDriver)}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...register('fullName')} />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="licenseNumber">License No.</Label>
                            <Input id="licenseNumber" {...register('licenseNumber')} />
                            {errors.licenseNumber && <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ghanaCardNumber">Ghana Card No.</Label>
                            <Input id="ghanaCardNumber" {...register('ghanaCardNumber')} />
                            {errors.ghanaCardNumber && <p className="text-sm text-destructive">{errors.ghanaCardNumber.message}</p>}
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="busPlateNumber">Bus Plate No.</Label>
                        <Input id="busPlateNumber" {...register('busPlateNumber')} />
                        {errors.busPlateNumber && <p className="text-sm text-destructive">{errors.busPlateNumber.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmittingDriver}>
                        {isSubmittingDriver && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Code
                    </Button>
                </form>
                </CardContent>
            </Card>

            {newDriverCode && (
                <Card className="bg-primary/10 border-primary animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Driver Registration Code</CardTitle>
                        <CardDescription>Share this one-time code with the new driver.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div 
                            className="text-4xl font-bold tracking-widest bg-muted p-4 rounded-lg cursor-pointer"
                             onClick={() => copyToClipboard(newDriverCode)}
                        >
                            {newDriverCode}
                        </div>
                        <Button variant="ghost" size="sm" className="mt-2" onClick={() => copyToClipboard(newDriverCode)}>
                            <Clipboard className="mr-2 h-4 w-4" />
                            Copy Code
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Right Column: Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Management */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />User Management</CardTitle>
                <CardDescription>View and manage passenger accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Wallet Balance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingUsers ? (
                                <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></TableCell></TableRow>
                            ) : users.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No users found.</TableCell></TableRow>
                            ) : (
                                users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>GH₵ {user.walletBalance?.toFixed(2) || '0.00'}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Delete User?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete {user.firstName}? This is permanent.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Driver Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Car className="h-5 w-5" />Driver Management</CardTitle>
                    <CardDescription>View and manage driver accounts and their registration codes.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="border rounded-lg">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Driver</TableHead>
                            <TableHead>Registration Code</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {isLoadingDrivers ? (
                                <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></TableCell></TableRow>
                            ) : drivers.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No drivers found.</TableCell></TableRow>
                            ) : (
                                drivers.map(driver => (
                                    <TableRow key={driver.id}>
                                        <TableCell>
                                            <div className="font-medium">{driver.fullName}</div>
                                            <div className="text-sm text-muted-foreground">{driver.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div 
                                                className="font-mono tracking-wider bg-muted px-2 py-1 rounded-md inline-block cursor-pointer"
                                                onClick={() => driver.registrationCode && copyToClipboard(driver.registrationCode)}
                                            >
                                                {driver.registrationCode || 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Delete Driver?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete {driver.fullName}? This is permanent.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteDriver(driver.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
      </main>
    </div>
  );
}
