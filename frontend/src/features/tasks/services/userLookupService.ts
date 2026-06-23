import apiService from "@/shared/services/api/api.service";

/**
 * User lookup service for Create Task flow
 * GET /users/lookup?username=<exact_username>
 * Returns the user if found, 404 otherwise.
 */
export const userLookupService = {
  /**
   * Lookup a user by exact username.
   * @param {string} username - Exact username to search
   * @returns {Promise<{id: string, username: string, first_name?: string, last_name?: string}>}
   */
  lookup: async (username: string) => {
    return apiService.get(`/users/lookup?username=${encodeURIComponent(username)}`, { silent: true } as any);
  }
};
