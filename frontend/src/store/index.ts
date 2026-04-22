import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createViewerSlice } from '../features/viewer/store/viewerSlice';
import type { ViewerState } from '../features/viewer/store/viewerSlice';
import { createAnnotationSlice } from '../features/annotation/store/annotationSlice';
import type { AnnotationState } from '../features/annotation/store/annotationSlice';
import { createToolModeSlice } from '../features/annotation/store/toolModeSlice';
import type { ToolModeState } from '../features/annotation/store/toolModeSlice';
import { createUISlice } from '../features/annotation/store/uiSlice';
import type { UIState } from '../features/annotation/store/uiSlice';

export type AppState = ViewerState & AnnotationState & ToolModeState & UIState;

export const useAppStore = create<AppState>()(
  devtools(
    (...a) => ({
      ...createViewerSlice(...a),
      ...createAnnotationSlice(...a),
      ...createToolModeSlice(...a),
      ...createUISlice(...a),
    }),
    { name: 'ColdatAppStore' }
  )
);
