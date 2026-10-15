import ConvertToAdvertisement from "@/features/hr/components/recruitment-requisition/convert-to-advertisement";

interface ConvertToAdvertisementPageProps {
  params: {
    id: string;
  };
}

export default function ConvertToAdvertisementPage({
  params,
}: ConvertToAdvertisementPageProps) {
  return <ConvertToAdvertisement requisitionId={params.id} />;
}
