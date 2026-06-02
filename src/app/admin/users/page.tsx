import { getUsers, getUserCount, updateUserRole } from '@/core/db/queries';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import Link from 'next/link';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page: pageStr, search } = await searchParams;
  const page = parseInt(pageStr || '1', 10);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const [users, total] = await Promise.all([
    getUsers({ limit: pageSize, offset, search }),
    getUserCount(search),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>用户管理</h1>

      {/* Search */}
      <form className='flex gap-2 max-w-sm'>
        <Input
          name='search'
          defaultValue={search || ''}
          placeholder='搜索邮箱...'
        />
        <Button type='submit' variant='outline'>搜索</Button>
        {search && (
          <Link href='/admin/users'>
            <Button variant='ghost' size='sm'>清除</Button>
          </Link>
        )}
      </form>

      <Card className='overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50'>
            <tr>
              <th className='text-left p-3'>邮箱</th>
              <th className='text-left p-3'>名称</th>
              <th className='text-left p-3'>角色</th>
              <th className='text-left p-3'>注册时间</th>
              <th className='text-right p-3'>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className='text-center p-6 text-muted-foreground'>
                  暂无用户
                </td>
              </tr>
            )}
            {users.map((user: any) => (
              <tr key={user.id} className='border-t'>
                <td className='p-3 font-mono text-xs'>{user.email}</td>
                <td className='p-3'>{user.name || '-'}</td>
                <td className='p-3'>
                  <span className={user.role === 'admin' ? 'text-primary font-medium' : ''}>
                    {user.role || 'user'}
                  </span>
                </td>
                <td className='p-3 text-muted-foreground'>
                  {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td className='p-3 text-right'>
                  <form
                    action={`/api/users/${user.id}/role`}
                    method='POST'
                    className='inline'
                  >
                    <input
                      type='hidden'
                      name='role'
                      value={user.role === 'admin' ? 'user' : 'admin'}
                    />
                    <Button
                      type='submit'
                      variant='ghost'
                      size='sm'
                    >
                      {user.role === 'admin' ? '移除管理员' : '设为管理员'}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center gap-2'>
          {page > 1 && (
            <Link href={`/admin/users?page=${page - 1}${search ? `&search=${search}` : ''}`}>
              <Button variant='outline' size='sm'>上一页</Button>
            </Link>
          )}
          <span className='text-sm text-muted-foreground self-center'>
            第 {page} / {totalPages} 页
          </span>
          {page < totalPages && (
            <Link href={`/admin/users?page=${page + 1}${search ? `&search=${search}` : ''}`}>
              <Button variant='outline' size='sm'>下一页</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
