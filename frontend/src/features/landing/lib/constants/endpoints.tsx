import DockerIcon from "@mui/icons-material/SettingsApplications";
import WebIcon from "@mui/icons-material/Web";
import ApiIcon from "@mui/icons-material/DeveloperMode";

export const endpoints = [
  {
    label: "1",
    text: "http://localhost:3000",
    heading: "Frontend",
    icon: <WebIcon fontSize="large" color="primary" />,
  },
  {
    label: "2",
    text: "http://localhost:8000",
    heading: "Backend API",
    icon: <ApiIcon fontSize="large" color="primary" />,
  },
  {
    label: "3",
    text: "http://localhost:8000/docs",
    heading: "API Docs",
    icon: <DockerIcon fontSize="large" color="primary" />,
  },
];
