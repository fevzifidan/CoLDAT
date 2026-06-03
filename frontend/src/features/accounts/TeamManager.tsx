// frontend/src/assets/TeamManager.tsx

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
  UserCheck,
  Search,
} from "lucide-react";
import { SelectFilter } from '@/shared/components/SelectFilter';

import { projectService } from '@/features/projects/services/projectService';

import notificationService from '@/shared/services/notification/notification.service';

interface TeamMember {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  role: string;
  status?: string;
}

interface LookupUser {
  id: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface TeamManagerProps {
  projectId: string;
}

const TeamManager = ({
  projectId,
}: TeamManagerProps) => {
    const { t } = useTranslation([
    'accounts',
    'pages',
    'common',
  ]);

  const [team, setTeam] = useState<TeamMember[]>(
    []
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isAdding, setIsAdding] =
    useState(false);

  /**
   * USER LOOKUP STATES
   */

  const [searchQuery, setSearchQuery] =
    useState('');

  const [searchResults, setSearchResults] =
    useState<LookupUser[]>([]);

  const [selectedUserId, setSelectedUserId] =
    useState('');

  const [showDropdown, setShowDropdown] =
    useState(false);

  const [isSearching, setIsSearching] =
    useState(false);

  /**
   * ROLE
   */

  const [role, setRole] =
    useState('annotator');

  /**
   * MEMBERS FETCH
   */

  const fetchMembers = async () => {
    try {
      setIsLoading(true);

      const response =
        await projectService.getProjectMembers(
          projectId
        );

      let membersData = [];

      if (response && response.data) {
        membersData = response.data;
      } else if (Array.isArray(response)) {
        membersData = response;
      }

      setTeam(
        Array.isArray(membersData)
          ? membersData
          : []
      );
    } catch (error: any) {
            console.error(
        'Failed to fetch members:',
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.data?.detail?.includes(
          'token'
        )
      ) {
        notificationService.error(
          t('accounts:team.errors.sessionExpired')
        );
      } else {
        notificationService.error(
          t('pages:errors.fetch_failed')
        );
      }

      setTeam([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      !projectId ||
      projectId === 'undefined'
    )
      return;

    fetchMembers();
  }, [projectId]);

  /**
   * USER LOOKUP (DEBOUNCE)
   */

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);

        const results =
          await projectService.lookupUsers(
            searchQuery
          );

        setSearchResults(
          Array.isArray(results)
            ? results
            : []
        );

        setShowDropdown(true);
      } catch (error) {
        console.error(
          'User lookup error:',
          error
        );
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  /**
   * USER SELECT
   */

  const handleSelectUser = (
    user: LookupUser
  ) => {
    setSelectedUserId(user.id);

    const displayName =
      user.first_name || user.last_name
        ? `${user.first_name || ''} ${
            user.last_name || ''
          }`.trim()
                : user.username ||
          user.email ||
          t('accounts:team.fallbackName');

    setSearchQuery(displayName);

    setShowDropdown(false);
  };

  /**
   * ADD USER
   */

  const handleAddUser = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!selectedUserId) {
            notificationService.error(
        t('accounts:team.selectUserWarning')
      );

      return;
    }

