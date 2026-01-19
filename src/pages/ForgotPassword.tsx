import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const { resetPassword } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            await resetPassword(data.email);
            toast.success('Password reset email sent! Check your inbox.');
            navigate('/auth'); // Redirect back to login
        } catch (error: any) {
            console.error('Reset password error:', error);
            if (error.code === 'auth/user-not-found') {
                toast.error('No account found with this email.');
            } else {
                toast.error('Failed to reset password. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white">Reset Password</h1>
                    <p className="text-white/70 mt-2">Enter your email to receive a reset link</p>
                </div>

                <Card className="glass border-white/10 shadow-2xl">
                    <CardHeader>
                        <CardTitle>Forgot Password?</CardTitle>
                        <CardDescription>
                            Don't worry! It happens. Please enter the email associated with your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="you@college.edu"
                                                        className="pl-10 input-focus"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full btn-hero" disabled={isLoading}>
                                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Send Reset Link
                                </Button>

                                <div className="text-center mt-4">
                                    <Link
                                        to="/auth"
                                        className="text-sm text-primary hover:text-primary/80 inline-flex items-center"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
