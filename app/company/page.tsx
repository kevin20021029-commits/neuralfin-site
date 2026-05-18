import { redirect } from "next/navigation";

export const metadata = {
  title: "Company | NeuralFin",
  description: "NeuralFin is building an AI-powered financial community ecosystem.",
};

export default function CompanyPage() {
  redirect("/#company");
}
