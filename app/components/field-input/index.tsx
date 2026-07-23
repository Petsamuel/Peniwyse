'use client'

interface FieldInputProps {
    placeholder: string
    value: string | null | undefined
    onChange: (v: string) => void
    type?: 'text' | 'date' | 'email' | 'number' | 'tel'
    maxLength?: number
    isNumeric?: boolean
    description?: string
}

function FieldInput({
    placeholder,
    value,
    onChange,
    type = 'text',
    maxLength,
    isNumeric = false,
    description,
}: FieldInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value
        if (isNumeric) val = val.replace(/\D/g, '')
        if (maxLength && val.length > maxLength) return
        onChange(val)
    }

    const isRequired = placeholder.includes('*')
    const label = placeholder.replace('*', '').trim()

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[10px] font-bold text-muted-theme uppercase tracking-wider ml-1">
                {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value ?? ''}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 text-sm text-foreground bg-card-bg border border-border-theme rounded-xl outline-none focus:border-[#185fa5] focus:ring-4 focus:ring-[#185fa5]/5 transition-all placeholder:text-muted-theme/50"
            />
            {description && (
                <p className="text-[10px] font-medium text-muted-theme ml-1 italic">
                    {description}
                </p>
            )}
        </div>
    )
}

export default FieldInput