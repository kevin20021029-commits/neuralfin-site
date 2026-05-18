import { NeuralFinLanding } from "@/components/NeuralFinLanding";

export const metadata = {
  title: "NeuralFin | 为滑屏一代而生",
  description: "NeuralFin 是 AI 原生社交交易平台，连接金融内容、社区学习、市场数据与受监管行动。",
  openGraph: {
    title: "NeuralFin | 为滑屏一代而生",
    description: "AI 原生社交交易平台，将移动端注意力转化为金融学习、社区智能与受监管行动。",
  },
  twitter: {
    title: "NeuralFin | 为滑屏一代而生",
    description: "AI 原生社交交易平台，将移动端注意力转化为金融学习、社区智能与受监管行动。",
  },
};

export default function Page() {
  return <NeuralFinLanding locale="zh" />;
}
