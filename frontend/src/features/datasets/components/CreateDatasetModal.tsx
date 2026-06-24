// src/features/datasets/components/CreateDatasetModal.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ChevronDown,
  FolderPlus,
  Layers,
  Loader2,
} from "lucide-react";
import { useCursorPagination } from "@/shared/hooks/useCursorPagination";
import type { PaginatedResponse } from "@/shared/hooks/useCursorPagination";
import { projectService } from "@/features/projects/services/projectService";
import { datasetService } from "@/features/datasets/services/datasetService";
import notificationService from "@/shared/services/notification/notification.service";

// ── Types ──
interface AdminProject {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

type ModalStep = "select_project" | "create_dataset";

interface CreateDatasetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDatasetCreated: () => void;
}

// ── Fetch adapter for useCursorPagination ──
const fetchAdminProjects = async (
  cursor: string | null,
  limit: number
): Promise<PaginatedResponse<AdminProject>> => {
  const response = await projectService.getAllProjects({
    limit,
    after: cursor,
  });

  // apiService interceptor resolves to the response body:
  // { data: Project[], next_cursor: string | null }
  const rawProjects = response?.data ?? [];

  // Filter to admin-only projects
  const adminProjects = rawProjects.filter(
    (p: any) => (p.role ?? "").toUpperCase() === "ADMIN"
  );

  return {
    data: adminProjects,
    next_cursor: response?.next_cursor ?? null,
  };
};

// ── Component ──
export const CreateDatasetModal: React.FC<CreateDatasetModalProps> = ({
  open,
  onOpenChange,
  onDatasetCreated,
}) => {
  const { t } = useTranslation(["datasets", "common"]);

  // ── Step state ──
  const [step, setStep] = useState<ModalStep>("select_project");
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(
    null
  );

  // ── Dataset creation form state ──
  const [datasetName, setDatasetName] = useState("");
  const [datasetDesc, setDatasetDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Cursor-based pagination for admin projects ──
  const {
    items: projects,
    loading: loadingProjects,
    hasNext,
    loadMore,
    reset: resetPagination,
    loadPage,
  } = useCursorPagination<AdminProject>({
    fetchFn: fetchAdminProjects,
    limit: 10,
    manualFirstPage: true,
  });

  // ── Reset everything when modal opens/closes ──
  useEffect(() => {
    if (open) {
      resetPagination();
      loadPage(null, false);
      setStep("select_project");
      setSelectedProject(null);
      setDatasetName("");
      setDatasetDesc("");
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Handlers ──
  const handleSelectProject = (project: AdminProject) => {
    setSelectedProject(project);
    setStep("create_dataset");
  };

  const handleBack = () => {
    setStep("select_project");
  };

  const handleCreateDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetName.trim() || !selectedProject) return;

    setSubmitting(true);
    try {
      await datasetService.createDataset(selectedProject.id, {
        name: datasetName.trim(),
        description: datasetDesc.trim(),
        initial_version_note: `Initial creation of ${datasetName.trim()}`,
      });

      notificationService.success(t("datasets:modal.success"));
      onDatasetCreated();
      onOpenChange(false);
    } catch (err: any) {
      const message =
        err?.message || err?.response?.data?.message || t("datasets:modal.error_create");
      notificationService.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
                        <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === "select_project" ? (
              <span className="flex items-center gap-2">
                <FolderPlus className="text-primary h-5 w-5" />
                {t("datasets:modal.step1_title")}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Layers className="text-primary h-5 w-5" />
                {t("datasets:modal.step2_title")}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "select_project"
              ? t("datasets:modal.step1_desc")
              : t("datasets:modal.step2_desc", {
                  projectName: selectedProject?.name ?? "",
                })}
          </DialogDescription>
                </DialogHeader>

        {/* ── Step 1: Project Selection ── */}
        {step === "select_project" && (
          <div className="space-y-3 pt-2">
            {loadingProjects ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {t("datasets:modal.loading_projects")}
                </p>
              </div>
            ) : projects.length === 0 ? (
              /* Empty state — no admin projects */
              <div className="flex flex-col items-center gap-4 py-12 text-center px-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <FolderPlus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {t("datasets:modal.no_admin_projects")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => onOpenChange(false)}
                >
                  {t("common:close", "Close")}
                </Button>
              </div>
            ) : (
              <>
                {/* Project List */}
                <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => handleSelectProject(project)}
                      className="w-full text-left p-3 rounded-xl border border-border bg-background hover:bg-accent hover:border-primary/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors truncate">
                            {project.name}
                          </p>
                          {project.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90 shrink-0 ml-2 group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Load More */}
                {hasNext && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMore}
                    disabled={loadingProjects}
                    className="w-full rounded-xl text-xs gap-2"
                  >
                    {loadingProjects && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {t("datasets:more_load", "Load More")}
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Step 2: Dataset Creation ── */}
        {step === "create_dataset" && (
          <form onSubmit={handleCreateDataset} className="space-y-4">
            {/* Back button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="rounded-xl h-8 gap-1.5 text-muted-foreground hover:text-card-foreground"
            >
              <ArrowLeft size={14} />
              {t("datasets:modal.back_button")}
            </Button>

            {/* Selected project badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border">
              <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FolderPlus size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  {t("datasets:modal.selected_project_label")}
                </p>
                <p className="text-sm font-semibold text-card-foreground truncate">
                  {selectedProject?.name}
                </p>
              </div>
            </div>

            {/* Dataset Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-card-foreground">
                {t("datasets:project_page.dataset_name_label", "Dataset Name")}
              </label>
              <Input
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder={t(
                  "datasets:project_page.placeholder_name",
                  "E.g. Autonomous Driving Dataset"
                )}
                required
                maxLength={100}
                className="bg-background border-border text-foreground rounded-xl"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-card-foreground">
                {t("pages:project_general.description", "Description")}
              </label>
              <Textarea
                value={datasetDesc}
                onChange={(e) => setDatasetDesc(e.target.value)}
                placeholder={t(
                  "pages:project_general.placeholder_desc",
                  "Describe the purpose of this dataset..."
                )}
                rows={3}
                maxLength={300}
                className="bg-background border-border text-foreground rounded-xl"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting || !datasetName.trim()}
              className="w-full bg-primary hover:bg-primary/90 font-bold text-primary-foreground rounded-xl"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common:status.saving", "Saving...")}
                </span>
              ) : (
                t("pages:datasets.create_dataset", "Create Dataset")
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
