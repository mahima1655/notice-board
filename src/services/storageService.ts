import { supabase } from '@/lib/supabase';

export const uploadFile = async (
    file: File
): Promise<{ url: string; name: string; type: 'pdf' | 'image' }> => {
    const bucketName = 'campus-uploads';

    try {
        // Sanitize filename to avoid weird character issues
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file);

        if (error) {
            throw error;
        }

        if (!data) {
            throw new Error('Upload failed: No data returned');
        }

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return {
            url: publicUrlData.publicUrl,
            name: file.name,
            type: file.type.includes('pdf') || file.name.endsWith('.pdf') ? 'pdf' : 'image',
        };
    } catch (error: any) {
        console.error('Error uploading file to Supabase:', error);
        // Provide a more helpful error message
        if (error.message?.includes('Bucket not found') || error.error?.includes('Bucket not found')) {
            throw new Error(`Bucket '${bucketName}' not found. Please create it in your Supabase dashboard and make it public.`);
        }
        throw error;
    }
};
