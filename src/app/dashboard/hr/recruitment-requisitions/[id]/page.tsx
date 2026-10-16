import RecruitmentRequisitionDetail from "@/features/hr/components/recruitment-requisition/detail";

interface RecruitmentRequisitionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RecruitmentRequisitionDetailPage({
  params,
}: RecruitmentRequisitionDetailPageProps) {
  const { id } = await params;
  return <RecruitmentRequisitionDetail id={id} />;
}
