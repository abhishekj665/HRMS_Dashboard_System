import {
  Chip,
  Skeleton,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';

export const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getJobStatus = (job) => {
  const isInactive = job?.isActive === false;
  const isExpired = Boolean(job?.expiresAt) && new Date(job.expiresAt) < new Date();
  return { isInactive, isExpired, isClosed: isInactive || isExpired };
};

export const getApplyLabel = (job) => {
  const { isInactive, isExpired } = getJobStatus(job);
  if (isInactive) return 'Post Not Active';
  if (isExpired) return 'Application Closed';
  return 'Apply Now';
};

const isEmpty = (v) => v === undefined || v === null || v === '';

// First non-empty value; supports text or { name } objects.
const firstValue = (...values) => {
  for (const v of values) {
    if (isEmpty(v)) continue;
    if (typeof v === 'object') {
      if (v.name) return v.name;
      continue;
    }
    return v;
  }
  return '';
};

const money = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

const formatRange = (min, max, format = (v) => v) => {
  const hasMin = !isEmpty(min);
  const hasMax = !isEmpty(max);
  if (!hasMin && !hasMax) return '';
  if (!hasMin || !hasMax || min === max) return String(format(hasMin ? min : max));
  return `${format(min)} – ${format(max)}`;
};

const SectionTitle = ({ children }) => (
  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
    {children}
  </Typography>
);

const DetailItem = ({ label, value, error = false }) => (
  <div>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={500}
      color={error ? 'error' : isEmpty(value) ? 'text.disabled' : 'text.primary'}
    >
      {isEmpty(value) ? 'Not specified' : value}
    </Typography>
  </div>
);

export const JobDetailSkeleton = () => (
  <div className="space-y-6">
    <div className="flex gap-2">
      <Skeleton variant="rounded" width={90} height={26} />
      <Skeleton variant="rounded" width={90} height={26} />
    </div>
    <div>
      <Skeleton width="30%" height={28} />
      <Skeleton height={20} />
      <Skeleton height={20} />
      <Skeleton width="80%" height={20} />
    </div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={44} />
      ))}
    </div>
  </div>
);

export default function JobDetailContent({ job }) {
  const { isExpired, isInactive } = getJobStatus(job);
  const requisition = job.requisition || {};
  const stages = [...(job.stages || [])].sort(
    (a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0),
  );

  // Detail API may return fields on the job or inside job.requisition.
  const location = firstValue(requisition.location, job.location, job.jobLocation);
  const employmentType = firstValue(requisition.employmentType, job.employmentType);
  const department = firstValue(
    requisition.department,
    job?.requisition?.department?.name,
    job.departmentName,
  );
  const headCount = firstValue(requisition.headCount, job.headCount, job.openings);

  const experience = formatRange(
    firstValue(requisition.experienceMin, job.experienceMin),
    firstValue(requisition.experienceMax, job.experienceMax),
  );
  const salary = formatRange(
    firstValue(requisition.budgetMin, job.budgetMin),
    firstValue(requisition.budgetMax, job.budgetMax),
    money,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        {department && (
          <Chip size="small" variant="outlined" icon={<ApartmentOutlinedIcon />} label={department} />
        )}
        {location && (
          <Chip size="small" variant="outlined" icon={<PlaceOutlinedIcon />} label={location} />
        )}
        {employmentType && (
          <Chip size="small" variant="outlined" icon={<WorkOutlineIcon />} label={employmentType} />
        )}
        {isInactive && <Chip size="small" color="warning" label="Not active" />}
        {isExpired && <Chip size="small" color="error" label="Applications closed" />}
      </div>

      <section>
        <SectionTitle>About the role</SectionTitle>
        <Typography
          variant="body2"
          color="text.secondary"
          className="whitespace-pre-line leading-7"
        >
          {job.description || 'No description added yet.'}
        </Typography>
      </section>

      <section>
        <SectionTitle>Job details</SectionTitle>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
          <DetailItem label="Experience" value={experience && `${experience} years`} />
          <DetailItem label="Salary" value={salary} />
          <DetailItem label="Openings" value={headCount} />
          <DetailItem label="Employment type" value={employmentType} />
          <DetailItem label="Location" value={location} />
          <DetailItem label="Department" value={department} />
          <DetailItem label="Posted on" value={formatDate(job.createdAt)} />
          <DetailItem
            label="Last date to apply"
            value={formatDate(job.expiresAt)}
            error={isExpired}
          />
        </div>
      </section>

      {stages.length > 0 && (
        <section>
          <SectionTitle>Hiring process</SectionTitle>
          <Stepper activeStep={-1} orientation="vertical">
            {stages.map((stage, i) => (
              <Step key={stage.id || stage._id || i} expanded>
                <StepLabel>{stage.name}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </section>
      )}
    </div>
  );
}