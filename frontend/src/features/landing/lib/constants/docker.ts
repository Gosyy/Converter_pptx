export const dockerCommands = [
  "git clone https://github.com/aklyue/AIFixed.git",
  "cd AIFixed",
  "cp backend/.env.example backend/.env",
  "cp frontend/.env.example frontend/.env",
  "docker-compose up --build",
];
