import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Building, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';

const Profile: React.FC = () => {
  const { userData } = useAuth();

  if (!userData) return null;

  const initials = (userData.displayName || userData.email || 'U')
    .split(' ')
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase() || 'U';

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'teacher':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      default:
        return 'bg-green-500/10 text-green-600 border-green-200';
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">
            View your account information
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 text-2xl">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-foreground">{userData.displayName}</h2>
                <Badge className={`mt-2 ${getRoleBadgeColor(userData.role)} capitalize`}>
                  {userData.role}
                </Badge>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
              </div>

              {userData.department && (
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{userData.department}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{userData.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{format(userData.createdAt, 'MMMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </Layout>
  );
};

export default Profile;
