import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Container,
  Divider,
  Skeleton,
  Typography,
} from "@mui/material";

import { getJobDetail } from "../../services/JobRecruitmentService/jobsService";
import {
  JobDetailSkeleton,
  getApplyLabel,
  getJobStatus,
} from "../InternalJobPostPage/JobDetailContent";

// Small downward triangle used as the arrow between hiring steps
const ARROW_STYLE = {
  width: 0,
  height: 0,
  borderLeft: "4px solid transparent",
  borderRight: "4px solid transparent",
  borderTop: "6px solid #d1d5db",
};

// One label + value block used in the sidebar
const SidebarItem = ({ label, children }) => (
  <div>
    <Typography className="text-gray-500 text-sm">{label}</Typography>
    <Typography component="div">{children}</Typography>
  </div>
);

export default function JobDetailPage() {
  const { orgSlug, slug } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getJobDetail(orgSlug, slug);
      if (response.success) {
        setJob(response.data);
      } else {
        setError(response.message || "This job could not be found.");
      }
    } catch (err) {
      setError(err?.message || "Unable to load this job.");
    } finally {
      setLoading(false);
    }
  }, [orgSlug, slug]);

  useEffect(() => {
    fetchJobDetail();
  }, [fetchJobDetail]);

  const { isExpired, isClosed } = getJobStatus(job);
  const stages = [...(job?.stages || [])].sort(
    (a, b) => a.stageOrder - b.stageOrder,
  );

  const handleApply = () => navigate(`/careers/${orgSlug}/${slug}/apply`);

  return (
    <div className="bg-white min-h-screen">
      {/* BACK BUTTON */}
      <div className="bg-white border-b">
        <Container maxWidth="lg" className="py-4 md:py-6">
          <Typography
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/careers")}
          >
            ← Back to Careers
          </Typography>
        </Container>
      </div>

      {/* TITLE SECTION */}
      <div className="bg-blue-50 py-8 md:py-14 border-b">
        <Container maxWidth="lg">
          {loading ? (
            <Skeleton width="60%" height={48} />
          ) : (
            <>
              <Typography
                variant="h4"
                className="font-semibold break-words"
                sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}
              >
                {job?.title}
              </Typography>

              <Typography className="mt-3 text-gray-600">
                {job?.requisition?.location} •{" "}
                {job?.requisition?.employmentType}
              </Typography>
            </>
          )}
        </Container>
      </div>

      {/* MAIN CONTENT */}
      <Container
        maxWidth="lg"
        className="py-8 md:py-16 grid md:grid-cols-3 gap-10 md:gap-16"
      >
        {/* ERROR / LOADING */}
        {error && (
          <div className="md:col-span-3">
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={fetchJobDetail}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </div>
        )}

        {loading && (
          <div className="md:col-span-3">
            <JobDetailSkeleton />
          </div>
        )}

        {job && !loading && (
          <>
            {/* LEFT CONTENT */}
            <div className="md:col-span-2">
              <Typography variant="h6" className="mb-10 font-semibold">
                Introduction
              </Typography>

              <Typography
                className="leading-8 whitespace-pre-line text-gray-700"
                sx={{ marginTop: "10px", marginBottom: "10px" }}
              >
                {job.description}
              </Typography>

              <Divider className="my-10" />

              <Typography
                variant="h6"
                className="mb-6 font-semibold"
                sx={{ marginTop: "10px" }}
              >
                Job Details
              </Typography>

              <ul className="space-y-3 text-gray-700">
                <li>
                  <strong>Experience:</strong> {job.requisition?.experienceMin}{" "}
                  - {job.requisition?.experienceMax} years
                </li>
                <li>
                  <strong>Salary:</strong> ₹{job.requisition?.budgetMin} - ₹
                  {job.requisition?.budgetMax}
                </li>
                <li>
                  <strong>Posts:</strong> {job.requisition?.headCount}
                </li>
              </ul>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-6 md:border-l md:pl-8">
              <SidebarItem label="Job Title">{job.title}</SidebarItem>

              <Divider />

              <SidebarItem label="Job ID">
                <span className="break-all">{job.id}</span>
              </SidebarItem>

              <Divider />

              <SidebarItem label="Location">
                {job.requisition?.location}
              </SidebarItem>

              <Divider />

              <SidebarItem label="Posted On">
                {job.createdAt
                  ? new Date(job.createdAt).toLocaleDateString()
                  : "-"}
              </SidebarItem>

              <Divider />

              <div>
                <Typography className="text-gray-500 text-sm">
                  Last Date to Apply
                </Typography>
                <Typography color={isExpired ? "error" : "inherit"}>
                  {job.expiresAt
                    ? new Date(job.expiresAt).toLocaleDateString()
                    : "Not Specified"}
                </Typography>
              </div>

              <Divider />

              <SidebarItem label="Employment Type">
                {job.requisition?.employmentType}
              </SidebarItem>

              <Divider />

              {/* HIRING PROCESS */}
              {stages.length > 0 && (
                <>
                  <div>
                    <Typography
                      className="text-gray-700 text-sm mb-4"
                      sx={{ marginTop: "10px" }}
                    >
                      Hiring Process
                    </Typography>

                    {/* Steps top to bottom, joined by a line with an arrow.
                        The same flow works on every screen size. */}
                    <ol className="mt-6">
                      {stages.map((stage, index) => {
                        const isLast = index === stages.length - 1;
                        return (
                          <li
                            key={stage.id}
                            className={`relative flex items-start gap-4 ${
                              isLast ? "" : "pb-7"
                            }`}
                          >
                            {!isLast && (
                              <>
                                {/* connecting line */}
                                <span
                                  aria-hidden
                                  className="absolute left-3 w-0.5 -translate-x-1/2 bg-gray-300"
                                  style={{ top: 28, bottom: 8 }}
                                />
                                {/* arrow head showing the direction */}
                                <span
                                  aria-hidden
                                  className="absolute left-3 -translate-x-1/2"
                                  style={{ ...ARROW_STYLE, bottom: 2 }}
                                />
                              </>
                            )}

                            <span className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-600 bg-white text-xs font-bold text-blue-600">
                              {stage.stageOrder}
                            </span>

                            <Typography className="text-gray-700 text-sm leading-6">
                              {stage.name}
                            </Typography>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  <Divider />
                </>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleApply}
                disabled={isClosed}
              >
                {getApplyLabel(job)}
              </Button>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}