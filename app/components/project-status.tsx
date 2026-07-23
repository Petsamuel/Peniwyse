import Image from "next/image";
import { MdMoreVert } from 'react-icons/md';

interface ProjectStatusProps {
  title: string;
  description: string;
  logo: React.ReactNode;
  logoBg: string; // e.g., "bg-[#252f40]" for the Slack dark background
  participants: number;
  dueDate: string;
  avatars: string[];
}

const ProjectStatusCard = ({ project }: { project: ProjectStatusProps }) => (
  <div className="relative bg-card-bg rounded-3xl shadow-xl border border-border-theme px-4 pb-4 pt-2 flex flex-col h-full mt-3">
    
    {/* 1. Floating Logo - Absolute positioned to overflow top */}
    <div className={`absolute -top-6 left-6 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl ${project.logoBg}`}>
      {project.logo}
    </div>

    {/* 2. Top Header - Aligned to the right of the logo */}
    <div className="flex justify-between items-start">
      <div className="pl-20"> {/* Offset to make room for absolute logo */}
        <h4 className="text-foreground font-bold text-base leading-tight">{project.title}</h4>
        <div className="flex -space-x-2">
          {project.avatars.map((url, i) => (
            <div key={i} className="w-6 h-6 rounded-full border border-white overflow-hidden shadow-sm">
              <Image src={url} alt="avatar" width={24} height={24} className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      <button className="text-[#8392AB] hover:text-foreground transition-colors p-1">
        <MdMoreVert size={24} />
      </button>
    </div>

    {/* 3. Description */}
    <p className="text-[#a0aabf] text-sm leading-relaxed grow px-2">
      {project.description}
    </p>

    {/* 4. Horizontal Divider */}
    <hr className="border-border-theme mb-3" />

    {/* 5. Footer Metadata */}
    <div className="flex justify-between items-center px-2">
      <div className="flex flex-col">
        <span className="text-foreground font-bold text-base">{project.participants}</span>
        <span className="text-[#8392AB] text-xs font-medium">Participants</span>
      </div>
      <div className="flex flex-col text-right">
        <span className="text-foreground font-bold text-base">{project.dueDate}</span>
        <span className="text-[#8392AB] text-xs font-medium">Due date</span>
      </div>
    </div>
  </div>
);

export default ProjectStatusCard;