import React from 'react';
import { Search } from 'lucide-react';

interface SearchFilterProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  extra?: React.ReactNode;
}

export default function SearchFilter({ placeholder = '搜索...', value, onChange, extra }: SearchFilterProps) {
  return (
    <div className="dae-filter-bar">
      <div className="dae-search-box">
        <Search size={16} />
        <input
          className="dae-input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {extra}
    </div>
  );
}
