import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';

export interface Feature {
    title: string;
    description: string;
    icon: ReactNode;
    color: string;
    borderColor: string;
    bgLight: string;
    iconColor: string;
    path: string;
}

export const FeatureCard = ({ feature, idx }: { feature: Feature, idx: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1 * idx, duration: 0.5, ease: "easeOut" }}
            className={`flex flex-col items-start p-6 rounded-3xl bg-white dark:bg-slate-900/80 backdrop-blur-sm border ${feature.borderColor} shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300 hover:-translate-y-2`}
        >
            <div className={`p-4 rounded-2xl ${feature.bgLight} ${feature.iconColor} mb-6`}>
                {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
            <p className="text-gray-600 dark:text-slate-400 text-base leading-relaxed mb-6 flex-1">
                {feature.description}
            </p>
            <Link
                to={feature.path}
                className={`font-semibold text-sm px-5 py-2.5 rounded-full border transition-colors duration-300`}
                style={{
                    borderColor: feature.color,
                    color: feature.color,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = feature.color;
                    e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = feature.color;
                }}
            >
                Khám Phá
            </Link>
        </motion.div>
    );
};
