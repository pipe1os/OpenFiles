import React from "react";
import {
  ConversionOption,
  conversionTypes,
} from "../../config/conversionTypes";

interface ConversionSelectorProps {
  availableTypes: string[];
  availableFormats: ConversionOption[];
  selectedType: string | null;
  selectedFormat: string | null;
  onTypeChange: (type: string | null) => void;
  onFormatChange: (format: string | null) => void;
}

const ConversionSelector: React.FC<ConversionSelectorProps> = ({
  availableTypes,
  availableFormats,
  selectedType,
  selectedFormat,
  onTypeChange,
  onFormatChange,
}) => {
  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    setter: (value: string | null) => void,
  ) => {
    const value = event.target.value;
    setter(value === "" ? null : value);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label
          htmlFor="conversionType"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Conversion Type
        </label>
        <select
          id="conversionType"
          name="conversionType"
          value={selectedType ?? ""}
          onChange={(e) => handleSelectChange(e, onTypeChange)}
          className={`select select-bordered w-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
            selectedType === null ? "dark:text-gray-400" : ""
          }`}
          aria-label="Select conversion type"
        >
          <option value="" disabled className="dark:text-gray-400">
            -- Select a type --
          </option>
          {availableTypes.map((typeValue) => {
            const category = conversionTypes.find(
              (cat) => cat.value === typeValue,
            );
            return (
              <option key={typeValue} value={typeValue}>
                {category ? category.label : typeValue}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label
          htmlFor="outputFormat"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Output Format
        </label>
        <select
          id="outputFormat"
          name="outputFormat"
          value={selectedFormat ?? ""}
          onChange={(e) => handleSelectChange(e, onFormatChange)}
          disabled={!selectedType}
          className={`select select-bordered w-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
            selectedFormat === null ? "dark:text-gray-400" : ""
          } ${!selectedType ? "disabled:dark:text-gray-500" : ""}`}
          aria-label="Select output format"
        >
          <option value="" disabled className="dark:text-gray-400">
            -- Select a format --
          </option>
          {availableFormats.map((format) => (
            <option key={format.value} value={format.value}>
              {format.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ConversionSelector;
