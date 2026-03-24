import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

const initialFormData = {
  email: "",
  organizationName: "",
  modelSelectionType: "",
  industryType: "",
  allowedUsers: "",
  admin_first_name: "",
  admin_last_name: "",
  adminPhone: "",
  GST: "",
  PAN: "",
  country: "",
  state: "",
  city: "",
  address: "",
  postal_code: "",
  website: "",
  termsAccepted: false,
  gstFileInput: null,
  panFileInput: null,
  logoInput: null,
};

const stepFields = [
  [
    "email",
    "organizationName",
    "modelSelectionType",
    "industryType",
    "allowedUsers",
  ],
  [
    "admin_first_name",
    "admin_last_name",
    "adminPhone",
    "PAN",
    "country",
    "state",
    "city",
    "address",
    "postal_code",
    "termsAccepted",
  ],
];

const countries = [
  "India",
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Other",
];

const stateOptions = {
  India: [
    "Andhra Pradesh",
    "Delhi",
    "Gujarat",
    "Karnataka",
    "Maharashtra",
    "Tamil Nadu",
    "Telangana",
    "West Bengal",
  ],
  USA: ["California", "Florida", "New York", "Texas", "Washington"],
  UK: ["England", "Scotland", "Wales", "Northern Ireland"],
  Canada: ["Alberta", "British Columbia", "Ontario", "Quebec"],
  Australia: ["New South Wales", "Queensland", "Victoria", "Western Australia"],
  Germany: ["Bavaria", "Berlin", "Hamburg", "Hesse"],
  France: [
    "Ile-de-France",
    "Normandy",
    "Occitanie",
    "Provence-Alpes-Cote d'Azur",
  ],
  Other: ["Other"],
};

const quotes = [
  {
    text: "Chase the vision, not the money; the money will end up following you.",
    author: "Tony Hsieh",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Tony_hsieh.jpg",
  },
  {
    text: "Without continuous personal development, you are now all that you will ever become.",
    author: "Eli Cohen",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/35/Eli_Cohen_1959_Portrait_%283x4_cropped%29.jpg",
  },
];

const inputClassName =
  "w-full rounded-xl md:rounded-[0.85rem] border border-slate-300/80 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition duration-200 placeholder:text-slate-400/90 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15";

const labelClassName = "mb-2 inline-block text-sm font-medium text-slate-700";

function OrganizationRegisterPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [openDocuments, setOpenDocuments] = useState(true);

  const currentStates = useMemo(
    () => stateOptions[formData.country] || [],
    [formData.country],
  );

  const quote = quotes[activeStep] || quotes[0];

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "country" ? { state: "" } : {}),
    }));
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files?.[0] || null,
    }));
  };

  const validateStep = () => {
    const invalidField = stepFields[activeStep].find((field) => {
      if (field === "termsAccepted") {
        return !formData.termsAccepted;
      }

      return !String(formData[field] ?? "").trim();
    });

    if (invalidField) {
      toast.error(
        activeStep === 1
          ? "Please complete all required details and accept the privacy policy."
          : "Please fill all required fields before continuing.",
      );
      return false;
    }

    return true;
  };

  const handleNext = (event) => {
    event.preventDefault();
    if (!validateStep()) return;
    setActiveStep(1);
  };

  const handlePrevious = () => {
    setActiveStep(0);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateStep()) return;

    const payload = {
      ...formData,
      gstFileInput: formData.gstFileInput?.name || null,
      panFileInput: formData.panFileInput?.name || null,
      logoInput: formData.logoInput?.name || null,
    };

    toast.success("Organization registration form is ready.");
    console.log("Organization register payload", payload);
  };

  const renderUploadRow = (name, label, accept) => (
    <div className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          readOnly
          checked={Boolean(formData[name])}
          className="h-4 w-4 rounded border border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
        />
        <span className="text-sm text-slate-700">{label}</span>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
        <CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />
        <span className="max-w-42.5 truncate">
          {formData[name]?.name || "Select file to upload"}
        </span>
        <input
          type="file"
          name={name}
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      <div className="fixed inset-0 hidden lg:block">
        <div className="mx-auto grid h-screen max-w-387.5 grid-cols-12 px-14 xl:px-24 2xl:max-w-387.5">
          <div className="relative col-span-5 h-screen 2xl:col-span-4">
            <div className="absolute inset-y-0 right-0 my-6 hidden w-[800%] -mr-4 rounded-[0_1.2rem_1.2rem_0/0_1.7rem_1.7rem_0] bg-white/50 lg:block" />
            <div className="absolute inset-y-0 right-0 hidden w-[800%] rounded-[0_1.2rem_1.2rem_0/0_1.7rem_1.7rem_0] bg-linear-to-b from-white to-slate-100/80 lg:block" />
          </div>
          <div className="relative col-span-7 min-h-full 2xl:col-span-8">
            <div className="absolute inset-y-0 left-0 w-screen  bg-linear-to-b from-gray-500 via-gray-500 to-indigo-400 lg:w-[800%]" />
            <div className="absolute inset-y-0 left-0 w-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_35%),linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.06)_100%)] lg:w-[800%]" />
            <div className="sticky top-0 z-10 ml-16 hidden h-screen flex-col justify-center lg:flex xl:ml-28 2xl:ml-36">
              <div className="max-w-2xl text-[2.4rem] font-medium leading-[1.35] text-white xl:text-3xl xl:leading-[1.2]">
                {quote.text}
              </div>
              <div className="mt-5 flex items-center text-base leading-relaxed text-white/70 xl:text-lg">
                <img
                  src={quote.image}
                  className="h-7 w-7 rounded-full border border-white object-cover"
                  alt={quote.author}
                />
                <span className="ml-2">~ {quote.author}</span>
              </div>
              <div className="mt-10 text-base text-white/70">
                Over 7k+ strong and growing! Your journey begins here.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 ">
        <div className="ml-0 mr-auto grid grid-cols-12  px-5 py-10 sm:px-10 sm:py-14 md:px-24 lg:min-h-screen lg:max-w-387.5 lg:px-14 lg:py-0 xl:px-24 2xl:max-w-437.5">
          <div className="relative z-50 col-span-12 h-full rounded-2xl bg-white pl-4 pr-6 py-7 sm:pl-6 sm:pr-10 shadow-[0_30px_80px_rgba(15,23,42,0.12)] sm:p-14 lg:col-span-5 lg:bg-transparent lg:p-0 lg:pr-4 lg:shadow-none xl:pr-24 2xl:col-span-4">
            <div className="sidebar-scroll relative z-10 flex w-full flex-col justify-start lg:justify-start overflow-y-auto py-6 lg:h-screen lg:py-16">
              <form onSubmit={activeStep === 0 ? handleNext : handleSubmit}>
                {activeStep === 0 ? (
                  <>
                    <div className="mb-5 ">
                      <img
                        src="/logo.png"
                        alt="SigmaDesk Logo"
                        className="mb-4 h-12 w-auto"
                      />
                      <div className="text-2xl font-medium text-slate-900">
                        Sign Up
                      </div>
                      <div className="mt-1 text-slate-500">
                        Enter the following details to get started.
                      </div>
                    </div>

                    <label className={labelClassName}>
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className={inputClassName}
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                    />

                    <div className="mt-4">
                      <label className={labelClassName}>
                        Organization Name{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        className={inputClassName}
                        placeholder="Enter your organization name"
                        value={formData.organizationName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mt-4">
                      <label className={labelClassName}>
                        Select Model <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="modelSelectionType"
                        className={inputClassName}
                        value={formData.modelSelectionType}
                        onChange={handleChange}
                      >
                        <option value="">Select a model</option>
                        <option value="industry_based">Industry Based</option>
                        <option value="alacarte">AlaCarte Model</option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <label className={labelClassName}>
                        Select your Industry{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="industryType"
                        className={inputClassName}
                        value={formData.industryType}
                        onChange={handleChange}
                      >
                        <option value="">Select an industry</option>
                        <option value="construction">Construction</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="education">Education</option>
                        <option value="others">Others</option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <label className={labelClassName}>
                        Number of Users <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="allowedUsers"
                        className={inputClassName}
                        value={formData.allowedUsers}
                        onChange={handleChange}
                      >
                        <option value="">Select number of users</option>
                        {["10", "50", "100", "250", "500", "1000"].map(
                          (count) => (
                            <option key={count} value={count}>
                              {count}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 text-center xl:text-left">
                      <button
                        type="submit"
                        className="w-full rounded-full bg-gradient-to-r from-sky-600 to-indigo-700 px-3 py-3.5 font-medium text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:opacity-95"
                      >
                        Next
                      </button>
                      <Link to="/login" className="w-full">
                        <button
                          type="button"
                          className="w-full rounded-full border border-slate-300 bg-white px-3 py-3 font-medium text-slate-600 transition duration-200 hover:bg-slate-50"
                        >
                          Already have an account? Sign In
                        </button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="w-full ">
                    <div className="mb-5 ">
                      <img
                        src="/logo.png"
                        alt="SigmaDesk Logo"
                        className="mb-4 h-12 w-auto"
                      />
                      <div className="text-2xl font-medium text-slate-900">
                        Organization Details
                      </div>
                      <div className="mt-1 text-slate-500">
                        Enter your organization details.
                      </div>
                    </div>

                    <div className="space-y-4 pb-10 lg:pb-20">
                      <div>
                        <label className={labelClassName}>
                          First Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="admin_first_name"
                          className={inputClassName}
                          placeholder="Enter first name"
                          value={formData.admin_first_name}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>
                          Last Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="admin_last_name"
                          className={inputClassName}
                          placeholder="Enter last name"
                          value={formData.admin_last_name}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>
                          Contact Number <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="tel"
                          name="adminPhone"
                          maxLength={10}
                          className={inputClassName}
                          placeholder="Enter contact number"
                          value={formData.adminPhone}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>GST Number</label>
                        <input
                          type="text"
                          name="GST"
                          maxLength={15}
                          className={inputClassName}
                          placeholder="Enter GST number (e.g., 22AAAAA0000A1Z5)"
                          value={formData.GST}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>
                          PAN Number <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="PAN"
                          maxLength={10}
                          className={inputClassName}
                          placeholder="Enter PAN number (e.g., ABCDE1234F)"
                          value={formData.PAN}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>
                          Country <span className="text-red-600">*</span>
                        </label>
                        <select
                          name="country"
                          className={inputClassName}
                          value={formData.country}
                          onChange={handleChange}
                        >
                          <option value="">Select Country</option>
                          {countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClassName}>
                          State <span className="text-red-600">*</span>
                        </label>
                        <select
                          name="state"
                          disabled={!formData.country}
                          className={`${inputClassName} ${!formData.country ? "cursor-not-allowed bg-slate-100" : ""}`}
                          value={formData.state}
                          onChange={handleChange}
                        >
                          <option value="">Select State</option>
                          {currentStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClassName}>
                          City <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          className={inputClassName}
                          placeholder="Enter city"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>
                          Address Line 1 <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          className={inputClassName}
                          placeholder="Enter address"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>
                          Postal Code <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          maxLength={10}
                          className={inputClassName}
                          placeholder="Enter postal code"
                          value={formData.postal_code}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>
                          Company Website
                        </label>
                        <input
                          type="text"
                          name="website"
                          className={inputClassName}
                          placeholder="https://example.com"
                          value={formData.website}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="mt-4">
                        <label className={labelClassName}>Documents</label>
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <button
                            type="button"
                            onClick={() => setOpenDocuments((prev) => !prev)}
                            className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50"
                          >
                            <span className="text-sm text-slate-600">
                              Select documents to upload
                            </span>
                            <span className="text-xl text-slate-400">
                              {openDocuments ? "−" : "+"}
                            </span>
                          </button>
                          {openDocuments ? (
                            <div className="divide-y divide-slate-100 border-t border-slate-200">
                              {renderUploadRow(
                                "gstFileInput",
                                "GST Certificate",
                                "image/*,.pdf",
                              )}
                              {renderUploadRow(
                                "panFileInput",
                                "PAN Card",
                                "image/*,.pdf",
                              )}
                              {renderUploadRow(
                                "logoInput",
                                "Company Logo",
                                "image/*",
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-xs text-slate-500 sm:text-sm">
                          <input
                            id="terms"
                            name="termsAccepted"
                            type="checkbox"
                            className="mr-2 h-4 w-4 rounded border border-slate-300"
                            checked={formData.termsAccepted}
                            onChange={handleChange}
                          />
                          <label
                            htmlFor="terms"
                            className="cursor-pointer select-none"
                          >
                            I agree to the SigmaDesk
                          </label>
                          <button
                            type="button"
                            className="ml-1 text-blue-600 hover:underline"
                          >
                            Privacy Policy
                          </button>
                          .
                        </div>
                        {!formData.termsAccepted ? (
                          <p className="mt-1 text-xs text-red-500">
                            Please read the Privacy Policy first by clicking on
                            the Privacy Policy link
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                      <button
                        type="submit"
                        className="w-full rounded-full bg-gradient-to-r from-sky-600 to-indigo-700 px-3 py-3.5 font-medium text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:opacity-95"
                      >
                        Send OTP & Verify
                      </button>
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="w-full rounded-full border border-slate-300 bg-white px-3 py-3 font-medium text-slate-600 transition duration-200 hover:bg-slate-50"
                      >
                        Previous
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("/careers")}
        className="fixed right-5 top-5 z-20 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-blue-700 shadow-md backdrop-blur lg:hidden"
      >
        Careers
      </button>
    </div>
  );
}

export default OrganizationRegisterPage;
