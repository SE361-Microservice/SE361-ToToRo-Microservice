interface FormDividerProps {
  label?: string;
  bg?: string;
}

export default function FormDivider({ label = 'Hoặc', bg = 'bg-surface-container-lowest' }: FormDividerProps) {
  return (
    <div className="relative my-8 text-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-outline-variant/30" />
      </div>
      <span className={`relative px-4 ${bg} text-xs font-bold text-outline uppercase tracking-widest font-label`}>
        {label}
      </span>
    </div>
  );
}
