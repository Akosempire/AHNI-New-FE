import ConvertToAdvertisement from "@/features/hr/components/recruitment-requisition/convert-to-advertisement";

interface ConvertToAdvertisementPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ConvertToAdvertisementPage({
  params,
}: ConvertToAdvertisementPageProps) {
  const { id } = await params;
  return <ConvertToAdvertisement requisitionId={id} />;
}
