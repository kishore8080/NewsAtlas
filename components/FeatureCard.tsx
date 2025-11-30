import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    linkText: string;
    linkHref: string;
    iconColorClass?: string;
    iconBgClass?: string;
    linkColorClass?: string;
}

export default function FeatureCard({
    icon: Icon,
    title,
    description,
    linkText,
    linkHref,
    iconColorClass = "text-blue-600",
    iconBgClass = "bg-blue-100",
    linkColorClass = "text-blue-600"
}: FeatureCardProps) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${iconBgClass} rounded-lg flex items-center justify-center mb-6`}>
                <Icon className={`w-6 h-6 ${iconColorClass}`} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">
                {title}
            </h3>

            <p className="text-gray-600 mb-8 leading-relaxed">
                {description}
            </p>

            <Link
                href={linkHref}
                className={`inline-flex items-center gap-1 ${linkColorClass} font-semibold hover:gap-2 transition-all`}
            >
                {linkText}
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
