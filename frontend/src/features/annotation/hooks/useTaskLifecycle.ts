import { useState, useCallback } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import notificationService from '@/shared/services/notification';

const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';

export function useTaskLifecycle(taskId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submitForApproval = useCallback(async (note?: string) => {
    if (!taskId) return;
    
    setIsSubmitting(true);
    try {
      const api = IS_TEST_MODE 
        ? await import('../services/annotation.api.mock')
        : await import('../services/annotation.api');
        
      await api.updateTaskStatus(taskId, 'submitted', note);
      notificationService.success('Task submitted for approval.');
    } catch (error) {
      console.error('Failed to submit task:', error);
      notificationService.error('Failed to submit task.');
    } finally {
      setIsSubmitting(false);
    }
  }, [taskId]);

  return {
    isSubmitting,
    submitForApproval
  };
}
