import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import InspectorTab from './InspectorTab/InspectorTab';
import OverviewTab from './OverviewTab/OverviewTab';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import type { ClassDef, RelationType } from '../../types/annotation.types';

interface RightPanelProps {
  classes: ClassDef[];
  relationTypes: RelationType[];
}

export default function RightPanel({ classes, relationTypes }: RightPanelProps) {
  const activeTab = useAppStore(state => state.activeTab);
  const setActiveTab = useAppStore(state => state.setActiveTab);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as 'inspector' | 'overview')}
      className="flex flex-col h-full"
    >
      {/* Tab bar */}
      <div className="shrink-0 border-b px-3 pt-2 pb-0">
        <TabsList className="h-8 bg-transparent p-0 gap-1">
          <TabsTrigger
            value="inspector"
            className="
              h-8 px-3 text-xs font-medium rounded-none border-b-2 border-transparent
              data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:bg-transparent data-[state=inactive]:text-muted-foreground
              hover:text-foreground transition-colors
            "
          >
            Inspector
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="
              h-8 px-3 text-xs font-medium rounded-none border-b-2 border-transparent
              data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:bg-transparent data-[state=inactive]:text-muted-foreground
              hover:text-foreground transition-colors
            "
          >
            Overview
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Inspector content */}
      <TabsContent value="inspector" className="flex-1 overflow-hidden mt-0 flex flex-col">
        <InspectorTab classes={classes} relationTypes={relationTypes} />
      </TabsContent>

      {/* Overview content */}
      <TabsContent value="overview" className="flex-1 overflow-hidden mt-0 flex flex-col">
        <OverviewTab />
      </TabsContent>
    </Tabs>
  );
}
