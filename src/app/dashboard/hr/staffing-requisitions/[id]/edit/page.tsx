"use client";

import { useParams } from "next/navigation";
import EditStaffingRequisitionForm from "@/features/hr/components/staffing-requisition/EditForm";

export default function EditStaffingRequisitionPage() {
  const params = useParams();
  const requisitionId = params.id as string;

  return <EditStaffingRequisitionForm requisitionId={requisitionId} />;
}
