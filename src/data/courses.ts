import { Cpu, BarChart2, Layout, FileText, PlayCircle, Monitor } from 'lucide-react';
import genAiImg from '../assets/images/gen_ai_training_high_res_1790873694909.jpg';
import dataAnalysisImg from '../assets/images/data_analysis_training_high_res_1790873703864.jpg';
import msExcelImg from '../assets/images/ms_office_training_high_res_1790873715447.jpg';
import msWordImg from '../assets/images/ms_office_training_high_res_1790873715447.jpg';
import msPowerpointImg from '../assets/images/ms_office_training_high_res_1790873715447.jpg';
import basicComputingImg from '../assets/images/basic_computing_high_res_1790873752837.jpg';

export interface Course {
  id: string;
  title: string;
  desc: string;
  icon: any;
  price: number;
  image: string;
  features: string[];
}

export const courses: Course[] = [
  {
    id: 'gen-ai',
    title: 'Generative AI',
    desc: 'Master the art of AI prompting and building applications with LLMs.',
    icon: Cpu,
    price: 400,
    image: genAiImg,
    features: ['Gemini API', 'Prompt Engineering', 'AI Agents', 'Image Generation']
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis',
    desc: 'Learn to extract insights using Power BI, modern data tools, and analytics techniques.',
    icon: BarChart2,
    price: 400,
    image: dataAnalysisImg,
    features: ['Statistical Analysis', 'Data Cleaning', 'Visualization', 'Power BI']
  },
  {
    id: 'ms-excel',
    title: 'Microsoft Excel',
    desc: 'From basic formulas to advanced VBA and automation.',
    icon: Layout,
    price: 350,
    image: msExcelImg,
    features: ['Pivot Tables', 'VLOOKUP/XLOOKUP', 'Power Query', 'Macros']
  },
  {
    id: 'ms-word',
    title: 'Microsoft Word',
    desc: 'Professional document creation and advanced formatting.',
    icon: FileText,
    price: 200,
    image: msWordImg,
    features: ['Templates', 'Mail Merge', 'Document Security', 'Styles']
  },
  {
    id: 'ms-powerpoint',
    title: 'Microsoft PowerPoint',
    desc: 'Create stunning and effective presentations that captivate.',
    icon: PlayCircle,
    price: 250,
    image: msPowerpointImg,
    features: ['Slide Design', 'Animations', 'Storytelling', 'Infographics']
  },
  {
    id: 'basic-computing',
    title: 'Basic Computing',
    desc: 'Essential skills for the digital world. Perfect for beginners.',
    icon: Monitor,
    price: 250,
    image: basicComputingImg,
    features: ['OS Navigation', 'Internet Safety', 'File Management', 'Hardware Basics']
  }
];
