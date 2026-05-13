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
import { createContextSlice } from '../shared/store/contextSlice';
import type { ContextState } from '../shared/store/contextSlice';
import { createKeyboardSlice } from '../shared/store/keyboardSlice';
import type { KeyboardState } from '../shared/store/keyboardSlice';
import { createViewerUISlice } from '../features/viewer/store/viewerUISlice';
import type { ViewerUIState } from '../features/viewer/store/viewerUISlice';
import { createUploadManagerSlice } from '../features/upload_manager/store/uploadManagerSlice';
import type { UploadManagerState } from '../features/upload_manager/store/uploadManagerSlice';

export type AppState = ViewerState & AnnotationState & ToolModeState & UIState & ContextState & KeyboardState & ViewerUIState & UploadManagerState;

export const useAppStore = create<AppState>()(
  devtools(
    (...a) => ({
      ...createViewerSlice(...a),
      ...createAnnotationSlice(...a),
      ...createToolModeSlice(...a),
      ...createUISlice(...a),
      ...createContextSlice(...a),
      ...createKeyboardSlice(...a),
      ...createViewerUISlice(...a),
      ...createUploadManagerSlice(...a),
    }),
    { name: 'ColdatAppStore' }
  )
);

