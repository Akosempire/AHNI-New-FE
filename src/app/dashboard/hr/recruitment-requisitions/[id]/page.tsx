import RecruitmentRequisitionDetail from "@/features/hr/components/recruitment-requisition/detail";

interface RecruitmentRequisitionDetailPageProps {
  params: {
    id: string;
  };
}

export default function RecruitmentRequisitionDetailPage({
  params,
}: RecruitmentRequisitionDetailPageProps) {
  return <RecruitmentRequisitionDetail requisitionId={params.id} />;
}
