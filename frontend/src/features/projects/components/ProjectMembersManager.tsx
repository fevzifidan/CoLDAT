// frontend/src/features/projects/components/ProjectMembersManager.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  UserPlus,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  Search,
  Crown,
} from "lucide-react";

import { projectService } from '@/features/projects/services/projectService';
import notificationService from '@/shared/services/notification/notification.service';
import { Guard } from '@/shared/components/Guard';

// Backend ProjectMembershipSerializer response format (role field does NOT exist)
interface ProjectMember {
  id: string;           // membership id
  user_id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  joined_at?: string;
}

interface LookupUser {
  id: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface ProjectMembersManagerProps {
  projectId: string;
  ownerId?: string;     // project.owner_id — to highlight the owner
}

const ProjectMembersManager = ({
  projectId,
  ownerId,
}: ProjectMembersManagerProps) => {
  const { t } = useTranslation(['accounts', 'pages', 'common']);

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // User lookup states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LookupUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch project members
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await projectService.getProjectMembers(projectId);
      let membersData: ProjectMember[] = [];

      if (response?.data) {
        membersData = response.data;
      } else if (Array.isArray(response)) {
        membersData = response;
      }

      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (error: any) {
      console.error('Failed to fetch members:', error);
      notificationService.error(t('pages:errors.fetch_failed'));
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId || projectId === 'undefined') return;
    fetchMembers();
  }, [projectId]);

  // User lookup with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await projectService.lookupUsers(searchQuery);
        setSearchResults(Array.isArray(results) ? results : []);
        setShowDropdown(true);
      } catch (error) {
        console.error('User lookup error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSelectUser = (user: LookupUser) => {
    setSelectedUserId(user.id);
    const displayName = user.first_name || user.last_name
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
      : user.username || user.email || t('accounts:team.fallbackName');
    setSearchQuery(displayName);
    setShowDropdown(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      notificationService.error(t('accounts:team.selectUserWarning'));
      return;
    }

    try {
      await projectService.addProjectMember(projectId, {
        user_id: selectedUserId,
      });

      notificationService.success(t('pages:team.alert_invited', { email: searchQuery }));

      // Reset form
      setSearchQuery('');
      setSelectedUserId('');
      setSearchResults([]);
      setIsAdding(false);

      // Refresh list
      fetchMembers();
    } catch (error: any) {
      console.error('Add member error:', error.response?.data);
      const backendErrors = error.response?.data;

      if (error.response?.status === 401) {
        notificationService.error(t('accounts:team.errors.sessionExpiredShort'));
        return;
      }

      if (backendErrors?.detail) {
        notificationService.error(backendErrors.detail);
      } else if (backendErrors?.user_id) {
        notificationService.error(`${t('accounts:team.errors.userErrorPrefix')}: ${backendErrors.user_id.join(', ')}`);
      } else {
        notificationService.error(t('accounts:team.errors.addFailed'));
      }
    }
  };

  const removeUser = async (membershipId: string) => {
    try {
      await projectService.removeProjectMember(projectId, membershipId);
      notificationService.success(t('accounts:team.roles.removedMessage', 'Member removed successfully.'));
      fetchMembers();
    } catch (error: any) {
      console.error('Remove member error:', error.response?.data);
      const errorData = error.response?.data;

      if (error.response?.status === 401) {
        notificationService.error(t('accounts:team.errors.sessionExpiredToken'));
        return;
      }

      if (errorData?.detail) {
        notificationService.error(errorData.detail);
      } else {
        notificationService.error(t('accounts:team.errors.removeFailed'));
      }
    }
  };

  const getDisplayName = (member: ProjectMember): string => {
    if (member.first_name || member.last_name) {
      return `${member.first_name || ''} ${member.last_name || ''}`.trim();
    }
    return member.username || member.email?.split('@')[0] || t('accounts:team.fallbackName');
  };

  const isOwner = (member: ProjectMember): boolean => {
    return ownerId !== undefined && member.user_id === ownerId;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">
            {t('team.title', 'Team Members')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('team.description', 'Manage project members.')}
          </p>
        </div>

        <Guard permission="member:add">
          <Button
            onClick={() => setIsAdding(!isAdding)}
            variant={isAdding ? 'outline' : 'default'}
          >
            {isAdding ? (
              <>
                <X className="mr-2 h-4 w-4" />
                {t('common:status.cancel')}
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('team.add_member', 'Add Member')}
              </>
            )}
          </Button>
        </Guard>
      </div>

      {/* Add Member Form */}
      {isAdding && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4 items-end">
              {/* User Search */}
              <div className="flex-1 space-y-2 relative">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  {t('accounts:team.searchLabel', 'Search User')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedUserId('');
                    }}
                    type="text"
                    placeholder={t('accounts:team.searchPlaceholder', 'Type username...')}
                    className="pl-9 bg-background"
                    required
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-popover border rounded-xl shadow-lg overflow-hidden">
                    {searchResults.map((user) => {
                      const displayName = user.first_name || user.last_name
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : user.username;
                      return (
                        <button
                          key={`lookup-${user.id}`}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="w-full text-left px-4 py-3 hover:bg-muted border-b last:border-b-0 transition"
                        >
                          <div className="font-medium text-sm">{displayName}</div>
                          {user.email && (
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={!selectedUserId}>
                {t('team.add', 'Add Member')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <div className="grid gap-3">
        {members.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-xl">
            {t('team.no_members', 'No members found.')}
          </div>
        ) : (
          members.map((member) => {
            const displayName = getDisplayName(member);
            const isOwnerMember = isOwner(member);

            return (
              <Card key={`member-${member.id}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{displayName}</p>
                        <p className="text-xs text-muted-foreground">@{member.username}</p>
                        {isOwnerMember && (
                          <Badge className="bg-amber-500 hover:bg-amber-600 gap-1">
                            <Crown size={12} />
                            {t('accounts:team.roles.OWNER', 'Owner')}
                          </Badge>
                        )}
                      </div>
                      {member.email && (
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-emerald-600 text-[10px] font-bold gap-1">
                      <CheckCircle2 size={12} />
                      {t('team.status.active', 'Active')}
                    </div>

                    {!isOwnerMember && (
                      <Guard permission="member:remove">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeUser(member.id)}
                          className="hover:bg-destructive/10"
                        >
                          <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                        </Button>
                      </Guard>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectMembersManager;
