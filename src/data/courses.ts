import { Cpu, BarChart2, Layout, FileText, PlayCircle, Monitor } from 'lucide-react';
import genAiImg from '../assets/images/gen_ai_course_1790441828237.jpg';
import dataAnalysisImg from '../assets/images/data_analysis_course_1790441840563.jpg';
import msExcelImg from '../assets/images/ms_excel_course_1790441853787.jpg';
import msWordImg from '../assets/images/ms_word_course_1790441865892.jpg';
import msPowerpointImg from '../assets/images/ms_powerpoint_course_1790441879408.jpg';
import basicComputingImg from '../assets/images/basic_computing_course_1790441895421.jpg';

export const courses = [
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