    try {
      await projectService.addProjectMember(
        projectId,
        {
          user_id: selectedUserId,
          role,
        }
      );

            notificationService.success(
        t('pages:team.alert_invited', { email: searchQuery })
      );

      setSearchQuery('');
      setSelectedUserId('');
      setSearchResults([]);
      setRole('annotator');

      setIsAdding(false);

      fetchMembers();
    } catch (error: any) {
            console.error(
        'Add member error:',
        error.response?.data
      );

      const backendErrors =
        error.response?.data;

      if (
        error.response?.status === 401 ||
        backendErrors?.detail?.includes(
          'token'
        )
      ) {
        notificationService.error(
          t('accounts:team.errors.sessionExpiredShort')
        );

        return;
      }

      if (
        Array.isArray(backendErrors) &&
        backendErrors.length > 0
      ) {
        notificationService.error(backendErrors[0]);
      } else if (
        backendErrors &&
        typeof backendErrors === 'object'
      ) {
        if (backendErrors.user_id) {
          notificationService.error(
            `${t('accounts:team.errors.userErrorPrefix')}: ${backendErrors.user_id.join(
              ', '
            )}`
          );
        } else if (backendErrors.role) {
          notificationService.error(
            `${t('accounts:team.errors.roleErrorPrefix')}: ${backendErrors.role.join(
              ', '
            )}`
          );
        } else if (
          backendErrors.non_field_errors
        ) {
          notificationService.error(
            backendErrors.non_field_errors.join(
              ', '
            )
          );
        } else if (
          backendErrors.detail
        ) {
          notificationService.error(
            backendErrors.detail
          );
        } else {
          notificationService.error(
            t('accounts:team.errors.addFailed')
          );
        }
      } else {
        notificationService.error(
          t('accounts:team.errors.addFailed')
        );
      }
    }
  };

  /**
   * REMOVE USER
   */

  const removeUser = async (
    membershipId: string
  ) => {
    try {
      await projectService.removeProjectMember(
        projectId,
        membershipId
      );

            notificationService.success(
        t('accounts:team.roles.removedMessage', 'Member removed successfully.')
      );

      fetchMembers();
    } catch (error: any) {
            console.error(
        'Remove member error:',
        error.response?.data
      );

      const errorData =
        error.response?.data;

      if (
        error.response?.status === 401
      ) {
        notificationService.error(
          t('accounts:team.errors.sessionExpiredToken')
        );

        return;
      }

      if (
        Array.isArray(errorData) &&
        errorData.length > 0
      ) {
        notificationService.error(errorData[0]);
      } else if (
        errorData &&
        errorData.detail
      ) {
        notificationService.error(errorData.detail);
      } else {
        notificationService.error(
          t('accounts:team.errors.removeFailed')
        );
      }
    }
  };

  /**
   * ROLE LABEL
   */

    const getRoleLabel = (
    rawRole: string
  ) => {
    const roles: Record<string, string> =
      {
        OWNER: t('accounts:team.roles.OWNER'),
        ADMIN: t('accounts:team.roles.ADMIN'),
        ANNOTATOR: t('accounts:team.roles.ANNOTATOR'),
        VIEWER: t('accounts:team.roles.VIEWER'),
        REVIEWER: t('accounts:team.roles.REVIEWER'),
      };

    return (
      roles[rawRole.toUpperCase()] ||
      rawRole
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">
            {t(
              'team.title',
              'Team Management'
            )}
          </h3>

          <p className="text-sm text-muted-foreground">
            {t(
              'team.description',
              'Manage users and roles.'
            )}
          </p>
        </div>

        <Button
          onClick={() =>
            setIsAdding(!isAdding)
          }
          variant={
            isAdding
              ? 'outline'
              : 'default'
          }
        >
          {isAdding ? (
            <>
              <X className="mr-2 h-4 w-4" />
              {t(
                'common:status.cancel'
              )}
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              {t(
                'team.add_member',
                'Add Member'
              )}
            </>
          )}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-100 bg-indigo-50/20">
          <CardContent className="p-6">
            <form
              onSubmit={handleAddUser}
              className="flex flex-col md:flex-row gap-4 items-end"
            >
              {/* USER SEARCH */}
              <div className="flex-1 space-y-2 relative">
                                <label className="text-xs font-bold uppercase">
                  {t('accounts:team.searchLabel')}
                </label>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />

                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(
                        e.target.value
                      );

                      setSelectedUserId('');
                    }}
                    type="text"
                    placeholder={t('accounts:team.searchPlaceholder')}
                    className="pl-9"
                    required
                  />

                  {isSearching && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-slate-400" />
                  )}
                </div>

                {/* DROPDOWN */}
                {showDropdown &&
                  searchResults.length >
                    0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg overflow-hidden">
                      {searchResults.map(
                        (user) => {
                          const displayName =
                            user.first_name ||
                            user.last_name
                              ? `${user.first_name || ''} ${
                                  user.last_name ||
                                  ''
                                }`.trim()
                              : user.username;

                          return (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() =>
                                handleSelectUser(
                                  user
                                )
                              }
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b last:border-b-0 transition"
                            >
                              <div className="font-medium text-sm">
                                {displayName}
                              </div>

                              <div className="text-xs text-slate-400">
                                {user.email}
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
              </div>

              {/* ROLE */}
              <div className="w-full md:w-56 space-y-2">
                <label className="text-xs font-bold uppercase">
                  {t(
                    'team.role_label',
                    'Project Role'
                  )}
                </label>

                                <SelectFilter
                  value={role}
                  onChange={setRole}
                  triggerClassName="w-full h-10 bg-white"
                  options={[
                    { value: 'admin', label: 'ADMIN' },
                    { value: 'annotator', label: 'ANNOTATOR' },
                    { value: 'viewer', label: 'VIEWER' },
                  ]}
                />
              </div>

              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {t(
                  'team.add',
                  'Add Member'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TEAM LIST */}
      <div className="grid gap-3">
        {!team || team.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400 border border-dashed rounded-xl">
            {t(
              'team.no_members',
              'No members found.'
            )}
          </div>
        ) : (
          team.map((user) => {
                        const userName =
              user?.name ||
              user?.username ||
              user?.email?.split('@')[0] ||
              t('accounts:team.fallbackName');

            const userEmail =
              user?.email ||
              `ID: ${user?.id}`;

            const userRole =
              user?.role ||
              'annotator';

            const isOwner =
              userRole.toUpperCase() ===
              'OWNER';

            return (
              <Card
                key={
                  user?.id ||
                  Math.random().toString()
                }
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600">
                      {userName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">
                          {userName}
                        </p>

                        <Badge
                          variant={
                            isOwner
                              ? 'default'
                              : 'outline'
                          }
                          className={
                            isOwner
                              ? 'bg-amber-500 hover:bg-amber-600'
                              : ''
                          }
                        >
                          {getRoleLabel(
                            userRole
                          )}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-400">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-green-600 text-[10px] font-bold gap-1">
                      <CheckCircle2 size={12} />
                      {t(
                        'team.status.active',
                        'Active'
                      )}
                    </div>

                    {user?.id &&
                      !isOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeUser(
                              user.id
                            )
                          }
                        >
                          <Trash2
                            size={14}
                            className="text-slate-400 hover:text-red-500"
                          />
                        </Button>
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

export default TeamManager;