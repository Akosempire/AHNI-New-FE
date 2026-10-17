"use client";

export const dynamic = "force-dynamic";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Axios from "@/constants/api_management/MyHttpHelper";
import { AxiosError } from "axios";
import BackNavigation from "@/components/BackNavigation";
import Card from "@/components/Card";
import { LoadingSpinner } from "@/components/Loading";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  CalendarDays,
  Mail,
  AlertCircle,
} from "lucide-react";

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
}

// Helper function to safely extract string values
const safeStringValue = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value.name) return value.name;
    if (value.title) return value.title;
    return '';
  }
  return String(value);
};

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

// Email mapping by position category
const getApplicationEmail = (positionType?: string, contract_type?: string): string => {
  const posType = positionType?.toUpperCase() || '';

  if (posType.includes('PROGRAMS')) return 'AHNi-ProgMgtJobs@ahnigeria.org.ng';
  if (posType.includes('TECHNICAL')) return 'AHNi-PCTJobs@ahnigeria.org.ng';
  if (posType.includes('OPERATIONS') || posType.includes('FINANCE')) return 'AHNi-FandAJobs@ahnigeria.org.ng';

  // Default
  return 'careers@ahnigeria.org.ng';
};

export default function ProjectJobsPage() {
  const params = useParams();
  const tag = Array.isArray(params?.tag) ? params.tag[0] : params?.tag;

  const { data, isLoading, error } = useQuery({
    queryKey: ["project-job-advertisements", tag],
    queryFn: async () => {
      try {
        const response = await Axios.get(`hr/jobs/advertisements/by-project/${tag}/`);
        // The response has nested structure: response.data.data.data
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        throw new Error("Sorry: " + (axiosError.response?.data as any)?.message);
      }
    },
    enabled: !!tag,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // The response is: { status: "success", data: { status: true, data: [...] } }
  // So we need to access: data.data.data
  if (error || !data?.data?.data || data.data.data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">No Job Vacancies Found</h2>
            <p className="text-muted-foreground mb-4">
              No published job vacancies found for this project.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const advertisements = data.data.data;

  // Get shared information from the first advertisement
  const firstAd = advertisements[0];
  const orgName = firstAd.organization_name || "Achieving Health Nigeria Initiative (AHNi)";
  const orgBackground = firstAd.organization_background;
  const projectName = firstAd.project_name;
  const projectDuration = firstAd.project_duration;
  const projectLocation = firstAd.project_location;
  const projectObjectives = firstAd.project_objectives;
  const projectScope = firstAd.project_scope;
  const donorName = firstAd.donor_name;
  const applicationDeadline = firstAd.application_deadline;
  const equalOpportunity = firstAd.equal_opportunity_statement || "AHNi is an Equal Opportunity Employer.";
  const disclaimer = firstAd.disclaimer || "AHNi does not charge Candidates a fee for a test or interview";

  // Group positions by email category
  const programsPositions = advertisements.filter(ad => ad.position_type === 'PROGRAMS');
  const technicalPositions = advertisements.filter(ad => ad.position_type === 'TECHNICAL');
  const operationsPositions = advertisements.filter(ad => ad.position_type === 'OPERATIONS' || ad.position_type === 'FINANCE');

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
        <h2 className="font-bold text-2xl text-blue-900">JOB VACANCIES</h2>

        {/* Organization Background */}
        <Card className="p-6">
          <h3 className="font-bold text-xl text-blue-900 mb-4">{orgName}</h3>
          {orgBackground && (
            <p className="text-sm whitespace-pre-line">{orgBackground}</p>
          )}
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

        {/* Positions Summary Table */}
        <Card className="p-6">
          <p className="font-semibold mb-4">We are seeking qualified candidates for the following positions:</p>

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
                {advertisements.map((ad, index) => (
                  <tr key={ad.id} className="border-b border-gray-200">
                    <td className="p-2">{getPositionName(ad)}</td>
                    <td className="p-2">{ad.contract_type?.replace('_', ' ') || 'Fixed Term'}</td>
                    <td className="p-2">{ad.position_type || 'N/A'}</td>
                    <td className="p-2">{ad.position_category || ''}</td>
                    <td className="p-2">{ad.project_tag || ''}</td>
                    <td className="p-2">{ad.number_of_positions || 1}</td>
                    <td className="p-2">{getLocationName(ad)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Individual Position Details */}
        {advertisements.map((ad, index) => (
          <Card key={ad.id} className="p-6">
            <h3 className="font-bold text-lg text-blue-900 mb-4 uppercase">{getPositionName(ad)}</h3>

            {/* Role Description */}
            {ad.role_description && (
              <div className="mb-6">
                <p className="text-sm whitespace-pre-line">{ad.role_description}</p>
              </div>
            )}

            {/* Requirements */}
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-900">Minimum Recruitment Requirements:</h4>

              <ul className="list-disc pl-6 space-y-2 text-sm">
                {ad.education_requirements && (
                  <li>{ad.education_requirements}</li>
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
        ))}

        {/* Application Instructions */}
        <Card className="p-6 bg-blue-50">
          <h3 className="font-bold text-lg text-blue-900 mb-4">Method of application:</h3>

          <p className="text-sm mb-4">
            Interested and qualified Candidates should forward a suitability statement (application) and resume (CV) as a single MS Word document to:
          </p>

          <div className="space-y-2 text-sm mb-4">
            {programsPositions.length > 0 && (
              <div>
                <p className="font-semibold">
                  {programsPositions.map(ad => getPositionName(ad)).join(', ')}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:AHNi-ProgMgtJobs@ahnigeria.org.ng" className="text-blue-600 hover:underline">
                    AHNi-ProgMgtJobs@ahnigeria.org.ng
                  </a>
                </p>
              </div>
            )}

            {technicalPositions.length > 0 && (
              <div>
                <p className="font-semibold">
                  {technicalPositions.map(ad => getPositionName(ad)).join(', ')}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:AHNi-PCTJobs@ahnigeria.org.ng" className="text-blue-600 hover:underline">
                    AHNi-PCTJobs@ahnigeria.org.ng
                  </a>
                </p>
              </div>
            )}

            {operationsPositions.length > 0 && (
              <div>
                <p className="font-semibold">
                  {operationsPositions.map(ad => getPositionName(ad)).join(', ')}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:AHNi-FandAJobs@ahnigeria.org.ng" className="text-blue-600 hover:underline">
                    AHNi-FandAJobs@ahnigeria.org.ng
                  </a>
                </p>
              </div>
            )}
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
            Only applications sent electronically (i.e., by e-mail) with the <strong>JOB TITLE and LOCATION</strong> clearly indicated as the subject of the mail will be considered and only short-listed candidates will be contacted.
          </p>
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
