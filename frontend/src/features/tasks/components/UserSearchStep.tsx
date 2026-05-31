import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Loader2, AlertCircle, User as UserIcon } from 'lucide-react';
import { userSearchService } from '@/features/tasks/services/taskService';

export interface UserResult {
  id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface UserSearchStepProps {
  onSelect: (user: UserResult) => void;
  selectedUser: UserResult | null;
}

const UserSearchStep = ({ onSelect, selectedUser }: UserSearchStepProps) => {
  const { t } = useTranslation(['tasks']);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchIdRef = useRef(0);

  const fetchUsers = useCallback(
    async (searchQuery: string, cursor: string | null = null, append = false) => {
      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const response = await userSearchService.search(searchQuery, cursor, 10);
        if (fetchId !== fetchIdRef.current) return;

        const data = response?.data ?? response?.results ?? [];
        setUsers((prev) => (append ? [...prev, ...data] : data));
        setNextCursor(response?.next_cursor ?? null);
      } catch (err: any) {
        if (fetchId !== fetchIdRef.current) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          t('tasks:create.user_search_error', 'Failed to search users.');
        setError(msg);
      } finally {
        if (fetchId === fetchIdRef.current) setLoading(false);
      }
    },
    [t]
  );

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setUsers([]);
      setNextCursor(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchUsers(query.trim());
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchUsers]);

  const handleLoadMore = () => {
    if (nextCursor && !loading) {
      fetchUsers(query.trim(), nextCursor, true);
    }
  };

  const selectedUsername = selectedUser?.username ?? '';
  const hasUsers = users.length > 0;
  const showEmptyState = !loading && !error && query.trim().length > 0 && !hasUsers;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('tasks:create.search_placeholder', 'Search by username or email...')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-10 bg-background"
          autoFocus
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-destructive/20 bg-destructive/5 text-center">
          <AlertCircle size={24} className="text-destructive" />
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchUsers(query.trim())}
          >
            {t('tasks:error_try_again', 'Try Again')}
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && users.length === 0 && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {showEmptyState && (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <UserIcon size={32} className="text-muted-foreground/40" />
          <p className="text-sm">{t('tasks:create.no_users_found', 'No users matching your search.')}</p>
        </div>
      )}

      {/* Results Table */}
      {hasUsers && (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">
                  {t('tasks:create.user_table.username', 'Username')}
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t('tasks:create.user_table.email', 'Email')}
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  {t('tasks:create.user_table.full_name', 'Full Name')}
                </TableHead>
                <TableHead className="w-[90px] text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSelected = selectedUsername === user.username;
                return (
                  <TableRow
                    key={user.id}
                    className={isSelected ? 'bg-primary/5' : undefined}
                  >
                    <TableCell className="font-medium">@{user.username}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {user.email || '—'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={isSelected ? 'secondary' : 'outline'}
                        onClick={() => onSelect(isSelected ? null! : user)}
                        className="h-8 min-w-[68px] text-xs"
                      >
                        {isSelected
                          ? t('tasks:create.user_table.selected', 'Selected')
                          : t('tasks:create.user_table.select', 'Select')}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Load More */}
          {nextCursor && (
            <div className="flex justify-center p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={loading}
                className="text-xs gap-2"
              >
                {loading && <Loader2 size={12} className="animate-spin" />}
                {t('tasks:create.load_more', 'Load More')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchStep;
