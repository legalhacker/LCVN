import { execSync } from "child_process";

export default function globalSetup() {
  console.log("Running migrations and seed...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  execSync("npm run db:seed", { stdio: "inherit" });
  console.log("Global setup complete.");
}
