import React from 'react';

// Added 'errors' property to access validation state from useForm
const SelectField = ({ label, name, options, register, errors }) => {
  
  // Determine if there is a validation error for this field
  const hasError = errors && errors[name];

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <select
        {...register(name,  { required: true })}
        // Conditionally set border style based on error state
        className={`w-full p-2 border rounded-md 
          ${hasError 
            ? 'border-red-500 focus:ring-red-500' // Red border and ring on error
            : 'border-gray-300 focus:ring-blue-500' // Default blue ring
          } 
          focus:outline-none focus:ring focus:border-blue-300`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Display error message if validation fails */}
      {hasError && (
        <p className="mt-1 text-xs text-red-500">
          Please select a valid {label.toLowerCase()}.
        </p>
      )}
    </div>
  );
};

export default SelectField;