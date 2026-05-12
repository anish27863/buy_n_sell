import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { users, sellerProfiles } from '@/db/schema';
import { eq, desc, ne } from 'drizzle-orm';
import { AdminUserActions } from './AdminUserActions';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  let customers: any[] = [];
  let sellers: any[] = [];

  try {
    // Customers — approval status lives on the users table
    const rawCustomers = await db
      .select({
        id: users.id,
        username: users.username,
        isBanned: users.isBanned,
        approvalStatus: users.approvalStatus,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, 'customer'))
      .orderBy(desc(users.createdAt));
    customers = rawCustomers;

    // Sellers — approval status lives on sellerProfiles, not users
    sellers = await db
      .select({
        id: users.id,
        username: users.username,
        isBanned: users.isBanned,
        approvalStatus: sellerProfiles.approvalStatus, // ← correct source
        shopName: sellerProfiles.shopName,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(sellerProfiles, eq(users.id, sellerProfiles.userId))
      .orderBy(desc(users.createdAt));
  } catch (e) {
    console.error(e);
  }

  const pendingCustomers  = customers.filter(u => u.approvalStatus === 'pending');
  const activeCustomers   = customers.filter(u => u.approvalStatus !== 'pending');

  const statusBadge = (u: any) => {
    if (u.isBanned)                          return { label: 'Banned',   cls: 'bg-red-500/20 text-red-400' };
    if (u.approvalStatus === 'pending')      return { label: 'Pending',  cls: 'bg-yellow-500/20 text-yellow-400' };
    if (u.approvalStatus === 'rejected')     return { label: 'Rejected', cls: 'bg-red-500/20 text-red-400' };
    return                                          { label: 'Active',   cls: 'bg-green-500/20 text-green-400' };
  };

  // Card component for mobile
  const UserCards = ({ list }: { list: any[] }) => (
    <div className="flex flex-col gap-3 md:hidden mb-8">
      {list.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] italic text-sm">None found.</div>
      ) : list.map(u => {
        const { label, cls } = statusBadge(u);
        return (
          <div key={u.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="font-semibold text-sm">{u.username}</div>
                {u.shopName && <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{u.shopName}</div>}
                <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
              </div>
              <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cls}`}>{label}</span>
            </div>
            <AdminUserActions userId={u.id} isBanned={u.isBanned ?? false} approvalStatus={u.approvalStatus || 'approved'} />
          </div>
        );
      })}
    </div>
  );

  // Table component for desktop
  const UserTable = ({ list }: { list: any[] }) => (
    <div className="hidden md:block overflow-x-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] mb-10">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          <tr>
            <th className="p-4 font-medium">Username</th>
            <th className="p-4 font-medium">Shop</th>
            <th className="p-4 font-medium">Joined</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {list.length === 0 ? (
            <tr><td colSpan={5} className="p-8 text-center text-[var(--color-text-muted)] italic">None found.</td></tr>
          ) : list.map(u => {
            const { label, cls } = statusBadge(u);
            return (
              <tr key={u.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                <td className="p-4 font-medium">{u.username}</td>
                <td className="p-4 text-[var(--color-text-secondary)]">{u.shopName || '—'}</td>
                <td className="p-4 text-[var(--color-text-secondary)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${cls}`}>{label}</span>
                </td>
                <td className="p-4 text-right">
                  <AdminUserActions userId={u.id} isBanned={u.isBanned ?? false} approvalStatus={u.approvalStatus || 'approved'} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-3 sm:px-6 md:px-8 py-6 md:py-12">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-serif mb-6 md:mb-10 border-b border-[var(--color-border)] pb-3 md:pb-6">
          User Management
        </h1>

        {pendingCustomers.length > 0 && (
          <>
            <h2 className="text-base sm:text-lg md:text-2xl font-serif mb-3 md:mb-4 text-[var(--color-warning)]">
              ⏳ Pending Approval <span className="text-sm font-sans">({pendingCustomers.length})</span>
            </h2>
            <UserCards list={pendingCustomers} />
            <UserTable list={pendingCustomers} />
          </>
        )}

        <h2 className="text-base sm:text-lg md:text-2xl font-serif mb-3 md:mb-4">
          Customers <span className="text-sm text-[var(--color-text-muted)] font-sans">({activeCustomers.length})</span>
        </h2>
        <UserCards list={activeCustomers} />
        <UserTable list={activeCustomers} />

        <h2 className="text-base sm:text-lg md:text-2xl font-serif mb-3 md:mb-4">
          Sellers <span className="text-sm text-[var(--color-text-muted)] font-sans">({sellers.length})</span>
        </h2>
        <UserCards list={sellers} />
        <UserTable list={sellers} />
      </div>
    </PageTransition>
  );
}
