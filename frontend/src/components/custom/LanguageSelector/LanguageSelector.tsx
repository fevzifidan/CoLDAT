import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  onLanguageChange?: (lang: string) => void;
}

// Config and Hook
import { AVAILABLE_LANGUAGES, getFlagUrl, getFlagSrcSet } from './config/languageConfig';
import { useLanguage } from './hooks/useLanguage';

export default function LanguageSelector({ 
  onLanguageChange, 
  className,
  ...props
}: LanguageSelectorProps) {
  const { currentLanguage, changeLanguage, t } = useLanguage(onLanguageChange);

  const selectedLang = AVAILABLE_LANGUAGES.find(l => l.code === currentLanguage);

  return (
    // We merge default classes with classes coming from outside by using cn()
    <div className={cn("flex flex-col gap-1.5 w-full max-w-[200px]", className)} {...props}>
      <Select 
        value={currentLanguage} 
        onValueChange={(value) => changeLanguage(value)}
      >
        <SelectTrigger id="language-select" className="w-full h-10">
          <SelectValue>
            {selectedLang && (
              <div className="flex items-center gap-2">
                <img 
                  src={getFlagUrl(selectedLang.countryCode)} 
                  alt={selectedLang.alt}
                  className="w-5 h-3.5 object-cover rounded-sm"
                />
                <span className="truncate">{selectedLang.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {AVAILABLE_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <img 
                  loading="lazy"
                  src={getFlagUrl(lang.countryCode)}
                  srcSet={getFlagSrcSet(lang.countryCode)}
                  alt={lang.alt}
                  className="w-5 h-3.5 object-cover rounded-sm"
                />
                <span className="text-sm">{lang.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}