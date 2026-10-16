"use client";

import { use } from "react";
import StaffingRequisitionDetailView from "@/features/hr/components/staffing-requisition/DetailView";

export default function StaffingRequisitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <StaffingRequisitionDetailView requisitionId={id} />;
}
