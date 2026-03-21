import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import FormLabel from '@/components/FormLabel';

interface DateInputProps {
  label: string;
  value: string | Date;
  onChange: (date: Date | null) => void;
  helperText?: string; 
}

export default function DateInput({ label, value, onChange, helperText }: DateInputProps) {
  const selectedDate = value ? new Date(value) : null;

  return (
    <div className="space-y-1.5 text-left group">
      {/* Header matching FormInput */}
      <div className="flex items-baseline justify-between">
        <FormLabel>{label}</FormLabel>
        {helperText && (
          <span className="text-[9px] font-medium text-slate-300 lowercase italic">
            {helperText}
          </span>
        )}
      </div>

      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={onChange}
          dateFormat="MMM dd, yyyy"
          popperPlacement="bottom-start"
          onFocus={(e) => e?.target?.blur()}
          onChangeRaw={(e) => e?.preventDefault()}
          autoComplete="off"
          calendarClassName="custom-clean-datepicker"
          dayClassName={(_date) => 
            "hover:!bg-blue-50 hover:!text-blue-600 !rounded-lg !transition-all !duration-200 !text-[12px] !font-medium"
          }
          className="
            w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl 
            text-sm text-slate-600 placeholder:text-slate-300
            hover:border-slate-200 focus:bg-white focus:border-blue-400 
            focus:ring-4 focus:ring-blue-500/5 outline-none 
            transition-all duration-200
            cursor-pointer
          "
          wrapperClassName="w-full"
        />
      </div>

      <style>{`
        .custom-clean-datepicker {
          border: none !important;
          box-shadow: 0 20px 60px -15px rgba(0,0,0,0.25) !important;
          border-radius: 12px !important;
          padding: 8px !important;
          background-color: white !important;
          margin-top: 8px !important;
          z-index: 50;
        }
        .react-datepicker__triangle { display: none !important; }
        .react-datepicker__header { background: white !important; border: none !important; padding-top: 10px !important; }
        .react-datepicker__current-month { 
            font-size: 11px !important; 
            text-transform: uppercase !important; 
            letter-spacing: 0.1em !important;
            color: #3b82f6 !important; 
            font-weight: 900 !important; 
        }
        .react-datepicker__day--selected { 
            background-color: #3b82f6 !important; 
            border-radius: 6px !important; 
            box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3) !important;
        }
        .react-datepicker__day { width: 2.2rem !important; line-height: 2.2rem !important; }
      `}</style>
    </div>
  );
}