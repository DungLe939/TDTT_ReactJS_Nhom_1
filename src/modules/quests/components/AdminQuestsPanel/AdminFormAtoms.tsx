import { useState } from 'react';
import { ChevronDown, AlertCircle, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';


export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">
            {children}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
    );
}

export function QInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5
        text-sm text-neutral-800 placeholder:text-neutral-400
        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all
        ${props.className ?? ''}`}
        />
    );
}

export function QTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            rows={props.rows ?? 3}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5
        text-sm text-neutral-800 placeholder:text-neutral-400 resize-none
        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
    );
}

export function QSelect({ value, onChange, options, placeholder }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string; meta?: string }[];
    placeholder?: string;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-xl
          px-3 py-2.5 pr-8 text-sm text-neutral-800
          focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
          transition-all cursor-pointer"
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(o => (
                    <option key={o.value} value={o.value}>
                        {o.label}{o.meta ? ` · ${o.meta}` : ''}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
    );
}

export function StatusBanner({ type, message }: { type: 'success' | 'error'; message: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm font-medium
        ${type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {message}
        </motion.div>
    );
}

export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 hover:text-orange-500 transition-colors shrink-0"
        >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
}
