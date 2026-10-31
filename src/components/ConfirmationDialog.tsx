import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description?: string;
  loading?: boolean;
  onCancel: () => void;
  onOk: () => void;
  /** Label for the confirm button, e.g. "Delete" */
  confirmLabel?: string;
  /** Red confirm button. Detected from the title when not set. */
  destructive?: boolean;
  /** Shown in a grey box, e.g. "2 selected requests will be deleted." */
  note?: string;
}

const DANGER = /\b(delete|remove|reject|decline|cancel|deactivate|terminate|suspend|freeze|revoke|discard|archive)\b/i;

export default function ConfirmationDialog({
  open,
  title,
  description,
  loading,
  onCancel,
  onOk,
  confirmLabel,
  destructive,
  note,
}: ConfirmationDialogProps) {
  const danger = destructive ?? DANGER.test(title);
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {note && <p className="rounded-[6px] bg-[var(--surface-2,#f3f2f7)] px-3 py-2.5 text-sm">{note}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onOk}
            disabled={loading}
            className={danger ? "bg-[var(--danger,#c62828)] text-white hover:bg-[var(--danger,#c62828)]/90" : undefined}
          >
            {loading ? "Working…" : confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}