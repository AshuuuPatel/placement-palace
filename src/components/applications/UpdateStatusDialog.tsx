import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Settings2 } from "lucide-react";

type ApplicationStatus = "pending" | "reviewing" | "shortlisted" | "interview" | "offered" | "rejected" | "withdrawn";

const statusOptions: { value: ApplicationStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "offered", label: "Offered" },
  { value: "rejected", label: "Rejected" },
];

interface UpdateStatusDialogProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  candidateName: string;
  onSuccess: () => void;
}

export function UpdateStatusDialog({ 
  applicationId, 
  currentStatus, 
  candidateName,
  onSuccess 
}: UpdateStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (status === currentStatus) {
      setOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) throw error;

      toast.success(`Application status updated to ${status}`);
      onSuccess();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="w-4 h-4 mr-1" />
          Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogDescription>
            Change the status for {candidateName}'s application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
