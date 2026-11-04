
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const resumeAPI = axios.create({
  baseURL: API_URL,
});

// Analyze resume against a job description
export async function analyzeResume(resumeFile, jobDescription) {
  const token = sessionStorage.getItem("careerCraftToken");

  if (!token) {
    throw new Error("Please log in to analyze your resume.");
  }

  const formData = new FormData();

  formData.append("resume", resumeFile);
  formData.append("jobDescription", jobDescription);

  const response = await resumeAPI.post("/resume/analyze", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
