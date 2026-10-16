import EditRecruitmentRequisitionForm from "@/features/hr/components/recruitment-requisition/edit-form";

interface EditRecruitmentRequisitionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRecruitmentRequisitionPage({
  params,
}: EditRecruitmentRequisitionPageProps) {
  const { id } = await params;
  return <EditRecruitmentRequisitionForm requisitionId={id} />;
}
