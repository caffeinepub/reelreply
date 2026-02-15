import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, InstagramCredentials, AutomationSettings, CommentReplyLog } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const profile = await actor.getCallerUserProfile();
      return profile ?? null;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Instagram Credentials Queries
export function useGetCredentials() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<InstagramCredentials | null>({
    queryKey: ['credentials'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const credentials = await actor.getCredentials();
      return credentials ?? null;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useValidateCredentials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: InstagramCredentials) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.validateCredentials(credentials);
      if (!result) {
        throw new Error('Credential validation failed. Please check your credentials and try again.');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Automation Settings Queries
export function useGetAutomationSettings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AutomationSettings | null>({
    queryKey: ['automationSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const settings = await actor.getAutomationSettings();
      return settings ?? null;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateAutomationSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: AutomationSettings) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateAutomationSettings(settings);
      if (!result) {
        throw new Error('Failed to update automation settings');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationSettings'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Reply Logs Queries
export function useGetReplyLogs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CommentReplyLog[]>({
    queryKey: ['replyLogs'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getReplyLogs();
    },
    enabled: !!actor && !actorFetching,
  });
}
