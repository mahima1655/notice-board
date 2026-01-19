import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Notice } from '@/types';
import Layout from '@/components/Layout';
import NoticeForm from '@/components/NoticeForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const CreateNotice: React.FC = () => {
  const { userData } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  const handleSuccess = () => {
    setSuccessCount((prev) => prev + 1);
    toast.success('Notice created successfully!');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Create Notice</h1>
          <p className="text-muted-foreground mt-1">
            Post new announcements for students and staff
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Create Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setFormOpen(true)}>
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">New Notice</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a new announcement for the college community
              </p>
              <Button>Create Now</Button>
            </CardContent>
          </Card>

          
        </div>

        
      </div>

      <NoticeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleSuccess}
      />
    </Layout>
  );
};

export default CreateNotice;
