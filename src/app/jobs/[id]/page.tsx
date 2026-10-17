"use client";

export const dynamic = "force-dynamic";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Axios from "@/constants/api_management/MyHttpHelper";
import { AxiosError } from "axios";
import BackNavigation from "@/components/BackNavigation";
import Card from "@/components/Card";
import { LoadingSpinner } from "@/components/Loading";
import { format } from "date-fns";
import {
  CalendarDays,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobAdvertisement {
  id: string;
  title?: string;
  position?: { name: string; id: string } | string;
  contract_type?: string;
  position_type?: string;
  position_category?: string;
  project_tag?: string;
  number_of_positions?: number;
  locations?: Array<{ name: string }> | string;
  role_description?: string;
  education_requirements?: string;
  professional_certifications?: string;
  experience_years_min?: number;
  experience_requirements?: string;
  donor_experience?: string;
  technical_skills?: string;
  soft_skills?: string;
  location_context_requirement?: string;
  organization_name?: string;
  organization_background?: string;
  project_name?: string;
  project_duration?: string;
  project_location?: string;
  project_objectives?: string;
  project_scope?: string;
  donor_name?: string;
  application_deadline?: string;
  application_email?: string;
  application_method?: string;
  application_instructions?: string;
  subject_line_format?: string;
  equal_opportunity_statement?: string;
  disclaimer?: string;
  shortlist_notification?: string;
  background?: string;
  is_published?: boolean;
  status?: string;
}

// Helper function to get position name
const getPositionName = (ad: JobAdvertisement): string => {
  if (ad.title) return ad.title;
  if (ad.position) {
    if (typeof ad.position === 'object' && ad.position.name) {
      return ad.position.name;
    }
    if (typeof ad.position === 'string') return ad.position;
  }
  return "Position Not Set";
};

// Helper function to get location name
const getLocationName = (ad: JobAdvertisement): string => {
  if (ad.locations) {
    if (Array.isArray(ad.locations) && ad.locations.length > 0) {
      return ad.locations.map(loc => loc.name || 'Unknown').join(', ');
    }
    if (typeof ad.locations === 'string') return ad.locations;
  }
  return "Not specified";
};

export default function JobAdvertisementPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["job-advertisement-public", id],
    queryFn: async () => {
      try {
        const response = await Axios.get(`hr/jobs/advertisements/public/${id}/`);
        // The response has nested structure: response.data.data.data
        // response.data = { status: "success", message: "...", data: { status: true, message: "...", data: {...} } }
        console.log("API Response:", response.data);
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error("API Error:", error);
        throw new Error("Sorry: " + (axiosError.response?.data as any)?.message);
      }
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  console.log("Query data:", data);
  console.log("Query error:", error);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // The response is: { status: "success", data: { status: true, data: {...} } }
  // So we need to access: data.data.data
  if (error || !data?.data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">Job Advertisement Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The job position you're looking for could not be found or may have expired.
            </p>
            <Button onClick={() => router.push('/opportunities')}>
              View All Opportunities
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const ad = data.data.data;

  // Default values
  const orgName = ad.organization_name || "Achieving Health Nigeria Initiative (AHNi)";
  const orgBackground = ad.organization_background || "Achieving Health Nigeria Initiative (AHNi) is an indigenous non-governmental organization that promotes socio-economic development by supporting a broad range of global health interventions, education, and economic initiatives in Nigeria. AHNi is an organization with robust interest in advancing the collective goals of the people and communities served. AHNi currently has its headquarters in Abuja, Nigeria.";
  const projectName = ad.project_name;
  const projectDuration = ad.project_duration;
  const projectLocation = ad.project_location;
  const projectObjectives = ad.project_objectives;
  const projectScope = ad.project_scope;
  const applicationDeadline = ad.application_deadline;
  const applicationEmail = ad.application_email || "careers@ahnigeria.org.ng";
  const equalOpportunity = ad.equal_opportunity_statement || "AHNi is an Equal Opportunity Employer.";
  const disclaimer = ad.disclaimer || "AHNi does not charge Candidates a fee for a test or interview";

  return (
    <div className="min-h-screen">
      {/* Header with Back Navigation */}
      <section className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-5'>
          <BackNavigation />
        </div>
      </section>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Title */}
        <h2 className="font-bold text-2xl text-blue-900">JOB VACANCY</h2>

        {/* Organization Background */}
        <Card className="p-6">
          <h3 className="font-bold text-xl text-blue-900 mb-4">{orgName}</h3>
          <p className="text-sm whitespace-pre-line">{orgBackground}</p>
        </Card>

        {/* Project Information */}
        {projectName && (
          <Card className="p-6">
            <div className="space-y-3">
              <p className="text-sm">
                {orgName} is proposing to implement a {projectDuration} {projectName}
                {projectLocation && ` in ${projectLocation}`}.
                {projectObjectives && ` ${projectObjectives}`}
              </p>

              {projectScope && (
                <p className="text-sm whitespace-pre-line mt-3">{projectScope}</p>
              )}
            </div>
          </Card>
        )}

        {/* Position Summary Table */}
        <Card className="p-6">
          <p className="font-semibold mb-4">We are seeking qualified candidates for the following position:</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-2 font-semibold">POSITION</th>
                  <th className="text-left p-2 font-semibold">CONTRACT</th>
                  <th className="text-left p-2 font-semibold">TYPE</th>
                  <th className="text-left p-2 font-semibold">CATEGORY</th>
                  <th className="text-left p-2 font-semibold">PROJECT</th>
                  <th className="text-left p-2 font-semibold">NO.</th>
                  <th className="text-left p-2 font-semibold">LOCATION(S)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-2">{getPositionName(ad)}</td>
                  <td className="p-2">{ad.contract_type?.replace('_', ' ') || 'Fixed Term'}</td>
                  <td className="p-2">{ad.position_type || 'N/A'}</td>
                  <td className="p-2">{ad.position_category || ''}</td>
                  <td className="p-2">{ad.project_tag || ''}</td>
                  <td className="p-2">{ad.number_of_positions || 1}</td>
                  <td className="p-2">{getLocationName(ad)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Position Details */}
        <Card className="p-6">
          <h3 className="font-bold text-lg text-blue-900 mb-4 uppercase">{getPositionName(ad)}</h3>

          {/* Role Description */}
          {(ad.role_description || ad.background) && (
            <div className="mb-6">
              <p className="text-sm whitespace-pre-line">{ad.role_description || ad.background}</p>
            </div>
          )}

          {/* Requirements */}
          <div className="space-y-4">
            <h4 className="font-semibold text-blue-900">Minimum Recruitment Requirements:</h4>

            <ul className="list-disc pl-6 space-y-2 text-sm">
              {ad.education_requirements && (
                <li>{ad.education_requirements}</li>
              )}

              {ad.professional_certifications && (
                <li>{ad.professional_certifications}</li>
              )}

              {ad.experience_years_min && ad.experience_years_min > 0 && (
                <li>Minimum of {ad.experience_years_min} years relevant experience{ad.experience_requirements && ` ${ad.experience_requirements}`}</li>
              )}

              {ad.donor_experience && (
                <li>Demonstrated experience working on {ad.donor_experience}.</li>
              )}

              {ad.technical_skills && (
                <li>{ad.technical_skills}</li>
              )}

              {ad.soft_skills && (
                <li>{ad.soft_skills}</li>
              )}

              {ad.location_context_requirement && (
                <li>{ad.location_context_requirement}</li>
              )}
            </ul>
          </div>
        </Card>

        {/* Application Instructions */}
        <Card className="p-6 bg-blue-50">
          <h3 className="font-bold text-lg text-blue-900 mb-4">Method of application:</h3>

          <p className="text-sm mb-4">
            {ad.application_instructions || "Interested and qualified Candidates should forward a suitability statement (application) and resume (CV) as a single MS Word document to:"}
          </p>

          <div className="mb-4">
            <p className="font-semibold">{getPositionName(ad)}</p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${applicationEmail}`} className="text-blue-600 hover:underline">
                {applicationEmail}
              </a>
            </p>
          </div>

          {applicationDeadline ? (
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="text-blue-900" size={18} />
              <div>
                <span className="font-semibold">Vacancy closes: </span>
                <span className="text-red-600 font-semibold">
                  {format(new Date(applicationDeadline), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
            </div>
          ) : (
            <p className="font-semibold mb-3">
              Vacancy closes: Applications will be received and reviewed on a rolling basis
            </p>
          )}

          <p className="text-sm">
            {ad.subject_line_format || "Only applications sent electronically (i.e., by e-mail) with the JOB TITLE and LOCATION clearly indicated as the subject of the mail will be considered and only short-listed candidates will be contacted."}
          </p>

          {ad.shortlist_notification && (
            <p className="text-sm mt-2 italic">
              {ad.shortlist_notification}
            </p>
          )}
        </Card>

        {/* Footer Statements */}
        <Card className="p-6">
          <p className="text-sm font-semibold text-blue-900 mb-3">{equalOpportunity}</p>
          <p className="text-sm text-gray-700 italic">Disclaimer: {disclaimer}</p>
        </Card>
      </div>
    </div>
  );
}
