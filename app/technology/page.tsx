import { redirect } from "next/navigation";

export const metadata = {
  title: "Technology | NeuralFin",
  description: "NeuralFin combines AI-enabled tools, community intelligence, market data, and regulated trading infrastructure.",
};

export default function TechnologyPage() {
  redirect("/socialfi#ai-loop");
}
