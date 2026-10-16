import AddSquareIcon from "@/components/icons/AddSquareIcon";
import PdfContent from "@/components/PdfContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HrRoutes } from "@/constants/RouterConstants";
import { JobAdvertisement } from "@/features/hr/types/job-advertisement";
import {
  Briefcase,
  CalendarDays,
  Clock,
  MapPin,
  PersonStanding,
  Users,
  Calendar,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";


const JobDetail = (props: JobAdvertisement) => {

  // Helper function to safely extract string values from potentially object fields
  const safeStringValue = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if (value.name) return value.name;
      if (value.title) return value.title;
      if (value.description) return value.description;
      return '';
    }
    return String(value);
  };

  const {
    job_type,
    advert_document,
    background,
    duration,
    locations,
    number_of_positions,
    supervisor,
    title,
    created_datetime,
    commencement_date,
    any_other_info,
  } = props || {};


  // Get the actual job title/position - safely handle object values
  const getJobTitle = () => {
    const position = (props as any).position;

    // If position is an object, try to get name or title from it
    if (position && typeof position === 'object') {
      return position.name || position.title || "Job Position Not Set";
    }

    // If position is a string, use it
    if (typeof position === 'string') {
      return position;
    }

    // Fallback to title if available
    if (title && !title.includes('-')) {
      return title;
    }

    return "Job Position Not Set";
  };

  const jobTitle = getJobTitle();
  const router = useRouter();

  const pdf = {
    name: "document",
    document: advert_document!,
  };

  // Handle edit button click - navigate to edit page with the advertisement ID
  const handleEditClick = () => {
    const advertisementId = (props as any).id;
    if (advertisementId) {
      // Navigate to edit page with the advertisement ID as a query parameter
      router.push(`${HrRoutes.ADVERTISEMENT_ADD}?edit=${advertisementId}`);
    } else {
      console.error("No advertisement ID found for editing");
    }
  };

  // Extract additional fields from props
  const organization_name = (props as any).organization_name || "Achieving Health Nigeria Initiative (AHNi)";
  const organization_background = (props as any).organization_background;
  const project_name = (props as any).project_name;
  const project_duration = (props as any).project_duration;
  const project_location = (props as any).project_location;
  const project_objectives = (props as any).project_objectives;
  const donor_name = (props as any).donor_name;
  const role_description = (props as any).role_description;
  const education_requirements = (props as any).education_requirements;
  const experience_requirements = (props as any).experience_requirements;
  const experience_years_min = (props as any).experience_years_min;
  const technical_skills = (props as any).technical_skills;
  const soft_skills = (props as any).soft_skills;
  const location_context_requirement = (props as any).location_context_requirement;
  const application_deadline = (props as any).application_deadline;
  const application_email = (props as any).application_email;
  const application_method = (props as any).application_method;
  const application_instructions = (props as any).application_instructions;
  const subject_line_format = (props as any).subject_line_format;
  const equal_opportunity_statement = (props as any).equal_opportunity_statement;
  const disclaimer = (props as any).disclaimer;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='font-bold text-2xl text-blue-900'>JOB VACANCIES</h2>
        <div className='ml-auto'>
          <Button
            className='flex gap-2 py-6'
            type='button'
            onClick={handleEditClick}
          >
            <AddSquareIcon />
            <p>Edit Advert</p>
          </Button>
        </div>
      </div>

      {/* Organization Information */}
      <Card className='p-6'>
        <h3 className='font-bold text-xl text-blue-900 mb-4'>{organization_name}</h3>
        {organization_background && (
          <div>
            <h4 className='font-semibold mb-2'>Organization Background</h4>
            <p className='text-sm whitespace-pre-line'>{organization_background}</p>
          </div>
        )}
      </Card>

      {/* Project Information (if applicable) */}
      {project_name && (
        <Card className='p-6'>
          <h3 className='font-bold text-lg text-blue-900 mb-4'>{project_name}</h3>
          <div className='space-y-3'>
            {donor_name && (
              <div>
                <span className='font-semibold'>Donor/Funder: </span>
                <span className='text-sm'>{donor_name}</span>
              </div>
            )}
            {project_duration && (
              <div>
                <span className='font-semibold'>Project Duration: </span>
                <span className='text-sm'>{project_duration}</span>
              </div>
            )}
            {project_location && (
              <div>
                <span className='font-semibold'>Project Location: </span>
                <span className='text-sm'>{project_location}</span>
              </div>
            )}
            {project_objectives && (
              <div>
                <h4 className='font-semibold mb-2'>Project Objectives</h4>
                <p className='text-sm whitespace-pre-line'>{project_objectives}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Position Details */}
      <Card className='p-6'>
        <h3 className='font-bold text-xl text-blue-900 mb-4'>{jobTitle}</h3>

        <div className='flex flex-wrap gap-2 mb-6'>
          <Badge variant='md'>
            <Users size={15} />({number_of_positions || '1'} {number_of_positions === 1 ? 'position' : 'positions'})
          </Badge>
          <Badge variant='md'>
            <Clock size={15} /> {duration || 'N/A'}
          </Badge>
          {commencement_date && (
            <Badge variant='md'>
              <Calendar size={15} /> Starts: {format(new Date(commencement_date), "dd MMM yyyy")}
            </Badge>
          )}
          <Badge variant='md'>
            <MapPin size={15} /> {safeStringValue(locations) || 'Location to be determined'}
          </Badge>
          <Badge variant='md'>
            <Briefcase size={15} /> {safeStringValue(job_type)}
          </Badge>
          {supervisor && (
            <Badge variant='md'>
              <PersonStanding size={15} /> Reports to: {safeStringValue(supervisor)}
            </Badge>
          )}
        </div>

        {background && (
          <div className='mb-6'>
            <h4 className='font-semibold mb-2 text-blue-900'>Background</h4>
            <p className='text-sm whitespace-pre-line'>{background}</p>
          </div>
        )}

        {role_description && (
          <div className='mb-6'>
            <h4 className='font-semibold mb-2 text-blue-900'>Key Responsibilities</h4>
            <p className='text-sm whitespace-pre-line'>{role_description}</p>
          </div>
        )}

        {/* Qualifications and Requirements */}
        <div className='space-y-4'>
          <h4 className='font-semibold text-lg text-blue-900'>Qualifications and Requirements</h4>

          {education_requirements && (
            <div>
              <h5 className='font-semibold mb-2'>Education</h5>
              <p className='text-sm whitespace-pre-line'>{education_requirements}</p>
            </div>
          )}

          {(experience_requirements || experience_years_min > 0) && (
            <div>
              <h5 className='font-semibold mb-2'>Experience</h5>
              {experience_years_min > 0 && (
                <p className='text-sm mb-2'>Minimum {experience_years_min} years of relevant experience</p>
              )}
              {experience_requirements && (
                <p className='text-sm whitespace-pre-line'>{experience_requirements}</p>
              )}
            </div>
          )}

          {technical_skills && (
            <div>
              <h5 className='font-semibold mb-2'>Technical Skills</h5>
              <p className='text-sm whitespace-pre-line'>{technical_skills}</p>
            </div>
          )}

          {soft_skills && (
            <div>
              <h5 className='font-semibold mb-2'>Soft Skills</h5>
              <p className='text-sm whitespace-pre-line'>{soft_skills}</p>
            </div>
          )}

          {location_context_requirement && (
            <div>
              <h5 className='font-semibold mb-2'>Location/Context Knowledge</h5>
              <p className='text-sm whitespace-pre-line'>{location_context_requirement}</p>
            </div>
          )}
        </div>

        {any_other_info && (
          <div className='mt-6'>
            <h4 className='font-semibold mb-2 text-blue-900'>Additional Information</h4>
            <p className='text-sm whitespace-pre-line'>{any_other_info}</p>
          </div>
        )}
      </Card>

      {/* Application Information */}
      <Card className='p-6 bg-blue-50'>
        <h3 className='font-bold text-lg text-blue-900 mb-4'>How to Apply</h3>

        <div className='space-y-3'>
          {application_deadline && (
            <div className='flex items-center gap-2'>
              <CalendarDays className='text-blue-900' size={18} />
              <div>
                <span className='font-semibold'>Application Deadline: </span>
                <span className='text-red-600 font-semibold'>
                  {format(new Date(application_deadline), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
            </div>
          )}

          {application_email && (
            <div className='flex items-center gap-2'>
              <Mail className='text-blue-900' size={18} />
              <div>
                <span className='font-semibold'>Submit to: </span>
                <a href={`mailto:${application_email}`} className='text-blue-600 hover:underline'>
                  {application_email}
                </a>
              </div>
            </div>
          )}

          {application_method && (
            <div>
              <span className='font-semibold'>Application Method: </span>
              <span className='text-sm'>{application_method}</span>
            </div>
          )}

          {application_instructions && (
            <div>
              <h4 className='font-semibold mb-2'>Application Instructions</h4>
              <p className='text-sm whitespace-pre-line'>{application_instructions}</p>
            </div>
          )}

          {subject_line_format && (
            <div>
              <h4 className='font-semibold mb-2'>Subject Line Format</h4>
              <p className='text-sm whitespace-pre-line'>{subject_line_format}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Footer Statements */}
      <Card className='p-6'>
        {equal_opportunity_statement && (
          <p className='text-sm font-semibold text-blue-900 mb-3'>{equal_opportunity_statement}</p>
        )}
        {disclaimer && (
          <p className='text-sm text-gray-700 italic'>{disclaimer}</p>
        )}
      </Card>

      {/* PDF Document */}
      {advert_document && (
        <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
          <PdfContent pdf={pdf} />
        </div>
      )}
    </div>
  );
};

export default JobDetail;
