import { redirect } from "next/navigation";

export const metadata = {
  title: "技术 | NeuralFin",
  description: "NeuralFin 连接 AI 工具、社区智能、市场数据与受监管交易基础设施。",
};

export default function TechnologyZhPage() {
  redirect("/zh/socialfi#ai-loop");
}
