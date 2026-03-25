import { Container, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "../../services/JobRecruitmentService/jobsService";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
export default function CareersPage() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);

  const fetchAllJobs = async () => {
    try {
      const response = await getAllJobs();
      if (response.success) {
        setJobs(response.data);
      } else {
        toast.info(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchAllJobs();
  }, []);

  return (
    <div className=" min-h-screen">
      <div className="bg-white border-b">
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 1.5,
              cursor: "pointer",
              width: "fit-content",
            }}
            onClick={() => navigate("/login")}
          >
            <HomeIcon fontSize="small" color="primary" />
            <Typography
              sx={{
                fontWeight: 500,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Home
            </Typography>
          </Box>
        </Container>
      </div>
      {/* HERO */}
      <div className="relative h-112.5 flex items-center">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
          alt="Career"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent" />

        <Container maxWidth="lg" className="relative z-10">
          <Typography variant="h3" className="font-light leading-tight">
            Let’s find you the right job
          </Typography>

          <Typography className="mt-6 text-gray-700 text-lg max-w-xl ">
            Explore opportunities that match your ambition and skills.
          </Typography>

          <Button href="#jobs" variant="contained" sx={{ marginTop: "15px" }}>
            Explore Jobs
          </Button>
        </Container>
      </div>

      {/* INTRO TEXT SECTION */}
      <Container maxWidth="lg" className="py-16">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <Typography variant="h5" className="font-semibold mb-6">
              Build what matters
            </Typography>

            <Typography className="text-gray-700 leading-8">
              Join a team that values innovation, collaboration, and long-term
              growth. We build scalable systems, solve meaningful problems, and
              create technology that impacts millions.
            </Typography>

            <Typography className="text-gray-700 leading-8 mt-4">
              Explore opportunities across engineering, product, design, and
              operations.
            </Typography>
          </div>

          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692"
            alt="Team"
            className="rounded-xl shadow-md"
          />
        </div>
      </Container>

      {/* JOB LIST */}
      <Container maxWidth="lg" className="py-16">
        <div id="jobs" className="space-y-10">
          {jobs.map((job) => (
            <Box
              key={job.id}
              onClick={() => navigate(`/careers/${job.orgSlug}/${job.slug}`)}
              className="cursor-pointer border-b pb-8 hover:border-black transition"
            >
              <div className="flex items-start gap-4">
                <span className="text-blue-600 text-xl mt-1">→</span>

                <div>
                  <Typography className="text-sm text-gray-500 mb-2">
                    {job?.requisition?.location} •{" "}
                    {job?.requisition?.employmentType}
                  </Typography>

                  <Typography
                    variant="h6"
                    className="font-medium hover:underline"
                  >
                    {job.title}
                  </Typography>
                </div>
              </div>
            </Box>
          ))}
        </div>
      </Container>
    </div>
  );
}
