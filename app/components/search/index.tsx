interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}



const SearchBox = ({
  value,
  onChange,
  placeholder = 'Search',
  ariaLabel = 'Search',
  className = '',
}: SearchBoxProps) => {
  return (
    <div
      className={`relative min-w-0 flex items-stretch w-full ${className}`}
    >
      {/* Icon */}
      <div className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none left-3">
        
      </div>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="flex-1 min-w-0 w-43.25 z-10 bg-card-bg border-[0.5px] border-[#D1D5DB] text-[#374151] placeholder:text-[#9CA3AF] outline-none transition-colors duration-150 max-h-8 min-h-9 h-auto rounded-[10px] pl-3.75 hover:border-[#D1D5DB] hover:bg-[#fafaf9] focus:bg-card-bg focus:outline-none focus:ring-0 text-sm"
        style={{ outline: 'none' }}
      />
    </div>
  );
};

export default SearchBox;
