import { redirect } from "next/navigation";

export const metadata = {
  title: "技术 | NeuralFin",
  description: "NeuralFin 连接 AI 工具、社区智能与市场数据。",
};

export default function TechnologyZhPage() {
  redirect("/zh/socialfi#ai-loop");
}
