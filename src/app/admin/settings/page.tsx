import { SettingsForm } from '@/shared/components/admin/SettingsForm';
import { Card } from '@/shared/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>系统设置</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          配置网站基本信息和服务状态
        </p>
      </div>

      <Card className='p-6'>
        <SettingsForm />
      </Card>
    </div>
  );
}
