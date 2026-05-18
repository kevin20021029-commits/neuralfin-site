import { redirect } from "next/navigation";

export const metadata = {
  title: "公司 | NeuralFin",
  description: "NeuralFin 正在构建 AI 驱动的金融社区生态系统。",
};

export default function CompanyZhPage() {
  redirect("/zh#company");
}
