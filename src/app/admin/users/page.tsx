import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, desc, ne } from 'drizzle-orm';
import { AdminUserActions } from './AdminUserActions';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  let allUsers: any[] = [];
  try {
    allUsers = await db
      .select({ id: users.id, username: users.username, role: users.role, isBanned: users.isBanned, approvalStatus: users.approvalStatus, createdAt: users.createdAt })
      .from(users)
      .where(ne(users.role, 'admin'))
      .orderBy(desc(users.createdAt));
  } catch (e) { console.error(e); }

  const pendingCustomers = allUsers.filter(u => u.role === 'customer' && u.approvalStatus === 'pending');
  const activeCustomers = allUsers.filter(u => u.role === 'customer' && u.approvalStatus !== 'pending');
  const sellers = allUsers.filter(u => u.role === 'seller');

  const UserTable = ({ list, showApproval }: { list: typeof allUsers; showApproval?: boolean }) => (
    <div className="overflow-x-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] mb-10">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          <tr>
            <th className="p-4 font-medium">Username</th>
            <th className="p-4 font-medium">Joined</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {list.length === 0 ? (
            <tr><td colSpan={4} className="p-8 text-center text-[var(--color-text-muted)] italic">None found.</td></tr>
          ) : list.map(u => (
            <tr key={u.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
              <td className="p-4 font-medium">{u.username}</td>
              <td className="p-4 text-[var(--color-text-secondary)]">{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                  u.isBanned ? 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]' :
                  u.approvalStatus === 'pending' ? 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]' :
                  u.approvalStatus === 'rejected' ? 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]' :
                  'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                }`}>
                  {u.isBanned ? 'Banned' : u.approvalStatus || 'Active'}
                </span>
              </td>
              <td className="p-4 text-right">
                <AdminUserActions userId={u.id} isBanned={u.isBanned ?? false} approvalStatus={u.approvalStatus || 'approved'} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-4xl font-serif mb-10 border-b border-[var(--color-border)] pb-6">User Management</h1>

        {pendingCustomers.length > 0 && (
          <>
            <h2 className="text-2xl font-serif mb-4 text-[var(--color-warning)]">
              ⏳ Pending Approval <span className="text-base font-sans">({pendingCustomers.length})</span>
            </h2>
            <UserTable list={pendingCustomers} showApproval />
          </>
        )}

        <h2 className="text-2xl font-serif mb-4">Customers <span className="text-base text-[var(--color-text-muted)] font-sans">({activeCustomers.length})</span></h2>
        <UserTable list={activeCustomers} />

        <h2 className="text-2xl font-serif mb-4">Sellers <span className="text-base text-[var(--color-text-muted)] font-sans">({sellers.length})</span></h2>
        <UserTable list={sellers} />
      </div>
    </PageTransition>
  );
}
