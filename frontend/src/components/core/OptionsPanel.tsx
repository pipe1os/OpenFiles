import React from "react";

interface OptionsPanelProps {
  selectedType: string | null;
  selectedFormat: string | null;
  options: { [key: string]: any };
  onOptionChange: (newOptions: { [key: string]: any }) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
  selectedType,
  selectedFormat,
  options,
  onOptionChange,
}) => {
  const renderJpgOptions = () => (
    <div>
      <label
        htmlFor="jpgQuality"
        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        JPG Quality ({options.quality ?? 80}%)
      </label>
      <input
        id="jpgQuality"
        type="range"
        min="10"
        max="100"
        value={options.quality ?? 80}
        onChange={(e) =>
          onOptionChange({ quality: parseInt(e.target.value, 10) })
        }
        className="range range-primary range-sm w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-600"
        aria-label="Adjust JPG quality"
      />
    </div>
  );

  const renderContent = () => {
    if (selectedType === "image" && selectedFormat === "jpg") {
      return renderJpgOptions();
    }

    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No specific options available for this format.
      </p>
    );
  };

  if (!selectedType || !selectedFormat) {
    return (
      <div className="min-h-[50px] rounded-md border border-gray-600 bg-gray-100 p-4 dark:bg-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select type and format to see options.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-md border bg-gray-50 p-4 dark:bg-gray-700/50">
      <h3 className="mb-3 border-b pb-2 text-lg font-medium text-gray-900 dark:border-gray-600 dark:text-gray-200">
        Conversion Options
      </h3>
      {renderContent()}
    </div>
  );
};

export default OptionsPanel;
