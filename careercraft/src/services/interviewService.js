
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const interviewAPI = axios.create({
  baseURL: `${API_URL}/interviews`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Get authentication token
function getAuthConfig() {
  const token = sessionStorage.getItem("careerCraftToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

// 1. Get interview questions
export async function getInterviewQuestions(filters = {}) {
  const response = await interviewAPI.get("/questions", {
    ...getAuthConfig(),
    params: filters,
  });

  return response.data;
}

// 2. Create interview session
export async function createInterviewSession(sessionData) {
  const response = await interviewAPI.post(
    "/sessions",
    sessionData,
    getAuthConfig()
  );

  return response.data;
}

// 3. Get interview session history
export async function getInterviewSessions() {
  const response = await interviewAPI.get(
    "/sessions",
    getAuthConfig()
  );

  return response.data;
}

// 4. Get individual session details
export async function getInterviewSessionById(sessionId) {
  const response = await interviewAPI.get(
    `/sessions/${sessionId}`,
    getAuthConfig()
  );

  return response.data;
}

// 5. Save or update an answer
export async function saveInterviewAnswer(sessionId, answerData) {
  const response = await interviewAPI.post(
    `/sessions/${sessionId}/answers`,
    answerData,
    getAuthConfig()
  );

  return response.data;
}

// 6. Complete interview session
export async function completeInterviewSession(sessionId) {
  const response = await interviewAPI.patch(
    `/sessions/${sessionId}/complete`,
    {},
    getAuthConfig()
  );

  return response.data;
}

// 7. Get interview progress
export async function getInterviewProgress() {
  const response = await interviewAPI.get(
    "/progress",
    getAuthConfig()
  );

  return response.data;
}
