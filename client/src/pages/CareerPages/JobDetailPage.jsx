import { useParams } from "react-router-dom";
import { useState } from "react";

import { Container, Typography, Button, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getJobDetail } from "../../services/JobRecruitmentService/jobsService";
import { useEffect } from "react";

export default function JobDetailPage() {
  const { orgSlug, slug } = useParams();
  const [job, setJob] = useState({});

  const isExpired = job?.expiresAt && new Date(job.expiresAt) < new Date();

  const isInactive = job && job.isActive === false;

  const isApplicationClosed = isExpired || isInactive;

  const navigate = useNavigate();

  const fetchJobDetail = async () => {
    try {
      const response = await getJobDetail(orgSlug, slug);
      if (response.success) {
        setJob(response.data);
      } else {
        toast.info(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleApply = () => {
    try {
      navigate(`/careers/${orgSlug}/${slug}/apply`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchJobDetail();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* BACK BUTTON */}
      <div className="bg-white border-b">
        <Container maxWidth="lg" className="py-6">
          <Typography
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/careers")}
          >
            ← Back to Careers
          </Typography>
        </Container>
      </div>

      {/* TITLE SECTION */}
      <div className="bg-blue-50 py-14 border-b">
        <Container maxWidth="lg">
          <Typography variant="h4" className="font-semibold">
            {job?.title}
          </Typography>

          <Typography className="mt-3 text-gray-600">
            {job?.requisition?.location} • {job?.requisition?.employmentType}
          </Typography>
        </Container>
      </div>

      {/* MAIN CONTENT */}
      <Container maxWidth="lg" className="py-16 grid md:grid-cols-3 gap-16">
        {/* LEFT CONTENT */}
        <div className="md:col-span-2">
          <Typography variant="h6" className="mb-10 font-semibold">
            Introduction
          </Typography>

          <Typography
            className="leading-8 whitespace-pre-line text-gray-700"
            sx={{ marginTop: "10px", marginBottom: "10px" }}
          >
            {job?.description}
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
              <strong>Experience:</strong> {job?.requisition?.experienceMin} -{" "}
              {job?.requisition?.experienceMax} years
            </li>
            <li>
              <strong>Salary:</strong> ₹{job?.requisition?.budgetMin} - ₹
              {job?.requisition?.budgetMax}
            </li>
            <li>
              <strong>Posts:</strong> {job?.requisition?.headCount}
            </li>
          </ul>
        </div>

        {/* RIGHT SIDEBAR */}
        {/* RIGHT SIDEBAR */}
        <div className="space-y-6 md:border-l md:pl-8">
          <div>
            <Typography className="text-gray-500 text-sm">Job Title</Typography>
            <Typography>{job?.title}</Typography>
          </div>

          <Divider />

          <div>
            <Typography className="text-gray-500 text-sm">Job ID</Typography>
            <Typography>{job?.id}</Typography>
          </div>

          <Divider />

          <div>
            <Typography className="text-gray-500 text-sm">Location</Typography>
            <Typography>{job?.requisition?.location}</Typography>
          </div>
          <Divider />

          <div>
            <Typography className="text-gray-500 text-sm">Posted On</Typography>
            <Typography>
              {job?.createdAt
                ? new Date(job.createdAt).toLocaleDateString()
                : "-"}
            </Typography>
          </div>

          <Divider />

          <div>
            <Typography className="text-gray-500 text-sm">
              Last Date to Apply
            </Typography>
            <Typography color={isExpired ? "error" : "inherit"}>
              {job?.expiresAt
                ? new Date(job.expiresAt).toLocaleDateString()
                : "Not Specified"}
            </Typography>
          </div>

          <Divider />

          <div>
            <Typography className="text-gray-500 text-sm">
              Employment Type
            </Typography>
            <Typography>{job?.requisition?.employmentType}</Typography>
          </div>

          <Divider />

          <div>
            <Typography
              className="text-gray-700 text-sm mb-4"
              sx={{ marginTop: "10px" }}
            >
              Hiring Process
            </Typography>

            <div className="mt-8">
              <div className="hidden md:block relative">
                <div className="absolute top-3 left-0 right-0 h-0.5 " />

                <div className="flex justify-between items-start relative">
                  {job?.stages?.map((stage) => (
                    <div
                      key={stage.id}
                      className="flex flex-col items-center text-center w-20"
                    >
                      <div className="w-6 h-6 rounded-full  text-gray-600 flex items-center justify-center text-xs font-bold z-10">
                        {stage.stageOrder}
                      </div>

                      <Typography
                        variant="caption"
                        className="mt-3 text-gray-600 leading-snug"
                      >
                        {stage.name}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:hidden space-y-6">
                {job?.stages?.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="flex items-start gap-4 relative"
                  >
                    {index !== job.stages.length - 1 && (
                      <div className="absolute left-3 top-6 w-0.5 h-full " />
                    )}

                    <div className="w-6 h-6 rounded-full  text-gray-600 flex items-center justify-center text-xs font-bold z-10">
                      {stage.stageOrder}
                    </div>

                    <Typography className="text-gray-700 text-sm">
                      {stage.name}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Divider />

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleApply}
            disabled={isApplicationClosed}
          >
            {isInactive
              ? "Post Not Active"
              : isExpired
                ? "Application Closed"
                : "Apply Now"}
          </Button>
        </div>
      </Container>
    </div>
  );
}
