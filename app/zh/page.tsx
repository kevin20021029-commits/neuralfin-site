import { NeuralFinLanding } from "@/components/NeuralFinLanding";

export const metadata = {
  title: "NeuralFin | 为刷屏一代而生",
  description: "NeuralFin 是 AI 原生平台，连接金融内容、社区学习与市场数据。",
  openGraph: {
    title: "NeuralFin | 为刷屏一代而生",
    description: "AI 原生平台，将移动端注意力转化为金融学习与社区智能。",
  },
  twitter: {
    title: "NeuralFin | 为刷屏一代而生",
    description: "AI 原生平台，将移动端注意力转化为金融学习与社区智能。",
  },
};

export default function Page() {
  return <NeuralFinLanding locale="zh" />;
}
