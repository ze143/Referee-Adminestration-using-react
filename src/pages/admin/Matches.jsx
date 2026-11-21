import { useState, lazy, Suspense } from "react";
import { Plus, Users } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  useMatches,
  useDeleteMatch,
  useToggleNotify,
} from "@/hooks/useMatches";
import MatchFilters from "@/components/features/matches/MatchFilters";
import MatchTable from "@/components/features/matches/MatchTable";

// Lazy modals
const MatchFormModal = lazy(
  () => import("@/components/features/matches/MatchFormModal"),
);
const MatchEditModal = lazy(
  () => import("@/components/features/matches/MatchEditModal"),
);
const AssignmentModal = lazy(
  () => import("@/components/features/matches/AssignmentModal"),
);
const MatchDetailsModal = lazy(
  () => import("@/components/features/matches/MatchDetailsModal"),
);
const ExcuseModal = lazy(
  () => import("@/components/features/matches/ExcuseModal"),
);

const PAGE_SIZE = 20;

export default function Matches() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    competition_id: "",
    stage_id: "",
    date: "",
    status: "",
    notified: "",
  });

  const { data, isLoading } = useMatches({
    page,
    pageSize: PAGE_SIZE,
    filters,
  });
  const matches = data?.data || [];
  const total = data?.total || 0;

  const deleteMutation = useDeleteMatch();
  const toggleNotify = useToggleNotify();

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editMatch, setEditMatch] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignMatches, setAssignMatches] = useState([]);
  const [detailsId, setDetailsId] = useState(null);
  const [excuseMatch, setExcuseMatch] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  // ============ Handlers ============
  const handleAssignOne = (match) => {
    setAssignMatches([match]);
    setAssignOpen(true);
  };

  const handleAssignAll = () => {
    setAssignMatches(matches);
    setAssignOpen(true);
  };

  const handleToggleNotify = (matchId, role, currentValue) => {
    toggleNotify.mutate({ matchId, role, currentValue });
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="المباريات والتعيينات"
        subtitle={`${total} مباراة`}
        actions={
          <div className="flex gap-2">
            {matches.length > 0 && (
              <Button
                variant="secondary"
                icon={Users}
                onClick={handleAssignAll}
              >
                تعيين الصفحة ({matches.length})
              </Button>
            )}
            <Button icon={Plus} onClick={() => setFormOpen(true)}>
              إضافة مباريات
            </Button>
          </div>
        }
      />

      <MatchFilters
        filters={filters}
        onChange={updateFilters}
        onReset={() => {
          setFilters({
            competition_id: "",
            stage_id: "",
            date: "",
            status: "upcoming",
            notified: "",
          });
          setPage(0);
        }}
      />

      <div className="glass-card overflow-hidden">
        <MatchTable
          matches={matches}
          loading={isLoading}
          onView={(m) => setDetailsId(m.id)}
          onEdit={(m) => setEditMatch(m)}
          onAssign={handleAssignOne}
          onExcuse={(m) => setExcuseMatch(m)}
          onDelete={(m) => setDeleteTarget(m)}
          onToggleNotify={handleToggleNotify}
        />
        <Pagination
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>

      {/* Modals */}
      <Suspense fallback={<Spinner />}>
        {formOpen && (
          <MatchFormModal
            open
            onClose={() => setFormOpen(false)}
            onSuccess={() => setFormOpen(false)}
          />
        )}

        {editMatch && (
          <MatchEditModal
            key={editMatch.id}
            open
            match={editMatch}
            onClose={() => setEditMatch(null)}
          />
        )}

        {assignOpen && (
          <AssignmentModal
            open
            matches={assignMatches}
            onClose={() => setAssignOpen(false)}
            onSuccess={() => {
              setAssignOpen(false);
              setAssignMatches([]);
            }}
          />
        )}

        {detailsId && (
          <MatchDetailsModal
            open
            matchId={detailsId}
            onClose={() => setDetailsId(null)}
          />
        )}

        {excuseMatch && (
          <ExcuseModal
            open
            match={excuseMatch}
            onClose={() => setExcuseMatch(null)}
          />
        )}

        {deleteTarget && (
          <ConfirmDialog
            open
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            title="حذف المباراة"
            message={`هل أنت متأكد من حذف مباراة ${deleteTarget.home_team?.name} × ${deleteTarget.away_team?.name}؟`}
            confirmText="نعم، احذف"
            loading={deleteMutation.isPending}
          />
        )}
      </Suspense>
    </div>
  );
}
